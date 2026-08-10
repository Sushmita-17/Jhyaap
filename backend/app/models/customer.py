from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class CustomerCreate(BaseModel):
    """Model for creating a new customer"""
    name: str = Field(..., min_length=2, max_length=100)
    phone_number: str = Field(..., pattern=r'^\+?[0-9]{10,15}$')
    email: Optional[EmailStr] = None
    password: str = Field(..., min_length=6, max_length=100)


class CustomerLogin(BaseModel):
    """Model for customer login"""
    phone_number: str = Field(..., pattern=r'^\+?[0-9]{10,15}$')
    password: str = Field(..., min_length=1)


class CustomerOTPRequest(BaseModel):
    """Model for requesting OTP"""
    phone_number: str = Field(..., pattern=r'^\+?[0-9]{10,15}$')


class CustomerOTPVerify(BaseModel):
    """Model for verifying OTP"""
    phone_number: str = Field(..., pattern=r'^\+?[0-9]{10,15}$')
    otp: str = Field(..., pattern=r'^[0-9]{6}$')


class CustomerProfileComplete(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    phone_number: str = Field(..., min_length=10, max_length=15)  # Phone number re-entry
    email: Optional[str] = None  # Accept email if sent but ignore it
    password: str = Field(..., min_length=6, max_length=100)  # Reduced minimum length
    confirm_password: str = Field(..., min_length=6, max_length=100)

class CustomerPasswordChange(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8, max_length=100)

class CustomerPasswordReset(BaseModel):
    new_password: str = Field(..., min_length=8, max_length=100)

class CustomerUpdate(BaseModel):
    """Model for updating customer profile"""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    address: Optional[str] = None


class CustomerResponse(BaseModel):
    """Model for customer response (without sensitive data)"""
    id: str
    name: str
    phone_number: str
    email: Optional[str] = None
    address: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CustomerLoginResponse(BaseModel):
    """Model for customer login response"""
    access_token: str
    token_type: str = "bearer"
    customer: CustomerResponse


class OTPResponse(BaseModel):
    """Model for OTP response"""
    message: str
    otp_sent: bool = True
    expires_in: int = 300  # 5 minutes
    otp_code: Optional[str] = None  # Dev mode OTP code






