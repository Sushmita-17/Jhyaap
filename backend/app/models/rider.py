from typing import Optional, Union
from datetime import datetime
from pydantic import BaseModel, field_validator
import re


NEPAL_PHONE_REGEX = re.compile(r"^(97|98)\d{8}$")


class RiderCreate(BaseModel):
    phone_number: str
    password: str
    name: Optional[str] = None
    vehicle_type: Optional[str] = None
    vehicle_number: str
    status: str = "active"
    is_admin: bool = False

    @field_validator("vehicle_number")
    @classmethod
    def validate_vehicle_number(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Vehicle number plate is required")
        return v.upper()

    @field_validator("phone_number")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        v = v.strip().replace(" ", "").replace("+977", "")
        if not NEPAL_PHONE_REGEX.match(v):
            raise ValueError("Enter a valid Nepali mobile number (e.g. 98XXXXXXXX)")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        valid_statuses = ["active", "inactive", "suspended"]
        if v.lower() not in valid_statuses:
            raise ValueError(f"Status must be one of: {', '.join(valid_statuses)}")
        return v.lower()


class RiderUpdate(BaseModel):
    name: Optional[str] = None
    vehicle_type: Optional[str] = None
    vehicle_number: Optional[str] = None
    status: Optional[str] = None
    password: Optional[str] = None
    is_admin: Optional[bool] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    heading: Optional[float] = None

    @field_validator("vehicle_number")
    @classmethod
    def validate_vehicle_number(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        return v.upper() if v else None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v is None:
            return v
        valid_statuses = ["active", "inactive", "suspended"]
        if v.lower() not in valid_statuses:
            raise ValueError(f"Status must be one of: {', '.join(valid_statuses)}")
        return v.lower()


class RiderResponse(BaseModel):
    id: str
    phone_number: str
    name: Optional[str] = None
    vehicle_type: Optional[str] = None
    vehicle_number: Optional[str] = None
    status: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    heading: Optional[float] = None
    total_earnings: float
    created_at: Union[str, datetime]
    updated_at: Union[str, datetime]
