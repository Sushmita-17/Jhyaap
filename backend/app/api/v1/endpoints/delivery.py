import uuid
from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Request, Depends

from app.db.database import get_connection, is_postgres, fetch_order_by_id
from app.middleware.rate_limiter import limiter, get_rate_limit
from app.middleware.auth import get_current_admin

router = APIRouter(prefix="/delivery", tags=["delivery"])


@router.get("/orders/pending", dependencies=[Depends(get_current_admin)])
@limiter.limit(get_rate_limit("admin"))
def get_pending_orders(request: Request):
    """
    Get all pending orders that need rider assignment.
    Admin-only endpoint. Rate limited to 50 requests per minute.
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        if is_postgres(conn):
            cursor.execute(
                "SELECT * FROM orders WHERE status = 'pending' AND rider_id IS NULL ORDER BY created_at ASC"
            )
        else:
            cursor.execute(
                "SELECT * FROM orders WHERE status = 'pending' AND rider_id IS NULL ORDER BY created_at ASC"
            )
        
        rows = cursor.fetchall()
        orders = []
        for row in rows:
            if isinstance(row, dict):
                orders.append(dict(row))
            else:
                columns = [col[0] for col in cursor.description]
                orders.append(dict(zip(columns, row)))
        
        return orders
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch pending orders: {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()


@router.post("/orders/{order_id}/assign-rider/{rider_id}", dependencies=[Depends(get_current_admin)])
@limiter.limit(get_rate_limit("admin"))
def assign_rider_to_order(request: Request, order_id: str, rider_id: str):
    """
    Manually assign a rider to an order.
    Admin-only endpoint. Rate limited to 50 requests per minute.
    """
    order = fetch_order_by_id(order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID '{order_id}' not found."
        )
    
    # Check if order can be assigned
    if order["status"] != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Order with status '{order['status']}' cannot be assigned."
        )
    
    # Check if order already has a rider
    if order.get("rider_id"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order already assigned to a rider."
        )
    
    # Update order with rider_id and status
    from app.db.database import save_order
    order["rider_id"] = rider_id
    order["status"] = "accepted"
    order["updated_at"] = datetime.now().isoformat()
    
    try:
        save_order(order)
        return {"message": f"Rider {rider_id} assigned to order {order_id}", "success": True}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to assign rider: {str(e)}"
        )


@router.get("/orders/in-progress", dependencies=[Depends(get_current_admin)])
@limiter.limit(get_rate_limit("admin"))
def get_in_progress_orders(request: Request):
    """
    Get all orders currently in progress (accepted, preparing, out_for_delivery).
    Admin-only endpoint. Rate limited to 50 requests per minute.
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        if is_postgres(conn):
            cursor.execute(
                "SELECT * FROM orders WHERE status IN ('accepted', 'preparing', 'out_for_delivery') ORDER BY created_at DESC"
            )
        else:
            cursor.execute(
                "SELECT * FROM orders WHERE status IN ('accepted', 'preparing', 'out_for_delivery') ORDER BY created_at DESC"
            )
        
        rows = cursor.fetchall()
        orders = []
        for row in rows:
            if isinstance(row, dict):
                orders.append(dict(row))
            else:
                columns = [col[0] for col in cursor.description]
                orders.append(dict(zip(columns, row)))
        
        return orders
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch in-progress orders: {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()


@router.get("/orders/completed", dependencies=[Depends(get_current_admin)])
@limiter.limit(get_rate_limit("admin"))
def get_completed_orders(request: Request, limit: int = 50, offset: int = 0):
    """
    Get completed orders (delivered or cancelled) with pagination.
    Admin-only endpoint. Rate limited to 50 requests per minute.
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        if is_postgres(conn):
            cursor.execute(
                "SELECT * FROM orders WHERE status IN ('delivered', 'cancelled') ORDER BY created_at DESC LIMIT %s OFFSET %s",
                (limit, offset)
            )
        else:
            cursor.execute(
                "SELECT * FROM orders WHERE status IN ('delivered', 'cancelled') ORDER BY created_at DESC LIMIT %s OFFSET %s",
                (limit, offset)
            )
        
        rows = cursor.fetchall()
        orders = []
        for row in rows:
            if isinstance(row, dict):
                orders.append(dict(row))
            else:
                columns = [col[0] for col in cursor.description]
                orders.append(dict(zip(columns, row)))
        
        return orders
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch completed orders: {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()


@router.get("/stats/overview", dependencies=[Depends(get_current_admin)])
@limiter.limit(get_rate_limit("admin"))
def get_delivery_overview(request: Request):
    """
    Get delivery overview statistics including pending, in-progress, and completed orders.
    Admin-only endpoint. Rate limited to 50 requests per minute.
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        # Get counts for each status
        if is_postgres(conn):
            cursor.execute("""
                SELECT 
                    COUNT(*) FILTER (WHERE status = 'pending' AND rider_id IS NULL) as pending_unassigned,
                    COUNT(*) FILTER (WHERE status = 'accepted') as accepted,
                    COUNT(*) FILTER (WHERE status = 'preparing') as preparing,
                    COUNT(*) FILTER (WHERE status = 'out_for_delivery') as out_for_delivery,
                    COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
                    COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled
                FROM orders
            """)
        else:
            # SQLite doesn't support FILTER, use CASE WHEN
            cursor.execute("""
                SELECT 
                    SUM(CASE WHEN status = 'pending' AND rider_id IS NULL THEN 1 ELSE 0 END) as pending_unassigned,
                    SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted,
                    SUM(CASE WHEN status = 'preparing' THEN 1 ELSE 0 END) as preparing,
                    SUM(CASE WHEN status = 'out_for_delivery' THEN 1 ELSE 0 END) as out_for_delivery,
                    SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
                    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
                FROM orders
            """)
        
        row = cursor.fetchone()
        if row:
            if isinstance(row, dict):
                stats = dict(row)
            else:
                columns = [col[0] for col in cursor.description]
                stats = dict(zip(columns, row))
        else:
            stats = {
                "pending_unassigned": 0,
                "accepted": 0,
                "preparing": 0,
                "out_for_delivery": 0,
                "delivered": 0,
                "cancelled": 0
            }
        
        # Get total orders today
        if is_postgres(conn):
            cursor.execute(
                "SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURRENT_DATE"
            )
        else:
            cursor.execute(
                "SELECT COUNT(*) FROM orders WHERE DATE(created_at) = DATE('now')"
            )
        
        row = cursor.fetchone()
        if row:
            if isinstance(row, dict):
                stats["today_orders"] = list(row.values())[0]
            else:
                stats["today_orders"] = row[0]
        else:
            stats["today_orders"] = 0
        
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch delivery overview: {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()


@router.get("/riders/available", dependencies=[Depends(get_current_admin)])
@limiter.limit(get_rate_limit("admin"))
def get_available_riders(request: Request):
    """
    Get all available riders (riders who are available and not currently delivering).
    Admin-only endpoint. Rate limited to 50 requests per minute.
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        if is_postgres(conn):
            cursor.execute("""
                SELECT r.* FROM rider_credentials r
                WHERE r.is_available = true
                AND r.id NOT IN (
                    SELECT DISTINCT rider_id FROM orders 
                    WHERE status IN ('accepted', 'preparing', 'out_for_delivery')
                    AND rider_id IS NOT NULL
                )
                ORDER BY r.name
            """)
        else:
            cursor.execute("""
                SELECT r.* FROM rider_credentials r
                WHERE r.is_available = 1
                AND r.id NOT IN (
                    SELECT DISTINCT rider_id FROM orders 
                    WHERE status IN ('accepted', 'preparing', 'out_for_delivery')
                    AND rider_id IS NOT NULL
                )
                ORDER BY r.name
            """)
        
        rows = cursor.fetchall()
        riders = []
        for row in rows:
            if isinstance(row, dict):
                riders.append(dict(row))
            else:
                columns = [col[0] for col in cursor.description]
                riders.append(dict(zip(columns, row)))
        
        return riders
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch available riders: {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()


