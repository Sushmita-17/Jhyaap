from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime


class BannerCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    subtitle: Optional[str] = Field(None, max_length=200)
    image_url: str = Field(..., min_length=1)
    cta_text: Optional[str] = Field(None, max_length=50)
    cta_link: Optional[str] = None
    tag: Optional[str] = Field(None, max_length=20)
    is_active: bool = True
    display_order: int = Field(default=0, ge=0)
    placement: str = Field(default="hero", pattern="^(hero|popup)$")
    dismissible: bool = True
    skip_text: Optional[str] = Field("Skip offer", max_length=40)
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None


class BannerUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    subtitle: Optional[str] = Field(None, max_length=200)
    image_url: Optional[str] = Field(None, min_length=1)
    cta_text: Optional[str] = Field(None, max_length=50)
    cta_link: Optional[str] = None
    tag: Optional[str] = Field(None, max_length=20)
    is_active: Optional[bool] = None
    display_order: Optional[int] = Field(None, ge=0)
    placement: Optional[str] = Field(None, pattern="^(hero|popup)$")
    dismissible: Optional[bool] = None
    skip_text: Optional[str] = Field(None, max_length=40)
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None


class BannerResponse(BaseModel):
    id: str
    title: str
    subtitle: Optional[str] = None
    image_url: str
    cta_text: Optional[str] = None
    cta_link: Optional[str] = None
    tag: Optional[str] = None
    is_active: bool
    display_order: int
    created_at: datetime
    updated_at: datetime
    placement: str = "hero"
    dismissible: bool = True
    skip_text: Optional[str] = "Skip offer"
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None

    class Config:
        from_attributes = True


