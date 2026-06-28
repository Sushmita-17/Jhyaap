import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, and_
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..deps import get_current_admin
from ..models import (

    Order,
    OrderItem,
    OrderStatusHistory,
    Product,
    Customer,
    User,
    DeliveryStaff,
    Category,
)
from app.schemas import OrderOut

router = APIRouter(prefix='/admin', tags=['Admin'])


# --- Admin Auth Check ---
def check_admin(db: Session, user: User) -> User:
    """Verify user is admin"""
    if not user.is_staff or user.role != 'admin':
        raise HTTPException(status_code=403, detail='Admin access required')
    return user


# --- Schemas ---

class SalesKPIResponse:
    total_revenue: Decimal
    total_orders: int
    avg_order_value: Decimal
    items_sold: int
    new_customers: int
    repeat_customers: int
    top_category: str
    top_product: str


class RevenueByPeriod:
    period: str  # daily, weekly, monthly
    labels: list[str]
    values: list[float]
    total: Decimal


class BillDetail:
    id: str
    order_number: str
    customer_name: str
    customer_phone: str
    total_amount: Decimal
    payment_method: str
    payment_status: str
    order_status: str
    items_count: int
    created_at: datetime
    delivery_address: str


class AdminReportResponse:
    period: str
    kpis: dict
    revenue_data: dict
    bills: list[BillDetail]
    category_breakdown: list[dict]
    payment_breakdown: list[dict]
    order_status_breakdown: list[dict]


# --- KPI Endpoints ---

