import uuid
import os
import shutil
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, UploadFile, File, Depends
from app.utils.file_validation import validate_file_upload, sanitize_filename
from pydantic import BaseModel, Field

from app.middleware.auth import get_current_admin
from app.db.database import (
    fetch_all_products,
    fetch_product_by_id,
    save_product,
    remove_product
)

router = APIRouter(prefix="/products", tags=["products"])

# Pydantic schemas for request validation
class ProductCreateUpdate(BaseModel):
    id: Optional[str] = None
    name: str
    brand: Optional[str] = ""
    category: Optional[str] = ""
    subcategory: Optional[str] = ""
    price: float
    originalPrice: Optional[float] = None
    volume: Optional[str] = ""
    abv: Optional[str] = ""
    image: Optional[str] = ""
    rating: Optional[float] = 0.0
    reviews: Optional[int] = 0
    inStock: Optional[bool] = True
    badge: Optional[str] = None
    description: Optional[str] = ""
    tags: Optional[List[str]] = []

@router.get("", response_model=List[ProductCreateUpdate])
def read_products(category: Optional[str] = None, q: Optional[str] = None):
    """Retrieve all products, optionally filtered by category or search query string."""
    try:
        return fetch_all_products(category=category, query=q)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database retrieval failed: {str(e)}"
        )

@router.get("/{product_id}", response_model=ProductCreateUpdate)
def read_product(product_id: str):
    """Fetch details of a single product database record by its ID."""
    p = fetch_product_by_id(product_id)
    if not p:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' not found."
        )
    return p

@router.post("", response_model=ProductCreateUpdate, dependencies=[Depends(get_current_admin)])
def create_product(payload: ProductCreateUpdate):
    """Create a new product record in database."""
    if not payload.id:
        # Generate new random ID if not provided
        payload.id = str(uuid.uuid4())
        
    # Check duplicate
    existing = fetch_product_by_id(payload.id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product with ID '{payload.id}' already exists."
        )
        
    try:
        saved = save_product(payload.model_dump())
        return saved
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to persist product: {str(e)}"
        )

@router.put("/{product_id}", response_model=ProductCreateUpdate, dependencies=[Depends(get_current_admin)])
def update_product_endpoint(product_id: str, payload: ProductCreateUpdate):
    """Modify an existing product record in the database."""
    existing = fetch_product_by_id(product_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' not found."
        )
        
    try:
        data = payload.model_dump()
        data["id"] = product_id # Force correct ID
        saved = save_product(data)
        return saved
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update product database: {str(e)}"
        )

@router.delete("/{product_id}", dependencies=[Depends(get_current_admin)])
def delete_product_endpoint(product_id: str):
    """Permanently delete a product record from database."""
    removed = remove_product(product_id)
    if not removed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' was not found or already deleted."
        )
    return {"message": f"Product '{product_id}' successfully removed from catalog.", "success": True}

@router.post("/upload-image", dependencies=[Depends(get_current_admin)])
def upload_image_endpoint(file: UploadFile = File(...)):
    """Save user product file upload to static files and return dynamic URL."""
    try:
        # Validate file for security
        validate_file_upload(file)
        
        # Sanitize filename
        safe_filename = sanitize_filename(file.filename)
        
        # Ensure uploads folder exist
        upload_dir = Path("uploads")
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Keep clean extension naming
        file_ext = os.path.splitext(safe_filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        destination = upload_dir / unique_filename
        
        with destination.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        public_url = f"{os.getenv('BACKEND_PUBLIC_URL', 'http://127.0.0.1:8001').rstrip('/')}/uploads/{unique_filename}"
        return {"filename": unique_filename, "url": public_url, "success": True}
    except HTTPException:
        # Re-raise HTTP exceptions from validation
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Image upload action failed: {str(e)}"
        )


