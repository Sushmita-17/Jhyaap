import uuid
from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Request, Depends

from app.db.database import get_connection, is_postgres
from app.models.coupon import (
    CouponCreate, CouponUpdate, CouponResponse,
    CouponValidationRequest, CouponValidationResponse, CouponType
)
from app.middleware.rate_limiter import limiter, get_rate_limit
from app.middleware.auth import get_current_admin

router = APIRouter(prefix="/coupons", tags=["coupons"])


def create_notification_for_all_customers(title: str, message: str, notification_type: str, coupon_code: str = None):
    """Helper function to create a notification for all customers"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        # Get all customers
        if is_postgres(conn):
            cursor.execute("SELECT id FROM customers WHERE is_active = true")
        else:
            cursor.execute("SELECT id FROM customers WHERE is_active = 1")
        
        rows = cursor.fetchall()
        customer_ids = []
        for row in rows:
            if isinstance(row, dict):
                customer_ids.append(row["id"])
            else:
                customer_ids.append(row[0])
        
        # Create notification for each customer
        for customer_id in customer_ids:
            notification_id = str(uuid.uuid4())
            now = datetime.now().isoformat()
            
            if is_postgres(conn):
                cursor.execute("""
                    INSERT INTO notifications 
                    (id, customer_id, title, message, notification_type, coupon_code, is_read, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    notification_id,
                    customer_id,
                    title,
                    message,
                    notification_type,
                    coupon_code,
                    False,
                    now,
                    now
                ))
            else:
                cursor.execute("""
                    INSERT INTO notifications 
                    (id, customer_id, title, message, notification_type, coupon_code, is_read, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    notification_id,
                    customer_id,
                    title,
                    message,
                    notification_type,
                    coupon_code,
                    False,
                    now,
                    now
                ))
        
        conn.commit()
    except Exception as e:
        print(f"Failed to create notifications: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()


def fetch_coupon_by_code(code: str) -> Optional[dict]:
    """Fetch a coupon by code"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        if is_postgres(conn):
            cursor.execute(
                "SELECT * FROM coupons WHERE code = %s",
                (code,)
            )
        else:
            cursor.execute(
                "SELECT * FROM coupons WHERE code = ?",
                (code,)
            )
        
        row = cursor.fetchone()
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


def fetch_coupon_by_id(coupon_id: str) -> Optional[dict]:
    """Fetch a coupon by ID"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        if is_postgres(conn):
            cursor.execute(
                "SELECT * FROM coupons WHERE id = %s",
                (coupon_id,)
            )
        else:
            cursor.execute(
                "SELECT * FROM coupons WHERE id = ?",
                (coupon_id,)
            )
        
        row = cursor.fetchone()
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


def save_coupon(coupon_data: dict) -> dict:
    """Save a coupon to the database"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        if is_postgres(conn):
            cursor.execute("""
                INSERT INTO coupons 
                (id, code, description, coupon_type, value, minimum_order_amount, max_discount_amount, 
                 usage_limit, usage_count, valid_from, valid_until, is_active, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (code) DO UPDATE SET
                    description = EXCLUDED.description,
                    coupon_type = EXCLUDED.coupon_type,
                    value = EXCLUDED.value,
                    minimum_order_amount = EXCLUDED.minimum_order_amount,
                    max_discount_amount = EXCLUDED.max_discount_amount,
                    usage_limit = EXCLUDED.usage_limit,
                    valid_from = EXCLUDED.valid_from,
                    valid_until = EXCLUDED.valid_until,
                    is_active = EXCLUDED.is_active,
                    updated_at = EXCLUDED.updated_at
                RETURNING *
            """, (
                coupon_data["id"],
                coupon_data["code"],
                coupon_data.get("description"),
                coupon_data["coupon_type"],
                coupon_data["value"],
                coupon_data["minimum_order_amount"],
                coupon_data.get("max_discount_amount"),
                coupon_data.get("usage_limit"),
                coupon_data["usage_count"],
                coupon_data["valid_from"],
                coupon_data["valid_until"],
                coupon_data["is_active"],
                coupon_data["created_at"],
                coupon_data["updated_at"]
            ))
        else:
            cursor.execute("""
                INSERT OR REPLACE INTO coupons 
                (id, code, description, coupon_type, value, minimum_order_amount, max_discount_amount, 
                 usage_limit, usage_count, valid_from, valid_until, is_active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                coupon_data["id"],
                coupon_data["code"],
                coupon_data.get("description"),
                coupon_data["coupon_type"],
                coupon_data["value"],
                coupon_data["minimum_order_amount"],
                coupon_data.get("max_discount_amount"),
                coupon_data.get("usage_limit"),
                coupon_data["usage_count"],
                coupon_data["valid_from"],
                coupon_data["valid_until"],
                coupon_data["is_active"],
                coupon_data["created_at"],
                coupon_data["updated_at"]
            ))
        
        conn.commit()
        return fetch_coupon_by_id(coupon_data["id"])
    finally:
        cursor.close()
        conn.close()


@router.get("", response_model=List[CouponResponse], dependencies=[Depends(get_current_admin)])
@limiter.limit(get_rate_limit("admin"))
def get_coupons(request: Request, is_active: Optional[bool] = None):
    """
    Get all coupons, optionally filtered by active status.
    Admin-only endpoint. Rate limited to 50 requests per minute.
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        if is_postgres(conn):
            if is_active is not None:
                cursor.execute(
                    "SELECT * FROM coupons WHERE is_active = %s ORDER BY created_at DESC",
                    (is_active,)
                )
            else:
                cursor.execute("SELECT * FROM coupons ORDER BY created_at DESC")
        else:
            if is_active is not None:
                cursor.execute(
                    "SELECT * FROM coupons WHERE is_active = ? ORDER BY created_at DESC",
                    (is_active,)
                )
            else:
                cursor.execute("SELECT * FROM coupons ORDER BY created_at DESC")
        
        rows = cursor.fetchall()
        coupons = []
        for row in rows:
            if isinstance(row, dict):
                coupons.append(dict(row))
            else:
                columns = [col[0] for col in cursor.description]
                coupons.append(dict(zip(columns, row)))
        
        return coupons
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch coupons: {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()


@router.get("/{coupon_id}", response_model=CouponResponse, dependencies=[Depends(get_current_admin)])
@limiter.limit(get_rate_limit("admin"))
def get_coupon(request: Request, coupon_id: str):
    """Get a specific coupon by ID. Rate limited to 50 requests per minute."""
    coupon = fetch_coupon_by_id(coupon_id)
    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Coupon with ID '{coupon_id}' not found."
        )
    return coupon


@router.post("", response_model=CouponResponse, dependencies=[Depends(get_current_admin)])
@limiter.limit(get_rate_limit("admin"))
def create_coupon(request: Request, payload: CouponCreate):
    """
    Create a new coupon.
    Admin-only endpoint. Rate limited to 50 requests per minute.
    """
    # Check if coupon with this code already exists
    existing = fetch_coupon_by_code(payload.code)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Coupon with code '{payload.code}' already exists."
        )
    
    # Create coupon data
    now = datetime.now().isoformat()
    coupon_data = {
        "id": str(uuid.uuid4()),
        "code": payload.code.upper(),
        "description": payload.description,
        "coupon_type": payload.coupon_type.value,
        "value": payload.value,
        "minimum_order_amount": payload.minimum_order_amount,
        "max_discount_amount": payload.max_discount_amount,
        "usage_limit": payload.usage_limit,
        "usage_count": payload.usage_count,
        "valid_from": payload.valid_from.isoformat(),
        "valid_until": payload.valid_until.isoformat(),
        "is_active": payload.is_active,
        "created_at": now,
        "updated_at": now
    }
    
    try:
        saved_coupon = save_coupon(coupon_data)
        
        # Create notification for all customers about new coupon
        if payload.is_active:
            discount_text = ""
            if payload.coupon_type == CouponType.PERCENTAGE:
                discount_text = f"{payload.value}% off"
            elif payload.coupon_type == CouponType.FIXED_AMOUNT:
                discount_text = f"${payload.value} off"
            elif payload.coupon_type == CouponType.FREE_DELIVERY:
                discount_text = "Free delivery"
            
            create_notification_for_all_customers(
                title="New Coupon Available!",
                message=f"Use code {payload.code.upper()} to get {discount_text} on your next order!",
                notification_type="coupon",
                coupon_code=payload.code.upper()
            )
        
        return saved_coupon
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create coupon: {str(e)}"
        )


