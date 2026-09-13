import uuid
from typing import Optional, List
from fastapi import APIRouter, HTTPException, status, Request, Depends

from app.core.security import get_password_hash
from app.db.database import (
    fetch_all_riders,
    fetch_rider_by_id,
    save_rider,
    delete_rider
)
from app.models.rider import RiderCreate, RiderUpdate, RiderResponse
from app.middleware.rate_limiter import limiter, get_rate_limit
from app.middleware.auth import get_current_admin

router = APIRouter(prefix="/riders", tags=["riders"])


@router.get("", response_model=List[RiderResponse])
@limiter.limit(get_rate_limit("general"))
def get_riders(request: Request, status: Optional[str] = None):
    """
    Get all riders, optionally filtered by status.
    Rate limited to 50 requests per minute.
    """
    try:
        riders = fetch_all_riders(status=status)
        return riders
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch riders: {str(e)}"
        )


@router.get("/{rider_id}", response_model=RiderResponse)
@limiter.limit(get_rate_limit("admin"))
def get_rider(request: Request, rider_id: str, current_admin: dict = Depends(get_current_admin)):
    """Get a specific rider by ID. Admin-only. Rate limited to 50 requests per minute."""
    try:
        rider = fetch_rider_by_id(rider_id)
        if not rider:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Rider with ID '{rider_id}' not found."
            )
        # Remove password hash before returning
        rider.pop("password_hash", None)
        return rider
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch rider: {str(e)}"
        )


@router.post("", response_model=RiderResponse)
@limiter.limit(get_rate_limit("admin"))
def create_rider(request: Request, payload: RiderCreate, current_admin: dict = Depends(get_current_admin)):
    """
    Create a new rider credential.
    Password is automatically hashed before storage.
    Admin-only endpoint. Rate limited to 50 requests per minute.
    """
    # Check if rider with this phone already exists
    from app.db.database import fetch_rider_by_phone
    existing = fetch_rider_by_phone(payload.phone_number)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Rider with phone number '{payload.phone_number}' already exists."
        )

    # Hash the password
    password_hash = get_password_hash(payload.password)

    # Create rider data
    from datetime import datetime
    now = datetime.now().isoformat()
    rider_data = {
        "id": str(uuid.uuid4()),
        "phone_number": payload.phone_number,
        "password_hash": password_hash,
        "name": payload.name,
        "vehicle_type": payload.vehicle_type,
        "vehicle_number": payload.vehicle_number,
        "status": payload.status,
        "is_admin": payload.is_admin,
        "total_earnings": 0,
        "created_at": now,
        "updated_at": now
    }

    try:
        saved_rider = save_rider(rider_data)
        # Return without password hash
        saved_rider.pop("password_hash", None)
        # Ensure timestamp fields are present
        if "created_at" not in saved_rider:
            saved_rider["created_at"] = now
        if "updated_at" not in saved_rider:
            saved_rider["updated_at"] = now
        return saved_rider
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create rider: {str(e)}"
        )


@router.put("/{rider_id}", response_model=RiderResponse)
@limiter.limit(get_rate_limit("admin"))
def update_rider(request: Request, rider_id: str, payload: RiderUpdate, current_admin: dict = Depends(get_current_admin)):
    """Update an existing rider's details. Rate limited to 50 requests per minute."""
    rider = fetch_rider_by_id(rider_id)
    if not rider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Rider with ID '{rider_id}' not found."
        )

    # Prepare update data
    update_data = rider.copy()

    if payload.name is not None:
        update_data["name"] = payload.name
    if payload.vehicle_type is not None:
        update_data["vehicle_type"] = payload.vehicle_type
    if payload.vehicle_number is not None:
        update_data["vehicle_number"] = payload.vehicle_number
    if payload.status is not None:
        update_data["status"] = payload.status
    if payload.is_admin is not None:
        update_data["is_admin"] = payload.is_admin
    if payload.password is not None:
        update_data["password_hash"] = get_password_hash(payload.password)

    try:
        updated_rider = save_rider(update_data)
        # Return without password hash
        updated_rider.pop("password_hash", None)
        return updated_rider
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update rider: {str(e)}"
        )


@router.delete("/{rider_id}")
@limiter.limit(get_rate_limit("admin"))
def delete_rider_endpoint(request: Request, rider_id: str, current_admin: dict = Depends(get_current_admin)):
    """Delete a rider by ID. Rate limited to 50 requests per minute."""
    deleted = delete_rider(rider_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Rider with ID '{rider_id}' not found."
        )
    return {"message": f"Rider '{rider_id}' successfully deleted.", "success": True}


@router.put("/{rider_id}/availability")
@limiter.limit(get_rate_limit("general"))
def update_rider_availability(request: Request, rider_id: str, is_available: bool):
    """
    Update rider availability status.
    Used by rider panel to toggle online/offline status.
    Rate limited to 100 requests per minute.
    """
    from app.db.database import get_connection, is_postgres
    from datetime import datetime

    rider = fetch_rider_by_id(rider_id)
    if not rider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Rider with ID '{rider_id}' not found."
        )

    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Update rider availability
        if is_postgres(conn):
            query = """
                UPDATE rider_credentials 
                SET status = %s, updated_at = %s 
                WHERE id = %s
            """
            cursor.execute(query, ('active' if is_available else 'inactive', datetime.now().isoformat(), rider_id))
        else:
            query = """
                UPDATE rider_credentials 
                SET status = ?, updated_at = ? 
                WHERE id = ?
            """
            cursor.execute(query, ('active' if is_available else 'inactive', datetime.now().isoformat(), rider_id))

        conn.commit()
        cursor.close()
        conn.close()

        return {
            "rider_id": rider_id,
            "is_available": is_available,
            "status": 'active' if is_available else 'inactive'
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update rider availability: {str(e)}"
        )
