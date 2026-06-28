import uuid

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from ..config import get_settings
from ..database import get_db
from ..deps import (
    CART_SESSION_COOKIE,
    calculate_cart_totals,
    get_current_customer,
    get_optional_user,
    get_or_create_cart,
    get_session_key,
)
from ..models import CartItem, Coupon, Customer, Product, User
from ..schemas import ApplyCouponRequest, CartAddRequest, CartOut, CartUpdateRequest


router = APIRouter(prefix='/cart', tags=['Cart'])
settings = get_settings()


def _set_cart_cookie(response: Response, session_key: str) -> None:
    response.set_cookie(
        key=CART_SESSION_COOKIE,
        value=session_key,
        httponly=False,
        samesite='lax',
        max_age=60 * 60 * 24 * 30,
    )


@router.get('', response_model=CartOut)
def get_cart(
    response: Response,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_optional_user),
    session_key: str = Depends(get_session_key),
):
    customer = db.query(Customer).filter(Customer.user_id == user.id).first() if user else None
    cart = get_or_create_cart(db, session_key, customer)
    _set_cart_cookie(response, cart.session_key)
    return calculate_cart_totals(db, cart)


@router.post('/add', response_model=CartOut)
def add_to_cart(
    payload: CartAddRequest,
    response: Response,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_optional_user),
    session_key: str = Depends(get_session_key),
):
    product = db.query(Product).filter(Product.id == payload.product_id).first()
    if not product or product.stock <= 0 or product.status != 'active':
        raise HTTPException(status_code=400, detail='Product unavailable or out of stock')

    customer = db.query(Customer).filter(Customer.user_id == user.id).first() if user else None
    cart = get_or_create_cart(db, session_key, customer)

    existing = (
        db.query(CartItem)
        .filter(CartItem.cart_id == cart.id, CartItem.product_id == payload.product_id)
        .first()
    )
    new_qty = (existing.quantity if existing else 0) + payload.quantity
    if new_qty > product.stock:
        raise HTTPException(status_code=400, detail=f'Only {product.stock} units available')

    if existing:
        existing.quantity = new_qty
    else:
        db.add(
            CartItem(
                id=uuid.uuid4(),
                cart_id=cart.id,
                product_id=payload.product_id,
                quantity=payload.quantity,
            )
        )
    db.commit()
    _set_cart_cookie(response, cart.session_key)
    return calculate_cart_totals(db, cart)


@router.put('/update', response_model=CartOut)
def update_cart_item(
    payload: CartUpdateRequest,
    response: Response,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_optional_user),
    session_key: str = Depends(get_session_key),
):
    customer = db.query(Customer).filter(Customer.user_id == user.id).first() if user else None
    cart = get_or_create_cart(db, session_key, customer)

    item = (
        db.query(CartItem)
        .filter(CartItem.cart_id == cart.id, CartItem.product_id == payload.product_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail='Item not in cart')

    if payload.quantity == 0:
        db.delete(item)
    else:
        product = db.query(Product).filter(Product.id == payload.product_id).first()
        if product and payload.quantity > product.stock:
            raise HTTPException(status_code=400, detail=f'Only {product.stock} units available')
        item.quantity = payload.quantity

    db.commit()
    _set_cart_cookie(response, cart.session_key)
    return calculate_cart_totals(db, cart)


@router.delete('/remove/{product_id}', response_model=CartOut)
def remove_from_cart(
    product_id: uuid.UUID,
    response: Response,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_optional_user),
    session_key: str = Depends(get_session_key),
):
    customer = db.query(Customer).filter(Customer.user_id == user.id).first() if user else None
    cart = get_or_create_cart(db, session_key, customer)
    db.query(CartItem).filter(CartItem.cart_id == cart.id, CartItem.product_id == product_id).delete()
    db.commit()
    _set_cart_cookie(response, cart.session_key)
    return calculate_cart_totals(db, cart)


@router.post('/apply-coupon', response_model=CartOut)
def apply_coupon(
    payload: ApplyCouponRequest,
    response: Response,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_optional_user),
    session_key: str = Depends(get_session_key),
):
    coupon = (
        db.query(Coupon)
        .filter(Coupon.code == payload.code.upper(), Coupon.is_active.is_(True))
        .first()
    )
    if not coupon:
        raise HTTPException(status_code=400, detail='Invalid coupon code')

    customer = db.query(Customer).filter(Customer.user_id == user.id).first() if user else None
    cart = get_or_create_cart(db, session_key, customer)
    cart.coupon_id = coupon.id
    db.commit()
    _set_cart_cookie(response, cart.session_key)
    return calculate_cart_totals(db, cart)


@router.delete('/coupon', response_model=CartOut)
def remove_coupon(
    response: Response,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_optional_user),
    session_key: str = Depends(get_session_key),
):
    customer = db.query(Customer).filter(Customer.user_id == user.id).first() if user else None
    cart = get_or_create_cart(db, session_key, customer)
    cart.coupon_id = None
    db.commit()
    _set_cart_cookie(response, cart.session_key)
    return calculate_cart_totals(db, cart)
