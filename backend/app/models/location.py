from typing import Optional
from pydantic import BaseModel, Field


class RiderLocationCreate(BaseModel):
    rider_id: str
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    heading: Optional[float] = Field(None, ge=0, le=360)
    speed: Optional[float] = Field(None, ge=0)
    accuracy: Optional[float] = Field(None, ge=0)
    battery_level: Optional[int] = Field(None, ge=0, le=100)


class RiderLocationResponse(BaseModel):
    id: str
    rider_id: str
    latitude: float
    longitude: float
    heading: Optional[float] = None
    speed: Optional[float] = None
    accuracy: Optional[float] = None
    battery_level: Optional[int] = None
    created_at: str

    class Config:
        from_attributes = True
