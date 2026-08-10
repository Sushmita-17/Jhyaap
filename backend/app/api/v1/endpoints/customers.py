import uuid
import random
from typing import Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, status, Request, Depends

from app.core.security import get_password_hash, verify_password, create_access_token
from app.db.database import get_connection, is_postgres
from app.models.customer import (
    CustomerCreate, CustomerLogin, CustomerOTPRequest, CustomerOTPVerify,
    CustomerUpdate, CustomerPasswordChange, CustomerPasswordReset, CustomerProfileComplete, CustomerResponse, CustomerLoginResponse, OTPResponse
)
from app.middleware.rate_limiter import limiter, get_rate_limit
from app.middleware.auth import get_current_customer

router = APIRouter(prefix="/customers", tags=["customers"])
@router.get("", response_model=list[CustomerResponse])
@limiter.limit(get_rate_limit("admin"))
def list_customers(request: Request):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, name, phone_number, email, address, created_at, updated_at FROM customers ORDER BY created_at DESC")
        rows = cursor.fetchall()
        if rows and isinstance(rows[0], dict):
            return [dict(row) for row in rows]
        columns = [col[0] for col in cursor.description]
        return [dict(zip(columns, row)) for row in rows]
    finally:
        cursor.close()
        conn.close()


def generate_otp() -> str:
    """Generate a 6-digit OTP code"""
    return str(random.randint(100000, 999999))


def fetch_customer_by_phone(phone_number: str) -> Optional[dict]:
    """Fetch a customer by phone number"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        if is_postgres(conn):
            cursor.execute(
                "SELECT * FROM customers WHERE phone_number = %s",
                (phone_number,)
            )
        else:
            cursor.execute(
                "SELECT * FROM customers WHERE phone_number = ?",
                (phone_number,)
            )
        
        row = cursor.fetchone()
        if row:
            if isinstance(row, dict):
                return dict(row)
            else:
                # For SQLite, convert to dict
                columns = [col[0] for col in cursor.description]
                return dict(zip(columns, row))
        return None
    finally:
        cursor.close()
        conn.close()


def fetch_customer_by_id(customer_id: str) -> Optional[dict]:
    """Fetch a customer by ID - tries Supabase first, then local database"""
    print(f"🔍 Fetching customer by ID: {customer_id}")
    
    # Try Supabase first
    try:
        from app.db.supabase_client import get_supabase_client
        supabase = get_supabase_client()
        
        result = supabase.table('customers').select('*').eq('id', customer_id).execute()
        print(f"🔍 Supabase result: {result.data if result.data else 'No data'}")
        if result.data:
            print(f"✓ Fetched customer {customer_id} from Supabase")
            return result.data[0]
    except Exception as e:
        print(f"Supabase customer fetch failed: {e}, using local database")
    
    # Fallback to local database
    print(f"🔍 Trying local database...")
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        if is_postgres(conn):
            cursor.execute(
                "SELECT * FROM customers WHERE id = %s",
                (customer_id,)
            )
        else:
            cursor.execute(
                "SELECT * FROM customers WHERE id = ?",
                (customer_id,)
            )
        
        row = cursor.fetchone()
        print(f"🔍 Local database result: {row}")
        if row:
            if isinstance(row, dict):
                return dict(row)
            else:
                columns = [col[0] for col in cursor.description]
                return dict(zip(columns, row))
        return None
    finally:
        cursor.close()
        conn.close()


def save_customer(customer_data: dict) -> dict:
    """Save a customer to the database - tries Supabase first, then local database"""
    # Try Supabase first
    try:
        from app.db.supabase_client import get_supabase_client
        supabase = get_supabase_client()
        
        # Check if customer exists
        existing = supabase.table('customers').select('id').eq('id', customer_data['id']).execute()
        
        if existing.data:
            # Update
            result = supabase.table('customers').update(customer_data).eq('id', customer_data['id']).execute()
            print(f"✓ Updated customer {customer_data['id']} in Supabase")
        else:
            # Insert
            result = supabase.table('customers').insert(customer_data).execute()
            print(f"✓ Created customer {customer_data['id']} in Supabase")
            
        return result.data[0] if result.data else customer_data
    except Exception as e:
        print(f"Supabase customer save failed: {e}, using local database")
    
    # Fallback to local database
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        if is_postgres(conn):
            cursor.execute("""
                INSERT INTO customers (id, name, phone_number, email, password_hash, address, is_active, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (phone_number) DO UPDATE SET
                    name = EXCLUDED.name,
                    email = EXCLUDED.email,
                    password_hash = EXCLUDED.password_hash,
                    address = EXCLUDED.address,
                    updated_at = EXCLUDED.updated_at
                RETURNING *
            """, (
                customer_data["id"],
                customer_data["name"],
                customer_data["phone_number"],
                customer_data.get("email"),
                customer_data["password_hash"],
                customer_data.get("address"),
                customer_data.get("is_active", True),
                customer_data["created_at"],
                customer_data["updated_at"]
            ))
        else:
            cursor.execute("""
                INSERT OR REPLACE INTO customers 
                (id, name, phone_number, email, password_hash, address, is_active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                customer_data["id"],
                customer_data["name"],
                customer_data["phone_number"],
                customer_data.get("email"),
                customer_data["password_hash"],
                customer_data.get("address"),
                customer_data.get("is_active", True),
                customer_data["created_at"],
                customer_data["updated_at"]
            ))
        
        conn.commit()
        
        # Fetch the inserted/updated customer
        return fetch_customer_by_id(customer_data["id"])
    finally:
        cursor.close()
        conn.close()


