from typing import Optional, List
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, status, Request, Depends

from app.db.database import get_connection, is_postgres
from app.middleware.rate_limiter import limiter, get_rate_limit
from app.middleware.auth import get_current_admin

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/sales/summary", dependencies=[Depends(get_current_admin)])
@limiter.limit(get_rate_limit("admin"))
def get_sales_summary(request: Request, days: int = 30):
    """
    Get sales summary for the specified number of days.
    Admin-only endpoint. Rate limited to 50 requests per minute.
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        start_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        if is_postgres(conn):
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_orders,
                    SUM(total) as total_revenue,
                    SUM(delivery_fee) as total_delivery_fees,
                    SUM(tax) as total_tax,
                    AVG(total) as average_order_value,
                    COUNT(*) FILTER (WHERE status = 'delivered') as delivered_orders,
                    COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_orders
                FROM orders
                WHERE created_at >= %s
            """, (start_date,))
        else:
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_orders,
                    SUM(total) as total_revenue,
                    SUM(delivery_fee) as total_delivery_fees,
                    SUM(tax) as total_tax,
                    AVG(total) as average_order_value,
                    SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders,
                    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders
                FROM orders
                WHERE created_at >= ?
            """, (start_date,))
        
        row = cursor.fetchone()
        if row:
            if isinstance(row, dict):
                stats = dict(row)
            else:
                columns = [col[0] for col in cursor.description]
                stats = dict(zip(columns, row))
        else:
            stats = {
                "total_orders": 0,
                "total_revenue": 0,
                "total_delivery_fees": 0,
                "total_tax": 0,
                "average_order_value": 0,
                "delivered_orders": 0,
                "cancelled_orders": 0
            }
        
        # Calculate delivery rate
        if stats["total_orders"] > 0:
            stats["delivery_rate"] = (stats["delivered_orders"] / stats["total_orders"]) * 100
        else:
            stats["delivery_rate"] = 0
        
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch sales summary: {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()


@router.get("/sales/daily", dependencies=[Depends(get_current_admin)])
@limiter.limit(get_rate_limit("admin"))
def get_daily_sales(request: Request, days: int = 30):
    """
    Get daily sales breakdown for the specified number of days.
    Admin-only endpoint. Rate limited to 50 requests per minute.
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        start_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        if is_postgres(conn):
            cursor.execute("""
                SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as orders,
                    SUM(total) as revenue,
                    SUM(delivery_fee) as delivery_fees,
                    COUNT(*) FILTER (WHERE status = 'delivered') as delivered
                FROM orders
                WHERE created_at >= %s
                GROUP BY DATE(created_at)
                ORDER BY date DESC
            """, (start_date,))
        else:
            cursor.execute("""
                SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as orders,
                    SUM(total) as revenue,
                    SUM(delivery_fee) as delivery_fees,
                    SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered
                FROM orders
                WHERE created_at >= ?
                GROUP BY DATE(created_at)
                ORDER BY date DESC
            """, (start_date,))
        
        rows = cursor.fetchall()
        daily_sales = []
        for row in rows:
            if isinstance(row, dict):
                daily_sales.append(dict(row))
            else:
                columns = [col[0] for col in cursor.description]
                daily_sales.append(dict(zip(columns, row)))
        
        return daily_sales
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch daily sales: {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()


@router.get("/products/popular", dependencies=[Depends(get_current_admin)])
@limiter.limit(get_rate_limit("admin"))
def get_popular_products(request: Request, limit: int = 20):
    """
    Get most popular products based on order frequency.
    Admin-only endpoint. Rate limited to 50 requests per minute.
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        # This is a simplified version - in production you'd have order_items table
        # For now, we'll return products sorted by rating as a proxy
        if is_postgres(conn):
            cursor.execute("""
                SELECT id, name, category, price, rating, reviews
                FROM products
                ORDER BY rating DESC, reviews DESC
                LIMIT %s
            """, (limit,))
        else:
            cursor.execute("""
                SELECT id, name, category, price, rating, reviews
                FROM products
                ORDER BY rating DESC, reviews DESC
                LIMIT ?
            """, (limit,))
        
        rows = cursor.fetchall()
        products = []
        for row in rows:
            if isinstance(row, dict):
                products.append(dict(row))
            else:
                columns = [col[0] for col in cursor.description]
                products.append(dict(zip(columns, row)))
        
        return products
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch popular products: {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()


@router.get("/customers/active", dependencies=[Depends(get_current_admin)])
@limiter.limit(get_rate_limit("admin"))
def get_active_customers(request: Request, days: int = 30, limit: int = 50):
    """
    Get most active customers based on order count in the specified period.
    Admin-only endpoint. Rate limited to 50 requests per minute.
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        start_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        if is_postgres(conn):
            cursor.execute("""
                SELECT 
                    c.id,
                    c.name,
                    c.phone_number,
                    COUNT(o.id) as order_count,
                    SUM(o.total) as total_spent
                FROM customers c
                LEFT JOIN orders o ON c.id = o.customer_id AND o.created_at >= %s
                GROUP BY c.id
                ORDER BY order_count DESC, total_spent DESC
                LIMIT %s
            """, (start_date, limit))
        else:
            cursor.execute("""
                SELECT 
                    c.id,
                    c.name,
                    c.phone_number,
                    COUNT(o.id) as order_count,
                    SUM(o.total) as total_spent
                FROM customers c
                LEFT JOIN orders o ON c.id = o.customer_id AND o.created_at >= ?
                GROUP BY c.id
                ORDER BY order_count DESC, total_spent DESC
                LIMIT ?
            """, (start_date, limit))
        
        rows = cursor.fetchall()
        customers = []
        for row in rows:
            if isinstance(row, dict):
                customers.append(dict(row))
            else:
                columns = [col[0] for col in cursor.description]
                customers.append(dict(zip(columns, row)))
        
        return customers
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch active customers: {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()


@router.get("/riders/performance", dependencies=[Depends(get_current_admin)])
@limiter.limit(get_rate_limit("admin"))
def get_rider_performance(request: Request, days: int = 30):
    """
    Get rider performance metrics including deliveries and earnings.
    Admin-only endpoint. Rate limited to 50 requests per minute.
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        start_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        if is_postgres(conn):
            cursor.execute("""
                SELECT 
                    r.id,
                    r.name,
                    r.phone_number,
                    r.vehicle_type,
                    COUNT(o.id) FILTER (WHERE o.status = 'delivered') as deliveries,
                    SUM(o.delivery_fee) FILTER (WHERE o.status = 'delivered') as earnings,
                    AVG(
                        CASE 
                            WHEN o.status = 'delivered' THEN 
                                EXTRACT(EPOCH FROM (o.updated_at - o.created_at)) / 3600
                            ELSE NULL 
                        END
                    ) as avg_delivery_hours
                FROM rider_credentials r
                LEFT JOIN orders o ON r.id = o.rider_id AND o.created_at >= %s
                GROUP BY r.id
                ORDER BY deliveries DESC
            """, (start_date,))
        else:
            cursor.execute("""
                SELECT 
                    r.id,
                    r.name,
                    r.phone_number,
                    r.vehicle_type,
                    SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) as deliveries,
                    SUM(CASE WHEN o.status = 'delivered' THEN o.delivery_fee ELSE 0 END) as earnings,
                    AVG(
                        CASE 
                            WHEN o.status = 'delivered' THEN 
                                (julianday(o.updated_at) - julianday(o.created_at)) * 24
                            ELSE NULL 
                        END
                    ) as avg_delivery_hours
                FROM rider_credentials r
                LEFT JOIN orders o ON r.id = o.rider_id AND o.created_at >= ?
                GROUP BY r.id
                ORDER BY deliveries DESC
            """, (start_date,))
        
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
            detail=f"Failed to fetch rider performance: {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()


@router.get("/coupons/usage", dependencies=[Depends(get_current_admin)])
@limiter.limit(get_rate_limit("admin"))
def get_coupon_usage(request: Request, days: int = 30):
    """
    Get coupon usage statistics for the specified period.
    Admin-only endpoint. Rate limited to 50 requests per minute.
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        start_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        if is_postgres(conn):
            cursor.execute("""
                SELECT 
                    c.code,
                    c.description,
                    c.coupon_type,
                    c.value,
                    c.usage_limit,
                    c.usage_count,
                    COUNT(o.id) as times_used,
                    SUM(o.discount_amount) as total_discount_given
                FROM coupons c
                LEFT JOIN orders o ON c.code = o.coupon_code AND o.created_at >= %s
                GROUP BY c.id
                ORDER BY times_used DESC
            """, (start_date,))
        else:
            cursor.execute("""
                SELECT 
                    c.code,
                    c.description,
                    c.coupon_type,
                    c.value,
                    c.usage_limit,
                    c.usage_count,
                    COUNT(o.id) as times_used,
                    SUM(o.discount_amount) as total_discount_given
                FROM coupons c
                LEFT JOIN orders o ON c.code = o.coupon_code AND o.created_at >= ?
                GROUP BY c.id
                ORDER BY times_used DESC
            """, (start_date,))
        
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
            detail=f"Failed to fetch coupon usage: {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()


@router.get("/revenue/forecast", dependencies=[Depends(get_current_admin)])
@limiter.limit(get_rate_limit("admin"))
def get_revenue_forecast(request: Request, days: int = 7):
    """
    Get simple revenue forecast based on recent trends.
    Admin-only endpoint. Rate limited to 50 requests per minute.
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        # Get average daily revenue from the specified period
        start_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        if is_postgres(conn):
            cursor.execute("""
                SELECT 
                    AVG(daily_revenue) as avg_daily_revenue,
                    COUNT(*) as days_analyzed
                FROM (
                    SELECT 
                        DATE(created_at) as order_date,
                        SUM(total) as daily_revenue
                    FROM orders
                    WHERE created_at >= %s AND status = 'delivered'
                    GROUP BY DATE(created_at)
                ) daily
            """, (start_date,))
        else:
            cursor.execute("""
                SELECT 
                    AVG(daily_revenue) as avg_daily_revenue,
                    COUNT(*) as days_analyzed
                FROM (
                    SELECT 
                        DATE(created_at) as order_date,
                        SUM(total) as daily_revenue
                    FROM orders
                    WHERE created_at >= ? AND status = 'delivered'
                    GROUP BY DATE(created_at)
                ) daily
            """, (start_date,))
        
        row = cursor.fetchone()
        if row:
            if isinstance(row, dict):
                forecast_data = dict(row)
            else:
                columns = [col[0] for col in cursor.description]
                forecast_data = dict(zip(columns, row))
        else:
            forecast_data = {
                "avg_daily_revenue": 0,
                "days_analyzed": 0
            }
        
        # Calculate 7-day and 30-day forecasts
        avg_daily = forecast_data.get("avg_daily_revenue", 0)
        forecast_data["weekly_forecast"] = avg_daily * 7
        forecast_data["monthly_forecast"] = avg_daily * 30
        
        return forecast_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch revenue forecast: {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()


