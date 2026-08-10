from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum


class CouponType(str, Enum):
    PERCENTAGE = "percentage"
    FIXED_AMOUNT = "fixed_amount"
    FREE_DELIVERY = "free_delivery"


class CouponCreate(BaseModel):
    code: str = Field(..., min_length=3, max_length=20, pattern=r'^[A-Z0-9]+$')
    description: Optional[str] = None
    coupon_type: CouponType
    value: float = Field(..., ge=0)
    minimum_order_amount: float = Field(default=0.0, ge=0)
    max_discount_amount: Optional[float] = Field(None, ge=0)
    usage_limit: Optional[int] = Field(None, gt=0)
    usage_count: int = Field(default=0, ge=0)
    valid_from: datetime
    valid_until: datetime
    is_active: bool = True


class CouponUpdate(BaseModel):
    description: Optional[str] = None
    coupon_type: Optional[CouponType] = None
    value: Optional[float] = Field(None, ge=0)
    minimum_order_amount: Optional[float] = Field(None, ge=0)
    max_discount_amount: Optional[float] = Field(None, ge=0)
    usage_limit: Optional[int] = Field(None, gt=0)
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    is_active: Optional[bool] = None


class CouponResponse(BaseModel):
    id: str
    code: str
    description: Optional[str] = None
    coupon_type: str
    value: float
    minimum_order_amount: float
    max_discount_amount: Optional[float] = None
    usage_limit: Optional[int] = None
    usage_count: int
    valid_from: datetime
    valid_until: datetime
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CouponValidationRequest(BaseModel):
    code: str
    order_amount: float


class CouponValidationResponse(BaseModel):
    valid: bool
    coupon: Optional[CouponResponse] = None
    discount_amount: float = 0.0
    message: str