def save_otp(otp_data: dict) -> dict:
    """Save an OTP code to the database"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        if is_postgres(conn):
            cursor.execute("""
                INSERT INTO otp_codes (id, phone_number, otp_code, expires_at, is_used, created_at)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                otp_data["id"],
                otp_data["phone_number"],
                otp_data["otp_code"],
                otp_data["expires_at"],
                otp_data["is_used"],
                otp_data["created_at"]
            ))
        else:
            cursor.execute("""
                INSERT INTO otp_codes (id, phone_number, otp_code, expires_at, is_used, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                otp_data["id"],
                otp_data["phone_number"],
                otp_data["otp_code"],
                otp_data["expires_at"],
                otp_data["is_used"],
                otp_data["created_at"]
            ))
        
        conn.commit()
        return otp_data
    finally:
        cursor.close()
        conn.close()


def verify_otp_code(phone_number: str, otp_code: str) -> bool:
    """Verify an OTP code"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        if is_postgres(conn):
            cursor.execute("""
                SELECT id, expires_at, is_used 
                FROM otp_codes 
                WHERE phone_number = %s AND otp_code = %s 
                ORDER BY created_at DESC LIMIT 1
            """, (phone_number, otp_code))
        else:
            cursor.execute("""
                SELECT id, expires_at, is_used 
                FROM otp_codes 
                WHERE phone_number = ? AND otp_code = ? 
                ORDER BY created_at DESC LIMIT 1
            """, (phone_number, otp_code))
        
        row = cursor.fetchone()
        if not row:
            return False
        
        if isinstance(row, dict):
            otp_data = dict(row)
        else:
            columns = [col[0] for col in cursor.description]
            otp_data = dict(zip(columns, row))
        
        # Check if OTP is already used
        if otp_data.get("is_used"):
            return False
        
        # Check if OTP is expired
        expires_at = otp_data.get("expires_at")
        if expires_at:
            if isinstance(expires_at, str):
                try:
                    expires_at = datetime.fromisoformat(expires_at)
                except Exception:
                    expires_at = None
            if expires_at and datetime.now() > expires_at:
                return False
        
        # Mark OTP as used
        if is_postgres(conn):
            cursor.execute(
                "UPDATE otp_codes SET is_used = true WHERE id = %s",
                (otp_data["id"],)
            )
        else:
            cursor.execute(
                "UPDATE otp_codes SET is_used = 1 WHERE id = ?",
                (otp_data["id"],)
            )
        
        conn.commit()
        return True
    finally:
        cursor.close()
        conn.close()


@router.post("/register", response_model=CustomerResponse)
@limiter.limit(get_rate_limit("auth"))
def register_customer(request: Request, payload: CustomerCreate):
    """
    Register a new customer.
    Rate limited to 5 requests per minute to prevent abuse.
    """
    # Check if customer with this phone already exists
    existing = fetch_customer_by_phone(payload.phone_number)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Customer with phone number '{payload.phone_number}' already exists."
        )
    
    # Hash the password
    password_hash = get_password_hash(payload.password)
    
    # Create customer data
    now = datetime.now().isoformat()
    customer_data = {
        "id": str(uuid.uuid4()),
        "name": payload.name,
        "phone_number": payload.phone_number,
        "email": payload.email,
        "password_hash": password_hash,
        "address": None,
        "is_active": True,
        "created_at": now,
        "updated_at": now
    }
    
    try:
        saved_customer = save_customer(customer_data)
        # Return without password hash
        saved_customer.pop("password_hash", None)
        return saved_customer
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to register customer: {str(e)}"
        )