@router.put("/{coupon_id}", response_model=CouponResponse, dependencies=[Depends(get_current_admin)])
@limiter.limit(get_rate_limit("admin"))
def update_coupon(request: Request, coupon_id: str, payload: CouponUpdate):
    """Update an existing coupon. Rate limited to 50 requests per minute."""
    coupon = fetch_coupon_by_id(coupon_id)
    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Coupon with ID '{coupon_id}' not found."
        )
    
    # Prepare update data
    update_data = coupon.copy()
    
    if payload.description is not None:
        update_data["description"] = payload.description
    if payload.coupon_type is not None:
        update_data["coupon_type"] = payload.coupon_type.value
    if payload.value is not None:
        update_data["value"] = payload.value
    if payload.minimum_order_amount is not None:
        update_data["minimum_order_amount"] = payload.minimum_order_amount
    if payload.max_discount_amount is not None:
        update_data["max_discount_amount"] = payload.max_discount_amount
    if payload.usage_limit is not None:
        update_data["usage_limit"] = payload.usage_limit
    if payload.valid_from is not None:
        update_data["valid_from"] = payload.valid_from.isoformat()
    if payload.valid_until is not None:
        update_data["valid_until"] = payload.valid_until.isoformat()
    if payload.is_active is not None:
        update_data["is_active"] = payload.is_active
    
    update_data["updated_at"] = datetime.now().isoformat()
    
    try:
        updated_coupon = save_coupon(update_data)
        return updated_coupon
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update coupon: {str(e)}"
        )


