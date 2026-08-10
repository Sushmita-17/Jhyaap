from fastapi import APIRouter, HTTPException, status, Request
import uuid
from datetime import datetime, timedelta

from app.core.config import settings
from app.core.security import create_access_token, verify_password, get_password_hash
from app.db.database import fetch_rider_by_phone, get_connection, is_postgres
from app.models.auth import (
    RequestOTPPayload,
    RequestOTPResponse,
    VerifyOTPPayload,
    VerifyOTPResponse,
    RiderLogin,
    RiderLoginResponse,
    RiderResponse,
    AdminLogin,
    AdminLoginResponse,
    PasswordResetRequest,
    PasswordResetVerify,
    PasswordResetResponse,
)
from app.services import otp_service
from app.services.sms_service import SMSDeliveryError, send_otp_sms
from app.middleware.rate_limiter import limiter, get_rate_limit

router = APIRouter(prefix="/auth", tags=["auth"])


async def check_monthly_user_limit() -> bool:
    """Check if monthly user limit has been reached"""
    try:
        from app.db.supabase_client import get_supabase_client
        supabase = get_supabase_client()
        
        # Get current month start
        now = datetime.now()
        month_start = datetime(now.year, now.month, 1).isoformat()
        
        # Count users created this month
        result = supabase.table("customers").select("id", count="exact").gte("created_at", month_start).execute()
        
        monthly_count = result.count if hasattr(result, 'count') else len(result.data)
        return monthly_count < settings.MAX_MONTHLY_USERS
    except Exception as e:
        print(f"Monthly user limit check failed: {e}, allowing user creation")
        return True  # Allow user creation if check fails


@router.post("/request-otp", response_model=RequestOTPResponse)
async def request_otp(payload: RequestOTPPayload):
    phone = payload.phone_number

    if await otp_service.is_on_cooldown(phone):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Please wait before requesting another code.",
        )

    code = otp_service.generate_otp_code()
    await otp_service.store_otp(phone, code)

    # Log OTP to console in mock mode for easier testing
    if settings.OTP_MODE == "mock":
        from app.services.otp_service import _normalize_phone_number
        normalized_phone = _normalize_phone_number(phone)
        print(f"🔓 MOCK OTP CODE for {normalized_phone}: {code}")

    try:
        await send_otp_sms(phone, code)
    except SMSDeliveryError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not send verification code. Please try again shortly.",
        )

    return RequestOTPResponse(
        message="Verification code sent.",
        # Only leaks the code in mock mode - never in real sparrow/production mode
        debug_otp_code=code if settings.OTP_MODE == "mock" else None,
    )


@router.post("/verify-otp", response_model=VerifyOTPResponse)
async def verify_otp(payload: VerifyOTPPayload):
    print(f"🔍 Verify OTP Request - Phone: {payload.phone_number}, Code: {payload.otp_code}")
    success, reason = await otp_service.verify_otp(payload.phone_number, payload.otp_code)
    print(f"🔍 OTP Verification Result - Success: {success}, Reason: {reason}")

    if not success:
        messages = {
            "expired_or_not_found": "Code expired or not found. Please request a new one.",
            "too_many_attempts": "Too many incorrect attempts. Please request a new code.",
            "incorrect": "Incorrect verification code.",
        }
        error_detail = messages.get(reason, "Verification failed.")
        print(f"🔍 Returning error: {error_detail}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_detail,
        )

    # Check if customer exists in Supabase, create if new
    try:
        from app.db.supabase_client import get_supabase_client
        supabase = get_supabase_client()
        
        # Check for existing customer
        print(f"🔍 Checking for existing customer with phone: {payload.phone_number}")
        existing_customer = supabase.table("customers").select("*").eq("phone_number", payload.phone_number).execute()
        print(f"🔍 Existing customer result: {existing_customer.data if existing_customer.data else 'No data'}")
        
        if existing_customer.data:
            # Customer exists
            customer = existing_customer.data[0]
            is_new_user = False
            customer_id = customer["id"]
            print(f"🔍 Existing customer found: {customer_id}")
        else:
            # Check monthly user limit before creating new customer
            if not await check_monthly_user_limit():
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Monthly user limit of {settings.MAX_MONTHLY_USERS} has been reached. Please try again next month."
                )
            
            # Create new customer - will complete profile later
            customer_id = str(uuid.uuid4())
            new_customer = {
                "id": customer_id,
                "name": "Customer",  # Will be updated during profile completion
                "phone_number": payload.phone_number,
                "password_hash": "",  # Will be set during profile completion
            }
            print(f"🔍 Creating new customer: {customer_id}")
            supabase.table("customers").insert(new_customer).execute()
            is_new_user = True
            print(f"🔍 New customer created successfully - awaiting profile completion")

        token = create_access_token(subject=customer_id)
        return VerifyOTPResponse(access_token=token, customer_id=customer_id, is_new_user=is_new_user)
    except HTTPException:
        raise
    except Exception as e:
        # Fallback to local storage if Supabase fails
        print(f"Supabase customer operation failed: {e}, using fallback")
        
        # Generate a simple customer ID for fallback
        customer_id = str(uuid.uuid4())
        is_new_user = True
        
        token = create_access_token(subject=customer_id)
        return VerifyOTPResponse(access_token=token, customer_id=customer_id, is_new_user=is_new_user)



def fetch_admin_by_email(email: str):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        placeholder = "%s" if is_postgres(conn) else "?"
        cursor.execute(f"SELECT * FROM admin_users WHERE lower(email) = lower({placeholder})", (email.strip(),))
        row = cursor.fetchone()
        if not row:
            return None
        if isinstance(row, dict):
            return dict(row)
        columns = [column[0] for column in cursor.description]
        return dict(zip(columns, row))
    finally:
        cursor.close()
        conn.close()