@router.post("/login", response_model=CustomerLoginResponse)
@limiter.limit(get_rate_limit("auth"))
def login_customer(request: Request, payload: CustomerLogin):
    """
    Customer credential-based authentication.
    Validates phone number and password against customers table.
    Returns JWT token and customer profile.
    Rate limited to 5 requests per minute to prevent brute force attacks.
    """
    # Fetch customer by phone number
    customer = fetch_customer_by_phone(payload.phone_number)
    
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid phone number or password."
        )
    
    # Check if customer is active
    if not customer.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Customer account is deactivated."
        )
    
    # Verify password
    if not verify_password(payload.password, customer.get("password_hash")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid phone number or password."
        )
    
    # Create JWT token with customer_id as subject
    access_token = create_access_token(customer["id"])
    
    # Return customer data without password hash
    customer.pop("password_hash", None)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "customer": customer
    }


@router.post("/otp/request", response_model=OTPResponse)
@limiter.limit(get_rate_limit("auth"))
def request_otp(request: Request, payload: CustomerOTPRequest):
    """
    Request an OTP code for phone number verification.
    In production, this would send an SMS with the OTP code.
    For development, the OTP code is returned in the response.
    Rate limited to 5 requests per minute.
    """
    # Generate OTP
    otp_code = generate_otp()
    
    # Set expiration (5 minutes from now)
    expires_at = datetime.now() + timedelta(minutes=5)
    
    # Save OTP to database
    otp_data = {
        "id": str(uuid.uuid4()),
        "phone_number": payload.phone_number,
        "otp_code": otp_code,
        "expires_at": expires_at,
        "is_used": False,
        "created_at": datetime.now().isoformat()
    }
    
    try:
        save_otp(otp_data)
        
        print(f"🔑 [DEV OTP] Code for {payload.phone_number}: {otp_code}")
        return OTPResponse(
            message=f"OTP sent to {payload.phone_number}",
            otp_sent=True,
            expires_in=300,
            otp_code=otp_code
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send OTP: {str(e)}"
        )


@router.post("/otp/verify", response_model=CustomerLoginResponse)
@limiter.limit(get_rate_limit("auth"))
def verify_otp_login(request: Request, payload: CustomerOTPVerify):
    """
    Verify OTP code and authenticate customer.
    If customer doesn't exist, creates a new account.
    Rate limited to 5 requests per minute.
    """
    # Verify OTP
    if not verify_otp_code(payload.phone_number, payload.otp):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired OTP code."
        )
    
    # Check if customer exists
    customer = fetch_customer_by_phone(payload.phone_number)
    
    if not customer:
        # Create new customer with OTP-based authentication
        now = datetime.now().isoformat()
        customer_data = {
            "id": str(uuid.uuid4()),
            "name": "Customer",  # Default name, can be updated later
            "phone_number": payload.phone_number,
            "email": None,
            "password_hash": "",  # No password for OTP-based auth
            "address": None,
            "is_active": True,
            "created_at": now,
            "updated_at": now
        }
        
        try:
            customer = save_customer(customer_data)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create customer: {str(e)}"
            )
    
    # Check if customer is active
    if not customer.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Customer account is deactivated."
        )
    
    # Create JWT token with customer_id as subject
    access_token = create_access_token(customer["id"])
    
    # Return customer data without password hash
    customer.pop("password_hash", None)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "customer": customer
    }


@router.put("/{customer_id}/complete-profile", response_model=CustomerResponse)
@limiter.limit(get_rate_limit("general"))
def complete_customer_profile(
    request: Request,
    customer_id: str,
    payload: CustomerProfileComplete,
    current_customer: dict = Depends(get_current_customer),
):
    print(f"🔍 Profile completion - Customer ID: {customer_id}")
    print(f"🔍 Payload received: {payload}")
    print(f"🔍 Current customer from token: {current_customer}")
    
    if current_customer["customer_id"] != customer_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only update your own profile.")
    
    # Validate password confirmation
    if payload.password != payload.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match."
        )
    
    customer = fetch_customer_by_id(customer_id)
    print(f"🔍 Fetched customer: {customer}")
    
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found.")
    
    # Update customer data
    customer["name"] = payload.name
    customer["phone_number"] = payload.phone_number  # Phone number re-entry
    # Email is accepted but not used - frontend may still send it
    if hasattr(payload, 'email') and payload.email:
        customer["email"] = payload.email
    customer["password_hash"] = get_password_hash(payload.password)
    customer["updated_at"] = datetime.now().isoformat()
    
    # Ensure required fields exist
    if "address" not in customer:
        customer["address"] = ""
    if "is_active" not in customer:
        customer["is_active"] = True
    if "created_at" not in customer:
        customer["created_at"] = datetime.now().isoformat()
    
    print(f"🔍 Saving customer with password hash")
    try:
        updated_customer = save_customer(customer)
        updated_customer.pop("password_hash", None)
        print(f"🔍 Profile completed successfully")
        return updated_customer
    except Exception as e:
        print(f"🔍 Error saving customer: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete profile: {str(e)}"
        )