@router.get('/kpis/summary')
def get_kpis_summary(
    period: str = Query('daily', regex='^(daily|weekly|monthly|yearly)$'),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Get key performance indicators"""
    check_admin(db, admin)

    # Calculate date range
    now = datetime.utcnow()
    if period == 'daily':
        start_date = now - timedelta(days=7)
    elif period == 'weekly':
        start_date = now - timedelta(weeks=4)
    elif period == 'monthly':
        start_date = now - timedelta(days=180)
    else:  # yearly
        start_date = now - timedelta(days=365)

    # Get orders in period
    orders_in_period = db.query(Order).filter(Order.created_at >= start_date).all()

    # Calculate metrics
    total_revenue = sum(Decimal(str(o.total)) for o in orders_in_period)
    total_orders = len(orders_in_period)
    avg_order_value = total_revenue / total_orders if total_orders > 0 else Decimal('0')
    items_sold = sum(sum(item.quantity for item in o.items) for o in orders_in_period)

    # Get new vs repeat customers
    unique_customers = set(o.customer_id for o in orders_in_period)
    new_customers = db.query(Customer).filter(
        and_(Customer.created_at >= start_date, Customer.id.in_(unique_customers))
    ).count()
    repeat_customers = len(unique_customers) - new_customers

    # Get top category
    top_category_result = db.query(
        Category.name, func.count(OrderItem.id).label('count')
    ).join(Product).join(OrderItem).join(Order).filter(
        Order.created_at >= start_date
    ).group_by(Category.name).order_by(func.count(OrderItem.id).desc()).first()

    top_category = top_category_result[0] if top_category_result else 'N/A'

    # Get top product
    top_product_result = db.query(
        Product.name, func.sum(OrderItem.quantity).label('total_qty')
    ).join(OrderItem).join(Order).filter(
        Order.created_at >= start_date
    ).group_by(Product.name).order_by(func.sum(OrderItem.quantity).desc()).first()

    top_product = top_product_result[0] if top_product_result else 'N/A'

    return {
        'period': period,
        'total_revenue': float(total_revenue),
        'total_orders': total_orders,
        'avg_order_value': float(avg_order_value),
        'items_sold': items_sold,
        'new_customers': new_customers,
        'repeat_customers': repeat_customers,
        'top_category': top_category,
        'top_product': top_product,
    }


# --- Revenue Data by Period ---

@router.get('/revenue/by-period')
def get_revenue_by_period(
    period: str = Query('daily', regex='^(daily|weekly|monthly|yearly)$'),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Get revenue breakdown by time period"""
    check_admin(db, admin)

    now = datetime.utcnow()
    labels = []
    values = []

    if period == 'daily':
        # Last 7 days
        for i in range(6, -1, -1):
            date = now - timedelta(days=i)
            start = date.replace(hour=0, minute=0, second=0, microsecond=0)
            end = start + timedelta(days=1)
            revenue = db.query(func.sum(Order.total)).filter(
                and_(Order.created_at >= start, Order.created_at < end)
            ).scalar() or 0
            labels.append(date.strftime('%a, %b %d'))
            values.append(float(revenue))

    elif period == 'weekly':
        # Last 4 weeks
        for i in range(3, -1, -1):
            week_start = now - timedelta(weeks=i + 1)
            week_end = week_start + timedelta(weeks=1)
            revenue = db.query(func.sum(Order.total)).filter(
                and_(Order.created_at >= week_start, Order.created_at < week_end)
            ).scalar() or 0
            labels.append(f"Week {week_start.strftime('%b %d')}")
            values.append(float(revenue))

    elif period == 'monthly':
        # Last 6 months
        for i in range(5, -1, -1):
            month_start = (now - timedelta(days=now.day)).replace(day=1) - timedelta(days=i * 30)
            month_end = month_start + timedelta(days=32)
            revenue = db.query(func.sum(Order.total)).filter(
                and_(Order.created_at >= month_start, Order.created_at < month_end)
            ).scalar() or 0
            labels.append(month_start.strftime('%b %Y'))
            values.append(float(revenue))

    else:  # yearly
        # Last 5 years
        for i in range(4, -1, -1):
            year_start = now.replace(year=now.year - i, month=1, day=1)
            year_end = year_start.replace(year=year_start.year + 1)
            revenue = db.query(func.sum(Order.total)).filter(
                and_(Order.created_at >= year_start, Order.created_at < year_end)
            ).scalar() or 0
            labels.append(str(year_start.year))
            values.append(float(revenue))

    total_revenue = sum(values)
    return {
        'period': period,
        'labels': labels,
        'values': values,
        'total': float(total_revenue),
    }


# --- Bills/Invoices ---

@router.get('/bills')
def get_bills(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    payment_method: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Get all bills/invoices with pagination"""
    check_admin(db, admin)

    query = db.query(Order).options(
        joinedload(Order.customer),
        joinedload(Order.address),
        joinedload(Order.items),
    )

    if status:
        query = query.filter(Order.status == status)
    if payment_method:
        query = query.filter(Order.payment_method == payment_method)

    total = query.count()
    orders = query.order_by(Order.created_at.desc()).offset(
        (page - 1) * page_size
    ).limit(page_size).all()

    bills = []
    for order in orders:
        bills.append({
            'id': str(order.id),
            'order_number': order.order_number,
            'customer_name': order.customer.user.email or 'Anonymous',
            'customer_phone': order.customer.user.phone,
            'total_amount': float(order.total),
            'subtotal': float(order.subtotal),
            'delivery_fee': float(order.delivery_fee),
            'discount': float(order.discount),
            'payment_method': order.payment_method,
            'payment_status': order.payment_status,
            'order_status': order.status,
            'items_count': len(order.items),
            'created_at': order.created_at.isoformat(),
            'delivery_address': f"{order.address.street}, {order.address.landmark if order.address.landmark else ''}",
        })

    return {
        'items': bills,
        'total': total,
        'page': page,
        'page_size': page_size,
        'pages': (total + page_size - 1) // page_size,
    }


@router.get('/bills/{bill_id}')
def get_bill_detail(
    bill_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Get detailed bill/invoice information"""
    check_admin(db, admin)

    try:
        order_uuid = uuid.UUID(bill_id)
    except ValueError:
        raise HTTPException(status_code=400, detail='Invalid bill ID')

    order = db.query(Order).options(
        joinedload(Order.customer),
        joinedload(Order.address),
        joinedload(Order.items),
        joinedload(Order.status_history),
    ).filter(Order.id == order_uuid).first()

    if not order:
        raise HTTPException(status_code=404, detail='Bill not found')

    # Build detailed response
    items_detail = []
    for item in order.items:
        items_detail.append({
            'product_name': item.product_name,
            'quantity': item.quantity,
            'unit_price': float(item.unit_price),
            'total': float(item.total),
        })

    status_history = []
    for history in order.status_history:
        status_history.append({
            'status': history.status,
            'note': history.note,
            'created_at': history.created_at.isoformat(),
        })

    return {
        'id': str(order.id),
        'order_number': order.order_number,
        'customer': {
            'name': order.customer.user.email or 'Anonymous',
            'phone': order.customer.user.phone,
        },
        'address': {
            'street': order.address.street,
            'landmark': order.address.landmark,
            'area': order.address.area.name if order.address.area else 'Unknown',
        },
        'items': items_detail,
        'subtotal': float(order.subtotal),
        'delivery_fee': float(order.delivery_fee),
        'discount': float(order.discount),
        'total': float(order.total),
        'payment_method': order.payment_method,
        'payment_status': order.payment_status,
        'order_status': order.status,
        'status_history': status_history,
        'notes': order.notes or '',
        'created_at': order.created_at.isoformat(),
        'age_verified': order.age_verified,
    }


# --- Category Breakdown ---

@router.get('/analytics/categories')
def get_category_breakdown(
    period: str = Query('monthly', regex='^(daily|weekly|monthly|yearly)$'),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Get sales breakdown by category"""
    check_admin(db, admin)

    now = datetime.utcnow()
    if period == 'daily':
        start_date = now - timedelta(days=7)
    elif period == 'weekly':
        start_date = now - timedelta(weeks=4)
    elif period == 'monthly':
        start_date = now - timedelta(days=180)
    else:
        start_date = now - timedelta(days=365)

    results = db.query(
        Category.name,
        func.count(OrderItem.id).label('count'),
        func.sum(OrderItem.total).label('revenue'),
    ).join(Product).join(OrderItem).join(Order).filter(
        Order.created_at >= start_date
    ).group_by(Category.name).order_by(
        func.sum(OrderItem.total).desc()
    ).all()

    categories = []
    for name, count, revenue in results:
        categories.append({
            'label': name or 'Uncategorized',
            'value': count,
            'revenue': float(revenue or 0),
        })

    return {
        'period': period,
        'data': categories,
    }


# --- Payment Method Breakdown ---

@router.get('/analytics/payment-methods')
def get_payment_breakdown(
    period: str = Query('monthly', regex='^(daily|weekly|monthly|yearly)$'),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Get sales breakdown by payment method"""
    check_admin(db, admin)

    now = datetime.utcnow()
    if period == 'daily':
        start_date = now - timedelta(days=7)
    elif period == 'weekly':
        start_date = now - timedelta(weeks=4)
    elif period == 'monthly':
        start_date = now - timedelta(days=180)
    else:
        start_date = now - timedelta(days=365)

    results = db.query(
        Order.payment_method,
        func.count(Order.id).label('count'),
        func.sum(Order.total).label('revenue'),
    ).filter(Order.created_at >= start_date).group_by(
        Order.payment_method
    ).all()

    payment_methods = []
    for method, count, revenue in results:
        label_map = {
            'cod': 'Cash on Delivery',
            'esewa': 'eSewa',
            'khalti': 'Khalti',
            'card': 'Card',
        }
        payment_methods.append({
            'label': label_map.get(method, method),
            'value': count,
            'revenue': float(revenue or 0),
        })

    return {
        'period': period,
        'data': payment_methods,
    }


# --- Order Status Breakdown ---

@router.get('/analytics/order-status')
def get_order_status_breakdown(
    period: str = Query('monthly', regex='^(daily|weekly|monthly|yearly)$'),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Get breakdown of orders by status"""
    check_admin(db, admin)

    now = datetime.utcnow()
    if period == 'daily':
        start_date = now - timedelta(days=7)
    elif period == 'weekly':
        start_date = now - timedelta(weeks=4)
    elif period == 'monthly':
        start_date = now - timedelta(days=180)
    else:
        start_date = now - timedelta(days=365)

    results = db.query(
        Order.status,
        func.count(Order.id).label('count'),
    ).filter(Order.created_at >= start_date).group_by(
        Order.status
    ).all()

    status_labels = {
        'placed': 'Placed',
        'confirmed': 'Confirmed',
        'preparing': 'Preparing',
        'out_for_delivery': 'Out for Delivery',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled',
    }

    order_statuses = []
    for status, count in results:
        order_statuses.append({
            'label': status_labels.get(status, status),
            'value': count,
            'status': status,
        })

    return {
        'period': period,
        'data': order_statuses,
    }


# --- Peak Hours Analysis ---

@router.get('/analytics/peak-hours')
def get_peak_hours(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Get order patterns by hour"""
    check_admin(db, admin)

    # Get orders from last 7 days
    start_date = datetime.utcnow() - timedelta(days=7)

    hours_data = [0] * 24
    results = db.query(
        func.extract('hour', Order.created_at).label('hour'),
        func.count(Order.id).label('count'),
    ).filter(Order.created_at >= start_date).group_by(
        func.extract('hour', Order.created_at)
    ).all()

    for hour, count in results:
        if 0 <= hour < 24:
            hours_data[int(hour)] = count

    return {
        'labels': [f'{h:02d}:00' for h in range(24)],
        'values': hours_data,
    }


# --- Top Products ---

@router.get('/analytics/top-products')
def get_top_products(
    limit: int = Query(10, ge=1, le=50),
    period: str = Query('monthly', regex='^(daily|weekly|monthly|yearly)$'),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Get top selling products"""
    check_admin(db, admin)

    now = datetime.utcnow()
    if period == 'daily':
        start_date = now - timedelta(days=7)
    elif period == 'weekly':
        start_date = now - timedelta(weeks=4)
    elif period == 'monthly':
        start_date = now - timedelta(days=180)
    else:
        start_date = now - timedelta(days=365)

    results = db.query(
        Product.name,
        func.sum(OrderItem.quantity).label('total_qty'),
        func.sum(OrderItem.total).label('revenue'),
    ).join(OrderItem).join(Order).filter(
        Order.created_at >= start_date
    ).group_by(Product.name).order_by(
        func.sum(OrderItem.quantity).desc()
    ).limit(limit).all()

    products = []
    for name, qty, revenue in results:
        products.append({
            'name': name,
            'units_sold': int(qty or 0),
            'revenue': float(revenue or 0),
        })

    return {
        'period': period,
        'data': products,
    }
