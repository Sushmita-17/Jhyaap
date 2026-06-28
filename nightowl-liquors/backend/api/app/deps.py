import random
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Optional

from fastapi import Cookie, Depends, Header, HTTPException, Request, status
from sqlalchemy.orm import Session, joinedload

from app.config import get_settings
from app.database import get_db
from app.models import (
    Address,
    Brand,
    Cart,
    CartItem,
    Category,
    Coupon,
    Customer,
    DeliveryArea,
    Order,
    OrderItem,
    OrderStatusHistory,
    OTPVerification,
    Product,
    User,
)
from app.schemas import AddressOut, CartItemOut, CartOut, ProductOut, UserOut

settings = get_settings()
CART_SESSION_COOKIE = 'jhyaap_cart_session'


def get_optional_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> Optional[User]:
    if not authorization or not authorization.startswith('Bearer '):
        return None
    from app.security import get_user_from_token

    token = authorization.split(' ', 1)[1]
    return get_user_from_token(db, token)


def get_current_user(user: Optional[User] = Depends(get_optional_user)) -> User:
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Authentication required')
    return user


def get_current_admin(user: User = Depends(get_current_user)) -> User:
    """Verify user is an admin"""
    if not user.is_staff or user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Admin access required',
        )
    return user


def get_current_customer(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Customer:
    customer = db.query(Customer).filter(Customer.user_id == user.id).first()
    if not customer:
        raise HTTPException(status_code=404, detail='Customer profile not found')
    return customer


def get_session_key(request: Request, jhyaap_cart_session: Optional[str] = Cookie(None)) -> str:
    return jhyaap_cart_session or request.headers.get('X-Cart-Session') or ''


def product_to_schema(product: Product) -> ProductOut:
    images = product.images or []
    image = images[0] if images else ''
    effective_price = product.discount_price if product.discount_price else product.price
    return ProductOut(
        id=product.id,
        legacy_id=product.legacy_id or '',
        name=product.name,
        slug=product.slug,
        brand=product.brand.name if product.brand else '',
        category=product.category.name if product.category else '',
        category_slug=product.category.slug if product.category else '',
        subcategory=product.subcategory or '',
        price=effective_price,
        original_price=product.price if product.discount_price else None,
        volume=product.volume or '',
        volume_ml=product.volume_ml,
        abv=product.abv or '',
        abv_percent=product.abv_percent,
        image=image,
        images=images,
        rating=product.rating or Decimal('0'),
        reviews=product.review_count or 0,
        in_stock=product.stock > 0 and product.status == 'active',
        stock=product.stock,
        badge=product.badge or '',
        description=product.description or '',
        tags=product.tags or [],
        popularity=product.popularity or 0,
    )


def address_to_schema(address: Address) -> AddressOut:
    return AddressOut(
        id=address.id,
        label=address.label,
        area=address.area.name,
        area_id=address.area_id,
        street=address.street,
        landmark=address.landmark or '',
        is_default=address.is_default,
        delivery_fee=address.area.delivery_fee,
    )


def get_or_create_cart(
    db: Session,
    session_key: str,
    customer: Optional[Customer] = None,
) -> Cart:
    cart = None
    if customer:
        cart = db.query(Cart).filter(Cart.customer_id == customer.id).first()
    if not cart and session_key:
        cart = db.query(Cart).filter(Cart.session_key == session_key).first()
    if not cart:
        cart = Cart(
            id=uuid.uuid4(),
            customer_id=customer.id if customer else None,
            session_key=session_key or secrets.token_urlsafe(16),
        )
        db.add(cart)
        db.commit()
        db.refresh(cart)
    elif customer and not cart.customer_id:
        cart.customer_id = customer.id
        db.commit()
    return cart


def calculate_cart_totals(db: Session, cart: Cart, delivery_fee: Decimal = Decimal('0')) -> CartOut:
    db.refresh(cart)
    items_out: list[CartItemOut] = []
    subtotal = Decimal('0')

    for item in cart.items:
        product = (
            db.query(Product)
            .options(joinedload(Product.brand), joinedload(Product.category))
            .filter(Product.id == item.product_id)
            .first()
        )
        if not product:
            continue
        schema = product_to_schema(product)
        line_total = schema.price * item.quantity
        subtotal += line_total
        items_out.append(CartItemOut(product=schema, quantity=item.quantity))

    discount = Decimal('0')
    coupon_code = None
    if cart.coupon_id:
        coupon = db.query(Coupon).filter(Coupon.id == cart.coupon_id, Coupon.is_active.is_(True)).first()
        if coupon and subtotal >= coupon.min_order:
            coupon_code = coupon.code
            if coupon.type == 'percentage':
                discount = (subtotal * coupon.value / Decimal('100')).quantize(Decimal('0.01'))
            elif coupon.type == 'flat':
                discount = coupon.value
            elif coupon.type == 'free_delivery':
                delivery_fee = Decimal('0')

    if delivery_fee == Decimal('0') and subtotal < settings.free_delivery_threshold:
        delivery_fee = Decimal(str(settings.default_delivery_fee))
    elif subtotal >= settings.free_delivery_threshold:
        delivery_fee = Decimal('0')

    total = subtotal - discount + delivery_fee
    item_count = sum(i.quantity for i in cart.items)

    return CartOut(
        id=cart.id,
        items=items_out,
        subtotal=subtotal,
        discount=discount,
        coupon_code=coupon_code,
        delivery_fee=delivery_fee,
        total=total,
        item_count=item_count,
    )


def generate_otp() -> str:
    return f'{random.randint(100000, 999999)}'


def create_otp_record(db: Session, phone: str) -> OTPVerification:
    now = datetime.now(timezone.utc)
    locked = (
        db.query(OTPVerification)
        .filter(OTPVerification.phone == phone, OTPVerification.locked_until.isnot(None))
        .order_by(OTPVerification.created_at.desc())
        .first()
    )
    if locked and locked.locked_until and locked.locked_until.replace(tzinfo=timezone.utc) > now:
        raise HTTPException(status_code=429, detail='Too many attempts. Try again later.')

    code = generate_otp()
    record = OTPVerification(
        id=uuid.uuid4(),
        phone=phone,
        code=code,
        attempts=0,
        is_verified=False,
        expires_at=now + timedelta(minutes=settings.otp_expire_minutes),
    )
    db.add(record)
    db.commit()
    return record


def user_to_schema(db: Session, user: User) -> UserOut:
    customer = db.query(Customer).filter(Customer.user_id == user.id).first()
    return UserOut(
        id=user.id,
        phone=user.phone,
        email=user.email,
        role=user.role,
        name=customer.name if customer else None,
        wallet_balance=customer.wallet_balance if customer else Decimal('0'),
    )


def generate_order_number() -> str:
    ts = datetime.now().strftime('%Y%m%d')
    suffix = secrets.token_hex(3).upper()
    return f'JHY-{ts}-{suffix}'
