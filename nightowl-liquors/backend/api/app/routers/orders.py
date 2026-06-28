import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from ..config import get_settings
from ..database import get_db
from ..deps import (

    address_to_schema,
    calculate_cart_totals,
    generate_order_number,
    get_current_customer,
    get_optional_user,
    get_or_create_cart,
    get_session_key,
)
from ..models import (
    Address,
    CartItem,
    Customer,
    DeliveryArea,
    DeliveryStaff,
    Order,
    OrderItem,
    OrderStatusHistory,
    Product,
    User,
)
from ..schemas import OrderCreateRequest, OrderItemOut, OrderOut, OrderStatusUpdate, PaymentInitResponse


router = APIRouter(prefix='/orders', tags=['Orders'])
settings = get_settings()

STATUS_TIMELINE = [
    ('placed', 'Order Placed', 'Your order has been received'),
    ('confirmed', 'Confirmed', 'Order confirmed by store'),
    ('preparing', 'Preparing', 'Your order is being prepared'),
    ('out_for_delivery', 'Out for Delivery', 'On the way to you'),
    ('delivered', 'Delivered', 'Order completed'),
]


def order_to_schema(db: Session, order: Order) -> OrderOut:
    address = db.query(Address).options(joinedload(Address.area)).filter(Address.id == order.address_id).first()
    staff = None
    if order.delivery_staff_id:
        staff = db.query(DeliveryStaff).filter(DeliveryStaff.id == order.delivery_staff_id).first()

    items_out = []
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        images = product.images if product else []
        items_out.append(
            OrderItemOut(
                product_id=item.product_id,
                product_name=item.product_name,
                quantity=item.quantity,
                unit_price=item.unit_price,
                total=item.total,
                image=images[0] if images else '',
            )
        )

    current_idx = next((i for i, (s, _, _) in enumerate(STATUS_TIMELINE) if s == order.status), 0)
    timeline = []
    for idx, (stage, label, desc) in enumerate(STATUS_TIMELINE):
        if stage == 'cancelled':
            continue
        status_state = 'completed' if idx < current_idx else ('current' if idx == current_idx else 'pending')
        timeline.append({'stage': stage, 'label': label, 'description': desc, 'state': status_state})

    return OrderOut(
        id=order.id,
        order_number=order.order_number,
        status=order.status,
        payment_method=order.payment_method,
        payment_status=order.payment_status,
        subtotal=order.subtotal,
        delivery_fee=order.delivery_fee,
        discount=order.discount,
        total=order.total,
        notes=order.notes or '',
        items=items_out,
        address=address_to_schema(address),
        created_at=order.created_at,
        eta=order.eta,
        delivery_staff_name=staff.name if staff else None,
        delivery_staff_phone=staff.phone if staff else None,
        status_timeline=timeline,
    )