@router.post("/admin-login", response_model=AdminLoginResponse)
def admin_login(request: Request, payload: AdminLogin):
    print(f"Admin login attempt - Email: {payload.email}")
    admin = fetch_admin_by_email(payload.email)
    print(f"Admin found: {admin is not None}")
    if not admin or not admin.get("is_active", True):
        print(f"Admin not found or inactive: {admin}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin email or password.")
    print(f"Checking password for admin: {admin.get('email')}")
    if not verify_password(payload.password, admin.get("password_hash") or ""):
        print(f"Password verification failed")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin email or password.")
    print(f"Password verified successfully")
    token = create_access_token(subject=admin["id"])
    admin.pop("password_hash", None)
    print(f"Returning admin data: {admin}")
    return {"access_token": token, "token_type": "bearer", "admin": admin}
@router.post("/rider-login", response_model=RiderLoginResponse)
@limiter.limit(get_rate_limit("auth"))
async def rider_login(request: Request, payload: RiderLogin):
    """
    Rider credential-based authentication.
    Validates phone number and password against rider_credentials table.
    Returns JWT token and rider profile.
    Rate limited to 5 requests per minute to prevent brute force attacks.
    """
    # Normalize phone number - try both with and without +977 prefix
    phone_number = payload.phone_number.strip()
    rider = fetch_rider_by_phone(phone_number)
    
    # If not found with +977 prefix, try without it
    if not rider and phone_number.startswith('+977'):
        phone_number = phone_number[4:]  # Remove +977 prefix
        rider = fetch_rider_by_phone(phone_number)
    
    # If still not found, try adding +977 prefix
    if not rider and not phone_number.startswith('+977'):
        phone_number = '+977' + phone_number
        rider = fetch_rider_by_phone(phone_number)
    
    if not rider:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid phone number or password."
        )
    
    # Check if rider is active
    if rider.get("status") != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Rider account is {rider.get('status')}. Please contact admin."
        )
    
    # Verify password
    if not verify_password(payload.password, rider.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid phone number or password."
        )
    
    # Create JWT token
    token = create_access_token(subject=rider["id"])
    
    # Return rider data without password hash
    rider_response = RiderResponse(
        id=rider["id"],
        phone_number=rider["phone_number"],
        name=rider.get("name"),
        vehicle_type=rider.get("vehicle_type"),
        status=rider["status"],
        total_earnings=rider.get("total_earnings", 0)
    )
    
    return RiderLoginResponse(
        access_token=token,
        token_type="bearer",
        rider=rider_response
    )


@router.post("/password-reset-request", response_model=RequestOTPResponse)
async def password_reset_request(payload: PasswordResetRequest):
    """Request OTP for password reset"""
    phone = payload.phone_number

    # Check if customer exists
    try:
        from app.db.supabase_client import get_supabase_client
        supabase = get_supabase_client()
        
        existing_customer = supabase.table("customers").select("*").eq("phone_number", phone).execute()
        
        if not existing_customer.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No account found with this phone number."
            )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Supabase customer check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify account."
        )

    if await otp_service.is_on_cooldown(phone):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Please wait before requesting another code.",
        )

    code = otp_service.generate_otp_code()
    await otp_service.store_otp(phone, code)

    # Log OTP to console in mock mode for easier testing
    if settings.OTP_MODE == "mock":
        from app.services.otp_service import _normalize_phone_number
        normalized_phone = _normalize_phone_number(phone)
        print(f"🔓 PASSWORD RESET OTP CODE for {normalized_phone}: {code}")

    try:
        await send_otp_sms(phone, code)
    except SMSDeliveryError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not send verification code. Please try again shortly.",
        )

    return RequestOTPResponse(
        message="Password reset code sent.",
        debug_otp_code=code if settings.OTP_MODE == "mock" else None,
    )


@router.post("/password-reset-verify", response_model=PasswordResetResponse)
async def password_reset_verify(payload: PasswordResetVerify):
    """Verify OTP and reset password"""
    print(f"🔍 Password Reset Request - Phone: {payload.phone_number}, Code: {payload.otp_code}")
    
    success, reason = await otp_service.verify_otp(payload.phone_number, payload.otp_code)
    print(f"🔍 OTP Verification Result - Success: {success}, Reason: {reason}")

    if not success:
        messages = {
            "expired_or_not_found": "Code expired or not found. Please request a new one.",
            "too_many_attempts": "Too many incorrect attempts. Please request a new code.",
            "incorrect": "Incorrect verification code.",
        }
        error_detail = messages.get(reason, "Verification failed.")
        print(f"🔍 Returning error: {error_detail}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_detail,
        )

    # Update customer password
    try:
        from app.db.supabase_client import get_supabase_client
        supabase = get_supabase_client()
        
        # Find customer by phone number
        existing_customer = supabase.table("customers").select("*").eq("phone_number", payload.phone_number).execute()
        
        if not existing_customer.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No account found with this phone number."
            )
        
        customer = existing_customer.data[0]
        customer_id = customer["id"]
        
        # Update password
        new_password_hash = get_password_hash(payload.new_password)
        supabase.table("customers").update({"password_hash": new_password_hash}).eq("id", customer_id).execute()
        
        print(f"🔍 Password updated successfully for customer: {customer_id}")
        
        return PasswordResetResponse(
            message="Password reset successful. You can now login with your new password.",
            success=True
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Password reset failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reset password. Please try again."
        )

