"""
File upload validation utilities for security.
"""
import os
from pathlib import Path
from fastapi import HTTPException, status, UploadFile
from typing import Set

# Allowed image file extensions
ALLOWED_IMAGE_EXTENSIONS: Set[str] = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"}

# Allowed MIME types for images
ALLOWED_MIME_TYPES: Set[str] = {
    "image/jpeg",
    "image/jpg", 
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml"
}

# Maximum file size (5MB)
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB in bytes


def validate_file_upload(file: UploadFile, max_size: int = MAX_FILE_SIZE) -> None:
    """
    Validate uploaded file for security.
    
    Args:
        file: The UploadFile object from FastAPI
        max_size: Maximum allowed file size in bytes (default: 5MB)
        
    Raises:
        HTTPException: If validation fails
    """
    # Check if filename exists
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided."
        )
    
    # Check file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}"
        )
    
    # Check content type if available
    if file.content_type and file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid content type. Allowed types: {', '.join(ALLOWED_MIME_TYPES)}"
        )
    
    # Read file content to check size
    file.file.seek(0)
    content = file.file.read()
    file.file.seek(0)  # Reset file pointer
    
    # Check file size
    if len(content) > max_size:
        size_mb = max_size / (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size is {size_mb:.1f}MB"
        )
    
    # Basic file signature validation (check for common image headers)
    if len(content) >= 4:
        # JPEG: FF D8 FF
        if content[0:2] == b'\xFF\xD8' and file_ext in ['.jpg', '.jpeg']:
            return
        # PNG: 89 50 4E 47
        elif content[0:4] == b'\x89PNG' and file_ext == '.png':
            return
        # GIF: 47 49 46 38
        elif content[0:3] == b'GIF' and file_ext == '.gif':
            return
        # WebP: 52 49 46 46 ... 57 45 42 50
        elif content[0:4] == b'RIFF' and len(content) >= 12 and content[8:12] == b'WEBP' and file_ext == '.webp':
            return
        # SVG: Check for XML content
        elif file_ext == '.svg' and b'<?xml' in content or b'<svg' in content:
            return
        else:
            # If extension doesn't match file signature, reject
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File content does not match the file extension."
            )


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename to prevent path traversal attacks.
    
    Args:
        filename: Original filename
        
    Returns:
        Sanitized filename
    """
    # Remove path components
    filename = os.path.basename(filename)
    
    # Remove dangerous characters
    dangerous_chars = ['..', '/', '\\', '\0', '\n', '\r']
    for char in dangerous_chars:
        filename = filename.replace(char, '')
    
    return filename