import re
from typing import Optional
from pydantic import BaseModel, field_validator


NEPAL_PHONE_REGEX = re.compile(r"^(97|98)\d{8}$")  # e.g. 98XXXXXXXX, 97XXXXXXXX


class RequestOTPPayload(BaseModel):
    phone_number: str

    @field_validator("phone_number")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        v = v.strip().replace(" ", "").replace("+977", "")
        if not NEPAL_PHONE_REGEX.match(v):
            raise ValueError("Enter a valid Nepali mobile number (e.g. 98XXXXXXXX)")
        return v


class RequestOTPResponse(BaseModel):
    message: str
    # Only populated when OTP_MODE=mock, so the frontend/dev can auto-fill it
    # during testing. This field will always be null in "sparrow" mode.
    debug_otp_code: str | None = None


class VerifyOTPPayload(BaseModel):
    phone_number: str
    otp_code: str


class VerifyOTPResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    customer_id: str
    is_new_user: bool


class PasswordResetRequest(BaseModel):
    phone_number: str
    
    @field_validator("phone_number")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        v = v.strip().replace(" ", "").replace("+977", "")
        if not NEPAL_PHONE_REGEX.match(v):
            raise ValueError("Enter a valid Nepali mobile number (e.g. 98XXXXXXXX)")
        return v


class PasswordResetVerify(BaseModel):
    phone_number: str
    otp_code: str
    new_password: str


class PasswordResetResponse(BaseModel):
    message: str
    success: bool


# Rider Credential Authentication Models
class RiderLogin(BaseModel):
    phone_number: str
    password: str

    @field_validator("phone_number")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        v = v.strip().replace(" ", "").replace("+977", "")
        if not NEPAL_PHONE_REGEX.match(v):
            raise ValueError("Enter a valid Nepali mobile number (e.g. 98XXXXXXXX)")
        return v


class RiderResponse(BaseModel):
    id: str
    phone_number: str
    name: Optional[str] = None
    vehicle_type: Optional[str] = None
    status: str
    total_earnings: float


class RiderLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    rider: RiderResponse

class AdminLogin(BaseModel):
    email: str
    password: str


class AdminLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    admin: dict
