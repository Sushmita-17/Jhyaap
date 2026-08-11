import uuid
from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Request, Header, Depends

from app.db.supabase_client import get_supabase_client
from app.models.notification import (
    NotificationCreate, NotificationUpdate, NotificationResponse, NotificationBulkUpdate
)
from app.middleware.rate_limiter import limiter, get_rate_limit
from app.middleware.auth import get_current_admin, get_current_customer, require_customer

router = APIRouter(prefix="/notifications", tags=["notifications"])


def fetch_notification_by_id(notification_id: str) -> Optional[dict]:
    """Fetch a notification by ID using Supabase"""
    supabase = get_supabase_client()
    
    try:
        result = supabase.table("notifications").select("*").eq("id", notification_id).execute()
        if result.data:
            return result.data[0]
        return None
    except Exception as e:
        print(f"Failed to fetch notification: {e}")
        return None


def save_notification(notification_data: dict) -> dict:
    """Save a notification to Supabase"""
    supabase = get_supabase_client()
    
    try:
        result = supabase.table("notifications").insert(notification_data).execute()
        if result.data:
            return result.data[0]
        return notification_data
    except Exception as e:
        print(f"Failed to save notification: {e}")
        return notification_data


@router.get("/customer/{customer_id}", response_model=List[NotificationResponse])
@limiter.limit(get_rate_limit("general"))
def get_customer_notifications(
    request: Request, 
    customer_id: str, 
    current_customer: dict = Depends(get_current_customer),
    is_read: Optional[bool] = None,
    limit: int = 50,
    offset: int = 0
):
    """
    Get all notifications for a specific customer using Supabase.
    Customer can only access their own notifications (requires authentication).
    Rate limited to 100 requests per minute.
    """
    # Verify the authenticated customer is requesting their own notifications
    if current_customer["customer_id"] != customer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your own notifications"
        )
    
    supabase = get_supabase_client()
    
    try:
        query = supabase.table("notifications").select("*").eq("user_id", customer_id).eq("user_type", "customer")
        
        if is_read is not None:
            query = query.eq("is_read", is_read)
        
        result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        return result.data if result.data else []
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch notifications: {str(e)}"
        )


@router.get("/customer/{customer_id}/unread-count")
@limiter.limit(get_rate_limit("general"))
def get_unread_notification_count(
    request: Request, 
    customer_id: str,
    current_customer: dict = Depends(get_current_customer)
):
    """
    Get count of unread notifications for a customer using Supabase.
    Customer can only access their own unread count (requires authentication).
    Rate limited to 100 requests per minute.
    """
    # Verify the authenticated customer is requesting their own notifications
    if current_customer["customer_id"] != customer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your own notifications"
        )
    
    supabase = get_supabase_client()
    
    try:
        result = supabase.table("notifications").select("*", count="exact").eq("user_id", customer_id).eq("user_type", "customer").eq("is_read", False).execute()
        count = result.count if hasattr(result, 'count') else len(result.data)
        return {"unread_count": count}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch unread count: {str(e)}"
        )


@router.get("/{notification_id}", response_model=NotificationResponse)
@limiter.limit(get_rate_limit("general"))
def get_notification(request: Request, notification_id: str):
    """Get a specific notification by ID. Rate limited to 100 requests per minute."""
    notification = fetch_notification_by_id(notification_id)
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notification with ID '{notification_id}' not found."
        )
    return notification


@router.post("", response_model=NotificationResponse, dependencies=[Depends(get_current_admin)])
@limiter.limit(get_rate_limit("general"))
def create_notification(request: Request, payload: NotificationCreate):
    """
    Create a new notification.
    Rate limited to 100 requests per minute.
    """
    # Create notification data
    now = datetime.now().isoformat()
    notification_data = {
        "id": str(uuid.uuid4()),
        "customer_id": payload.customer_id,
        "title": payload.title,
        "message": payload.message,
        "notification_type": payload.notification_type.value,
        "order_id": payload.order_id,
        "coupon_code": payload.coupon_code,
        "action_link": payload.action_link,
        "is_read": payload.is_read,
        "created_at": now,
        "updated_at": now
    }
    
    try:
        saved_notification = save_notification(notification_data)
        return saved_notification
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create notification: {str(e)}"
        )