@router.delete("/{coupon_id}", dependencies=[Depends(get_current_admin)])
@limiter.limit(get_rate_limit("admin"))
def delete_coupon(request: Request, coupon_id: str):
    """Delete a coupon by ID. Rate limited to 50 requests per minute."""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        if is_postgres(conn):
            cursor.execute("DELETE FROM coupons WHERE id = %s", (coupon_id,))
        else:
            cursor.execute("DELETE FROM coupons WHERE id = ?", (coupon_id,))
        
        conn.commit()
        
        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Coupon with ID '{coupon_id}' not found."
            )
        
        return {"message": f"Coupon '{coupon_id}' successfully deleted.", "success": True}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete coupon: {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()


@router.post("/validate", response_model=CouponValidationResponse)
@limiter.limit(get_rate_limit("general"))
def validate_coupon(request: Request, payload: CouponValidationRequest):
    """
    Validate a coupon code and calculate discount amount.
    Rate limited to 100 requests per minute.
    """
    coupon = fetch_coupon_by_code(payload.code.upper())
    
    if not coupon:
        return CouponValidationResponse(
            valid=False,
            discount_amount=0.0,
            message="Invalid coupon code"
        )
    
    # Check if coupon is active
    if not coupon.get("is_active"):
        return CouponValidationResponse(
            valid=False,
            discount_amount=0.0,
            message="Coupon is inactive"
        )
    
    # Check if coupon is within validity period
    now = datetime.now()
    valid_from = datetime.fromisoformat(coupon["valid_from"])
    valid_until = datetime.fromisoformat(coupon["valid_until"])
    
    if now < valid_from or now > valid_until:
        return CouponValidationResponse(
            valid=False,
            discount_amount=0.0,
            message="Coupon is expired or not yet valid"
        )
    
    # Check if usage limit reached
    usage_limit = coupon.get("usage_limit")
    usage_count = coupon.get("usage_count", 0)
    if usage_limit and usage_count >= usage_limit:
        return CouponValidationResponse(
            valid=False,
            discount_amount=0.0,
            message="Coupon usage limit reached"
        )
    
    # Check minimum order amount
    minimum_order = coupon.get("minimum_order_amount", 0)
    if payload.order_amount < minimum_order:
        return CouponValidationResponse(
            valid=False,
            discount_amount=0.0,
            message=f"Minimum order amount of {minimum_order} required"
        )
    
    # Calculate discount
    coupon_type = coupon["coupon_type"]
    value = coupon["value"]
    discount_amount = 0.0
    
    if coupon_type == "percentage":
        discount_amount = payload.order_amount * (value / 100)
    elif coupon_type == "fixed_amount":
        discount_amount = value
    elif coupon_type == "free_delivery":
        discount_amount = 50.0  # Assuming delivery fee is 50
    
    # Apply max discount limit
    max_discount = coupon.get("max_discount_amount")
    if max_discount and discount_amount > max_discount:
        discount_amount = max_discount
    
    return CouponValidationResponse(
        valid=True,
        coupon=coupon,
        discount_amount=discount_amount,
        message="Coupon applied successfully"
    )



