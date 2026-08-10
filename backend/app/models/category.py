from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime


class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=200)
    image_url: Optional[str] = None
    parent_id: Optional[str] = None
    is_active: bool = True
    display_order: int = Field(default=0, ge=0)


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=200)
    image_url: Optional[str] = None
    parent_id: Optional[str] = None
    is_active: Optional[bool] = None
    display_order: Optional[int] = Field(None, ge=0)


class CategoryResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    parent_id: Optional[str] = None
    is_active: bool
    display_order: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
