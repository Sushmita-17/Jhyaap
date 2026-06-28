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
    get_or_create_cart,
    get_session_key,
    product_to_schema,
    user_to_schema,
)
from ..models import Address, CartItem, Customer, DeliveryArea, DeliveryStaff, Order, OrderItem, OrderStatusHistory, Product, User
from ..schemas import AddressCreate, AddressOut, CustomerUpdate, OrderCreateRequest, OrderOut, OrderStatusUpdate, PaymentInitResponse, UserOut


router = APIRouter(tags=['Customers'])
settings = get_settings()


@router.get('/customers/me', response_model=UserOut)
def get_me(customer: Customer = Depends(get_current_customer), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == customer.user_id).first()
    return user_to_schema(db, user)


@router.put('/customers/me', response_model=UserOut)
def update_me(payload: CustomerUpdate, customer: Customer = Depends(get_current_customer), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == customer.user_id).first()
    if payload.name:
        customer.name = payload.name
    if payload.email:
        user.email = payload.email
    db.commit()
    return user_to_schema(db, user)


@router.get('/customers/me/addresses', response_model=list[AddressOut])
def list_addresses(customer: Customer = Depends(get_current_customer), db: Session = Depends(get_db)):
    addresses = (
        db.query(Address)
        .options(joinedload(Address.area))
        .filter(Address.customer_id == customer.id)
        .all()
    )
    return [address_to_schema(a) for a in addresses]


@router.post('/customers/me/addresses', response_model=AddressOut, status_code=201)
def create_address(payload: AddressCreate, customer: Customer = Depends(get_current_customer), db: Session = Depends(get_db)):
    area = db.query(DeliveryArea).filter(DeliveryArea.id == payload.area_id, DeliveryArea.is_active.is_(True)).first()
    if not area:
        raise HTTPException(status_code=400, detail='Invalid delivery area')

    if payload.is_default:
        db.query(Address).filter(Address.customer_id == customer.id).update({'is_default': False})

    address = Address(
        id=uuid.uuid4(),
        customer_id=customer.id,
        label=payload.label,
        area_id=payload.area_id,
        street=payload.street,
        landmark=payload.landmark,
        is_default=payload.is_default or not db.query(Address).filter(Address.customer_id == customer.id).count(),
    )
    db.add(address)
    db.commit()
    db.refresh(address)
    address.area = area
    return address_to_schema(address)
