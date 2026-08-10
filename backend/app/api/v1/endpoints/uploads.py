import uuid
import os
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException, status as http_status
from typing import Optional

router = APIRouter(prefix="/uploads", tags=["uploads"])

# Configure upload directory
UPLOAD_DIR = "uploads"
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/payment-screenshot")
async def upload_payment_screenshot(file: UploadFile = File(...)):
    """
    Upload a payment screenshot for eSewa or Khalti payment verification.
    Accepts PNG, JPG, JPEG, GIF files up to 5MB.
    Returns the URL/path to the uploaded file.
    """
    # Validate file extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Read file content to check size
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds 5MB limit"
        )
    
    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    filename = f"payment_{timestamp}_{unique_id}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    # Save file
    try:
        with open(file_path, "wb") as f:
            f.write(file_content)
    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )
    
    # Return the file path/URL
    return {
        "success": True,
        "filename": filename,
        "path": f"/uploads/{filename}",
        "url": f"/uploads/{filename}"
    }