@router.post('', response_model=OrderOut | PaymentInitResponse, status_code=201)
def create_order(
    payload: OrderCreateRequest,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_optional_user),
    session_key: str = Depends(get_session_key),
):
    if not payload.age_verified:
        raise HTTPException(status_code=400, detail='Age verification is required')

    customer = db.query(Customer).filter(Customer.user_id == user.id).first() if user else None

    if not customer and not (payload.guest_name and payload.guest_phone and payload.guest_address):
        raise HTTPException(status_code=401, detail='Login required or provide guest checkout details')

    if not customer and payload.guest_name and payload.guest_phone:
        from app.models import User as UserModel

        existing_user = db.query(UserModel).filter(UserModel.phone == payload.guest_phone).first()
        if existing_user:
            customer = db.query(Customer).filter(Customer.user_id == existing_user.id).first()
        else:
            new_user = UserModel(
                id=uuid.uuid4(),
                phone=payload.guest_phone,
                role='customer',
                is_active=True,
                is_staff=False,
                password='!',
            )
            db.add(new_user)
            db.flush()
            customer = Customer(id=uuid.uuid4(), user_id=new_user.id, name=payload.guest_name, referral_code='GUEST')
            db.add(customer)
            db.flush()

    cart = get_or_create_cart(db, session_key, customer)
    if not cart.items:
        raise HTTPException(status_code=400, detail='Cart is empty')

    for item in cart.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product or product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f'{product.name if product else "Product"} is out of stock')

    if payload.address_id:
        address = (
            db.query(Address)
            .options(joinedload(Address.area))
            .filter(Address.id == payload.address_id, Address.customer_id == customer.id)
            .first()
        )
        if not address:
            raise HTTPException(status_code=400, detail='Invalid address')
    elif payload.guest_address:
        area = (
            db.query(DeliveryArea)
            .filter(DeliveryArea.id == payload.guest_address.area_id, DeliveryArea.is_active.is_(True))
            .first()
        )
        if not area:
            raise HTTPException(status_code=400, detail='Invalid delivery area')
        address = Address(
            id=uuid.uuid4(),
            customer_id=customer.id,
            label=payload.guest_address.label,
            area_id=payload.guest_address.area_id,
            street=payload.guest_address.street,
            landmark=payload.guest_address.landmark,
            is_default=True,
        )
        db.add(address)
        db.flush()
        address.area = area
    else:
        raise HTTPException(status_code=400, detail='Delivery address is required')

    cart_summary = calculate_cart_totals(db, cart, delivery_fee=address.area.delivery_fee)
    if cart_summary.subtotal < settings.min_order_value:
        raise HTTPException(status_code=400, detail=f'Minimum order value is Rs {settings.min_order_value}')

    is_digital = payload.payment_method in ('esewa', 'khalti')
    initial_status = 'pending_payment' if is_digital else 'placed'
    payment_status = 'pending' if is_digital else ('paid' if payload.payment_method == 'cod' else 'pending')

    order = Order(
        id=uuid.uuid4(),
        order_number=generate_order_number(),
        customer_id=customer.id,
        address_id=address.id,
        subtotal=cart_summary.subtotal,
        delivery_fee=cart_summary.delivery_fee,
        discount=cart_summary.discount,
        coupon_id=cart.coupon_id,
        total=cart_summary.total,
        status=initial_status,
        payment_method=payload.payment_method,
        payment_status=payment_status,
        notes=payload.notes,
        age_verified=True,
        eta=datetime.now(timezone.utc) + timedelta(minutes=address.area.eta_minutes),
    )
    db.add(order)

    for item in cart.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        unit_price = product.discount_price or product.price
        db.add(
            OrderItem(
                id=uuid.uuid4(),
                order_id=order.id,
                product_id=product.id,
                product_name=product.name,
                quantity=item.quantity,
                unit_price=unit_price,
                total=unit_price * item.quantity,
            )
        )
        product.stock -= item.quantity
        if product.stock <= 0:
            product.status = 'out_of_stock'

    db.add(OrderStatusHistory(id=uuid.uuid4(), order_id=order.id, status=initial_status, note='Order created'))

    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    cart.coupon_id = None
    db.commit()
    db.refresh(order)

    if is_digital:
        return PaymentInitResponse(
            order_id=order.id,
            order_number=order.order_number,
            payment_method=payload.payment_method,
            amount=order.total,
            redirect_url=f'/api/orders/{order.id}/payment/init',
            message='Complete payment to confirm your order',
        )

    return order_to_schema(db, order)


@router.get('', response_model=list[OrderOut])
def list_orders(customer: Customer = Depends(get_current_customer), db: Session = Depends(get_db)):
    orders = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.customer_id == customer.id)
        .order_by(Order.created_at.desc())
        .all()
    )
    return [order_to_schema(db, o) for o in orders]


@router.get('/{order_id}', response_model=OrderOut)
def get_order(order_id: uuid.UUID, customer: Customer = Depends(get_current_customer), db: Session = Depends(get_db)):
    order = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.id == order_id, Order.customer_id == customer.id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail='Order not found')
    return order_to_schema(db, order)


@router.get('/{order_id}/tracking', response_model=OrderOut)
def track_order(order_id: uuid.UUID, customer: Customer = Depends(get_current_customer), db: Session = Depends(get_db)):
    return get_order(order_id, customer, db)


@router.put('/{order_id}/status', response_model=OrderOut)
def update_order_status(
    order_id: uuid.UUID,
    payload: OrderStatusUpdate,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_optional_user),
):
    if not user or user.role not in ('admin', 'delivery_staff'):
        raise HTTPException(status_code=403, detail='Admin access required')

    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail='Order not found')

    order.status = payload.status
    if payload.status == 'delivered':
        order.payment_status = 'paid' if order.payment_method == 'cod' else order.payment_status

    db.add(OrderStatusHistory(id=uuid.uuid4(), order_id=order.id, status=payload.status, note=payload.note))
    db.commit()
    return order_to_schema(db, order)


@router.post('/{order_id}/payment/confirm', response_model=OrderOut)
def confirm_payment(order_id: uuid.UUID, reference: str = '', db: Session = Depends(get_db)):
    """Payment gateway callback stub — wire eSewa/Khalti verification here."""
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail='Order not found')
    if order.payment_status == 'paid':
        return order_to_schema(db, order)

    order.payment_status = 'paid'
    order.payment_reference = reference
    order.status = 'placed'
    db.add(OrderStatusHistory(id=uuid.uuid4(), order_id=order.id, status='placed', note='Payment confirmed'))
    db.commit()
    return order_to_schema(db, order)
