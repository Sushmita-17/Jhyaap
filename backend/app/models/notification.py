from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum


class NotificationType(str, Enum):
    ORDER_STATUS = "order_status"
    COUPON = "coupon"
    DELIVERY = "delivery"
    PROMOTION = "promotion"
    SYSTEM = "system"


class NotificationCreate(BaseModel):
    customer_id: str
    title: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=1, max_length=1000)
    notification_type: NotificationType
    order_id: Optional[str] = None
    coupon_code: Optional[str] = None
    action_link: Optional[str] = None
    is_read: bool = False


class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None


class NotificationResponse(BaseModel):
    id: str
    customer_id: str
    title: str
    message: str
    notification_type: str
    order_id: Optional[str] = None
    coupon_code: Optional[str] = None
    action_link: Optional[str] = None
    is_read: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NotificationBulkUpdate(BaseModel):
    notification_ids: List[str]
    is_read: bool = True