@router.put("/{notification_id}", response_model=NotificationResponse)
@limiter.limit(get_rate_limit("general"))
def update_notification(request: Request, notification_id: str, payload: NotificationUpdate, current_customer: dict = Depends(get_current_customer)):
    """Update a notification (mark as read/unread) using Supabase. Rate limited to 100 requests per minute."""
    notification = fetch_notification_by_id(notification_id)
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notification with ID '{notification_id}' not found."
        )
    
    owner_id = notification.get("user_id") or notification.get("customer_id")
    if owner_id != current_customer["customer_id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only update your own notifications")

    # Prepare update data
    update_data = {"is_read": payload.is_read} if payload.is_read is not None else {}
    
    supabase = get_supabase_client()
    
    try:
        result = supabase.table("notifications").update(update_data).eq("id", notification_id).execute()
        if result.data:
            return result.data[0]
        return notification
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update notification: {str(e)}"
        )


@router.post("/bulk-mark-read")
@limiter.limit(get_rate_limit("general"))
def bulk_mark_notifications_read(request: Request, payload: NotificationBulkUpdate, current_customer: dict = Depends(get_current_customer)):
    """
    Mark multiple notifications as read/unread using Supabase.
    Rate limited to 100 requests per minute.
    """
    if not payload.notification_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Notification IDs list cannot be empty."
        )
    
    supabase = get_supabase_client()
    
    try:
        for notification_id in payload.notification_ids:
            notification = fetch_notification_by_id(notification_id)
            owner_id = (notification.get("user_id") or notification.get("customer_id")) if notification else None
            if owner_id != current_customer["customer_id"]:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only update your own notifications")
        result = supabase.table("notifications").update({"is_read": payload.is_read}).in_("id", payload.notification_ids).execute()
        return {"message": f"Marked {len(result.data) if result.data else 0} notifications as read", "success": True}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to bulk update notifications: {str(e)}"
        )


@router.delete("/{notification_id}")
@limiter.limit(get_rate_limit("general"))
def delete_notification(request: Request, notification_id: str, current_customer: dict = Depends(get_current_customer)):
    """Delete a notification by ID using Supabase. Rate limited to 100 requests per minute."""
    supabase = get_supabase_client()
    
    try:
        notification = fetch_notification_by_id(notification_id)
        if not notification:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")
        owner_id = notification.get("user_id") or notification.get("customer_id")
        if owner_id != current_customer["customer_id"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only delete your own notifications")
        result = supabase.table("notifications").delete().eq("id", notification_id).execute()
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Notification with ID '{notification_id}' not found."
            )
        return {"message": f"Notification '{notification_id}' successfully deleted.", "success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete notification: {str(e)}"
        )


@router.delete("/customer/{customer_id}/clear-all")
@limiter.limit(get_rate_limit("general"))
def clear_all_notifications(
    request: Request, 
    customer_id: str,
    current_customer: dict = Depends(get_current_customer)
):
    """
    Delete all notifications for a customer using Supabase.
    Customer can only clear their own notifications (requires authentication).
    Rate limited to 100 requests per minute.
    """
    # Verify the authenticated customer is clearing their own notifications
    if current_customer["customer_id"] != customer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only clear your own notifications"
        )
    
    supabase = get_supabase_client()
    
    try:
        result = supabase.table("notifications").delete().eq("user_id", customer_id).eq("user_type", "customer").execute()
        return {"message": f"All notifications for customer '{customer_id}' cleared.", "success": True}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear notifications: {str(e)}"
        )


@router.get("/admin")
@limiter.limit(get_rate_limit("general"))
def get_admin_notifications(
    request: Request,
    is_read: Optional[bool] = None,
    limit: int = 50,
    offset: int = 0
):
    """
    Get all notifications for admin using Supabase.
    Rate limited to 100 requests per minute.
    """
    supabase = get_supabase_client()
    
    try:
        query = supabase.table("notifications").select("*").eq("user_id", "admin").eq("user_type", "admin")
        
        if is_read is not None:
            query = query.eq("is_read", is_read)
        
        result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        return {"notifications": result.data if result.data else []}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch admin notifications: {str(e)}"
        )



