import uuid
from typing import Optional, List
from fastapi import APIRouter, HTTPException, status, Request
from datetime import datetime

from app.db.database import fetch_earnings_by_rider, save_earning
from app.models.earning import EarningCreate, EarningResponse
from app.middleware.rate_limiter import limiter, get_rate_limit

router = APIRouter(prefix="/earnings", tags=["earnings"])


@router.get("/rider/{rider_id}", response_model=List[EarningResponse])
@limiter.limit(get_rate_limit("general"))
def get_rider_earnings(
    request: Request,
    rider_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """
    Get earnings for a specific rider, optionally filtered by date range.
    Date format: YYYY-MM-DD
    """
    try:
        earnings = fetch_earnings_by_rider(rider_id, start_date, end_date)
        return earnings
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch earnings: {str(e)}"
        )


@router.post("", response_model=EarningResponse)
@limiter.limit(get_rate_limit("general"))
def create_earning(request: Request, payload: EarningCreate):
    """
    Create a new earning record.
    Automatically updates the rider's total_earnings field.
    Called when an order is marked as delivered.
    """
    earning_data = payload.model_dump()
    earning_data["id"] = str(uuid.uuid4())
    
    try:
        saved_earning = save_earning(earning_data)
        return saved_earning
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create earning record: {str(e)}"
        )


@router.get("/rider/{rider_id}/total")
@limiter.limit(get_rate_limit("general"))
def get_rider_total_earnings(request: Request, rider_id: str):
    """Get total earnings for a rider (sum of all earnings)."""
    from app.db.database import fetch_rider_by_id
    
    rider = fetch_rider_by_id(rider_id)
    if not rider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Rider with ID '{rider_id}' not found."
        )
    
    return {
        "rider_id": rider_id,
        "total_earnings": rider.get("total_earnings", 0)
    }


@router.get("/rider/{rider_id}/cash-on-hand")
@limiter.limit(get_rate_limit("general"))
def get_rider_cash_on_hand(request: Request, rider_id: str):
    """
    Get cash on hand for a rider (sum of total amounts from delivered orders today).
    This calculates the total cash collected from orders delivered today.
    Note: Using total amount since payment-specific columns don't exist yet.
    """
    from app.db.database import get_connection, is_postgres
    from datetime import datetime, timedelta
    
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Get today's date range (start of today to end of today)
        today = datetime.now().date()
        start_of_day = datetime.combine(today, datetime.min.time())
        end_of_day = datetime.combine(today, datetime.max.time())
        
        # Query orders delivered today by this rider
        # Using rider_id column instead of delivery_staff_id (based on actual table structure)
        if is_postgres(conn):
            query = """
                SELECT COALESCE(SUM(total), 0) as total_cash
                FROM orders
                WHERE rider_id = %s
                AND status = 'delivered'
                AND updated_at >= %s
                AND updated_at <= %s
            """
            cursor.execute(query, (rider_id, start_of_day, end_of_day))
        else:
            query = """
                SELECT COALESCE(SUM(total), 0) as total_cash
                FROM orders
                WHERE rider_id = ?
                AND status = 'delivered'
                AND updated_at >= ?
                AND updated_at <= ?
            """
            cursor.execute(query, (rider_id, start_of_day, end_of_day))
        
        result = cursor.fetchone()
        cash_on_hand = result[0] if result else 0
        
        cursor.close()
        conn.close()
        
        return {
            "rider_id": rider_id,
            "cash_on_hand": float(cash_on_hand),
            "date": today.isoformat()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate cash on hand: {str(e)}"
        )