@router.put("/{customer_id}/reset-password")
@limiter.limit(get_rate_limit("general"))
def reset_customer_password(
    request: Request,
    customer_id: str,
    payload: CustomerPasswordReset,
    current_customer: dict = Depends(get_current_customer),
):
    """Set a new password after the customer has authenticated with OTP."""
    if current_customer["customer_id"] != customer_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only update your own password.")
    customer = fetch_customer_by_id(customer_id)
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found.")
    customer["password_hash"] = get_password_hash(payload.new_password)
    customer["updated_at"] = datetime.now().isoformat()
    save_customer(customer)
    return {"success": True, "message": "Password reset successfully."}
@router.put("/{customer_id}/password")
@limiter.limit(get_rate_limit("general"))
def change_customer_password(
    request: Request,
    customer_id: str,
    payload: CustomerPasswordChange,
    current_customer: dict = Depends(get_current_customer),
):
    if current_customer["customer_id"] != customer_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only update your own password.")
    customer = fetch_customer_by_id(customer_id)
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found.")
    if not verify_password(payload.current_password, customer.get("password_hash") or ""):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect.")
    if payload.current_password == payload.new_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New password must be different.")
    customer["password_hash"] = get_password_hash(payload.new_password)
    customer["updated_at"] = datetime.now().isoformat()
    save_customer(customer)
    return {"success": True, "message": "Password updated successfully."}

@router.delete("/{customer_id}")
@limiter.limit(get_rate_limit("general"))
def delete_customer_account(
    request: Request,
    customer_id: str,
    current_customer: dict = Depends(get_current_customer),
):
    """Remove customer personal data while preserving order records for accounting."""
    if current_customer["customer_id"] != customer_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only delete your own account.")
    conn = get_connection()
    cursor = conn.cursor()
    placeholder = "%s" if is_postgres(conn) else "?"
    try:
        cursor.execute(f"SELECT id FROM customers WHERE id = {placeholder}", (customer_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found.")
        # Keep order history, but remove personal data and dependent private records.
        for table, column in (("customer_addresses", "customer_id"), ("notifications", "user_id"), ("loyalty_accounts", "customer_id"), ("loyalty_transactions", "customer_id"), ("product_reviews", "customer_id"), ("chatbot_conversations", "customer_id")):
            try:
                cursor.execute(f"DELETE FROM {table} WHERE {column} = {placeholder}", (customer_id,))
            except Exception:
                conn.rollback()
        cursor.execute(
            f"UPDATE customers SET name = {placeholder}, phone_number = {placeholder}, email = NULL, password_hash = {placeholder}, address = NULL, is_active = {placeholder}, updated_at = CURRENT_TIMESTAMP WHERE id = {placeholder}",
            ("Deleted Customer", f"deleted-{customer_id}", "", False, customer_id),
        )
        conn.commit()
        return {"success": True, "message": "Customer account deleted."}
    except HTTPException:
        conn.rollback()
        raise
    except Exception as exc:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to delete customer account: {exc}")
    finally:
        cursor.close()
        conn.close()
@router.get("/{customer_id}", response_model=CustomerResponse)
@limiter.limit(get_rate_limit("general"))
def get_customer(request: Request, customer_id: str):
    """Get a specific customer by ID. Rate limited to 100 requests per minute."""
    customer = fetch_customer_by_id(customer_id)
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID '{customer_id}' not found."
        )
    
    # Return without password hash
    customer.pop("password_hash", None)
    return customer


@router.put("/{customer_id}", response_model=CustomerResponse)
@limiter.limit(get_rate_limit("general"))
def update_customer(request: Request, customer_id: str, payload: CustomerUpdate, current_customer: dict = Depends(get_current_customer)):
    """Update an existing customer's profile. Rate limited to 100 requests per minute."""
    if current_customer["customer_id"] != customer_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only update your own profile.")
    customer = fetch_customer_by_id(customer_id)
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID '{customer_id}' not found."
        )
    
    # Prepare update data
    update_data = customer.copy()
    
    if payload.name is not None:
        update_data["name"] = payload.name
    if payload.email is not None:
        update_data["email"] = payload.email
    if payload.address is not None:
        update_data["address"] = payload.address
    
    update_data["updated_at"] = datetime.now().isoformat()
    
    try:
        updated_customer = save_customer(update_data)
        # Return without password hash
        updated_customer.pop("password_hash", None)
        return updated_customer
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update customer: {str(e)}"
        )






