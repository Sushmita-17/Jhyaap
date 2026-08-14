from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class OrderItem(BaseModel):
    product_id: str
    name: str
    quantity: int = Field(..., gt=0)
    price: float = Field(..., ge=0)


class OrderCreate(BaseModel):
    client_order_id: Optional[str] = None
    customer_id: str
    items: List[OrderItem]
    delivery_address: str
    delivery_notes: Optional[str] = None
    coupon_code: Optional[str] = None
    payment_method: str = "cod"  # cod, online, split
    payment_screenshot: Optional[str] = None  # URL or path to payment screenshot


class PaymentConfirmation(BaseModel):
    cash_amount: float = Field(default=0, ge=0)
    online_amount: float = Field(default=0, ge=0)

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    rider_id: Optional[str] = None
    delivery_notes: Optional[str] = None
    payment_status: Optional[str] = None
    payment_method: Optional[str] = None


class OrderResponse(BaseModel):
    id: str
    order_number: Optional[int] = None
    customer_id: str
    rider_id: Optional[str] = None
    status: str
    items: List[OrderItem]
    subtotal: float
    delivery_fee: float
    tax: float
    total: float
    delivery_address: str
    delivery_notes: Optional[str] = None
    payment_status: str = "pending"
    payment_method: str = "cod"
    coupon_code: Optional[str] = None
    discount_amount: float = 0.0
    payment_screenshot: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OrderStatusUpdate(BaseModel):
    status: str = Field(..., pattern=r'^(pending|accepted|preparing|out_for_delivery|delivered|cancelled)$')
    rider_id: Optional[str] = None


class CustomerAddressCreate(BaseModel):
    customer_id: str
    street: str
    landmark: Optional[str] = None
    city: str
    postal_code: Optional[str] = None
    is_default: bool = False


class CustomerAddressUpdate(BaseModel):
    street: Optional[str] = None
    landmark: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    is_default: Optional[bool] = None


class CustomerAddressResponse(BaseModel):
    id: str
    customer_id: str
    street: str
    landmark: Optional[str] = None
    city: str
    postal_code: Optional[str] = None
    is_default: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DeliveryRatingCreate(BaseModel):
    customer_id: str
    rating: int = Field(..., ge=1, le=5)
    review: Optional[str] = Field(default=None, max_length=1000)

