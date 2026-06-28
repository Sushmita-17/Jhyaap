from datetime import datetime
from decimal import Decimal
from typing import Any, Generic, List, Optional, TypeVar
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

T = TypeVar('T')


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int
    pages: int


# --- Auth ---

class OTPSendRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=10)

    @field_validator('phone')
    @classmethod
    def validate_nepali_phone(cls, v: str) -> str:
        digits = ''.join(c for c in v if c.isdigit())
        if len(digits) != 10 or not digits.startswith('9'):
            raise ValueError('Phone must be 10 digits starting with 9')
        return digits


class OTPSendResponse(BaseModel):
    message: str
    expires_in_minutes: int
    dev_otp: Optional[str] = None


class OTPVerifyRequest(BaseModel):
    phone: str
    otp: str = Field(..., min_length=4, max_length=6)
    name: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = 'bearer'
    expires_in: int
    user: 'UserOut'


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    phone: str
    email: Optional[str] = None
    role: str
    name: Optional[str] = None
    wallet_balance: Decimal = Decimal('0')


# --- Catalog ---

class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    slug: str
    icon: str = ''
    color: str = ''
    image: str = ''
    product_count: int = 0


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    legacy_id: str = ''
    name: str
    slug: str
    brand: str
    category: str
    category_slug: str
    subcategory: str = ''
    price: Decimal
    original_price: Optional[Decimal] = None
    volume: str = ''
    volume_ml: Optional[int] = None
    abv: str = ''
    abv_percent: Optional[Decimal] = None
    image: str = ''
    images: List[str] = []
    rating: Decimal = Decimal('0')
    reviews: int = 0
    in_stock: bool = True
    stock: int = 0
    badge: str = ''
    description: str = ''
    tags: List[str] = []
    popularity: int = 0


class ProductListParams(BaseModel):
    search: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    min_price: Optional[Decimal] = None
    max_price: Optional[Decimal] = None
    volume_ml: Optional[int] = None
    abv_min: Optional[Decimal] = None
    abv_max: Optional[Decimal] = None
    in_stock: Optional[bool] = None
    sort: str = 'featured'
    page: int = 1
    page_size: int = 24


# --- Delivery ---

class DeliveryAreaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    zone_code: str
    zone_name: str
    delivery_fee: Decimal
    eta_minutes: int
    city: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None


class DeliveryZoneOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    code: str
    name: str
    delivery_fee: Decimal
    eta_minutes_min: int
    eta_minutes_max: int
    areas: List[str] = []


# --- Cart ---

class CartAddRequest(BaseModel):
    product_id: UUID
    quantity: int = Field(1, ge=1)


class CartUpdateRequest(BaseModel):
    product_id: UUID
    quantity: int = Field(..., ge=0)


class CartItemOut(BaseModel):
    product: ProductOut
    quantity: int


class CartOut(BaseModel):
    id: UUID
    items: List[CartItemOut]
    subtotal: Decimal
    discount: Decimal
    coupon_code: Optional[str] = None
    delivery_fee: Decimal
    total: Decimal
    item_count: int


class ApplyCouponRequest(BaseModel):
    code: str


# --- Address ---

class AddressCreate(BaseModel):
    label: str = Field(..., min_length=1)
    area_id: UUID
    street: str = Field(..., min_length=5)
    landmark: str = ''
    is_default: bool = False


class AddressOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    label: str
    area: str
    area_id: UUID
    street: str
    landmark: str = ''
    is_default: bool
    delivery_fee: Decimal


class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None


# --- Orders ---

class OrderCreateRequest(BaseModel):
    address_id: Optional[UUID] = None
    guest_address: Optional[AddressCreate] = None
    guest_phone: Optional[str] = None
    guest_name: Optional[str] = None
    payment_method: str = Field(..., pattern='^(cod|esewa|khalti)$')
    notes: str = ''
    age_verified: bool = False

    @field_validator('guest_phone')
    @classmethod
    def validate_guest_phone(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        digits = ''.join(c for c in v if c.isdigit())
        if len(digits) != 10 or not digits.startswith('9'):
            raise ValueError('Phone must be 10 digits starting with 9')
        return digits


class OrderItemOut(BaseModel):
    product_id: UUID
    product_name: str
    quantity: int
    unit_price: Decimal
    total: Decimal
    image: str = ''


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    order_number: str
    status: str
    payment_method: str
    payment_status: str
    subtotal: Decimal
    delivery_fee: Decimal
    discount: Decimal
    total: Decimal
    notes: str = ''
    items: List[OrderItemOut]
    address: AddressOut
    created_at: datetime
    eta: Optional[datetime] = None
    delivery_staff_name: Optional[str] = None
    delivery_staff_phone: Optional[str] = None
    status_timeline: List[dict[str, Any]] = []


class OrderStatusUpdate(BaseModel):
    status: str
    note: str = ''


class PaymentInitResponse(BaseModel):
    order_id: UUID
    order_number: str
    payment_method: str
    amount: Decimal
    redirect_url: Optional[str] = None
    message: str


TokenResponse.model_rebuild()
