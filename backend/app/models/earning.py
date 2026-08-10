from typing import Optional
from pydantic import BaseModel


class EarningCreate(BaseModel):
    rider_id: str
    order_id: str
    delivery_fee: float


class EarningResponse(BaseModel):
    id: str
    rider_id: str
    order_id: str
    delivery_fee: float
    earned_at: str
