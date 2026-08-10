from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from typing import Optional

from app.core.config import settings
from app.core.security import verify_password
from app.db.database import fetch_rider_by_id

# HTTP Bearer token scheme for authentication
security = HTTPBearer()


async def get_current_rider(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Dependency to get the current authenticated rider from JWT token.
    Validates the token and returns the rider data.
    Raises HTTPException if token is invalid or rider not found.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode JWT token
        token = credentials.credentials
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=["HS256"]
        )
        rider_id: str = payload.get("sub")
        
        if rider_id is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    # Fetch rider from database
    rider = fetch_rider_by_id(rider_id)
    if rider is None:
        raise credentials_exception
    
    # Check if rider is active
    if rider.get("status") != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Rider account is {rider.get('status')}. Please contact admin."
        )
    
    return rider


async def get_optional_rider(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))
) -> Optional[dict]:
    """
    Optional authentication dependency.
    Returns rider data if valid token provided, None otherwise.
    Useful for endpoints that work for both authenticated and anonymous users.
    """
    if credentials is None:
        return None
    
    try:
        token = credentials.credentials
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=["HS256"]
        )
        rider_id: str = payload.get("sub")
        
        if rider_id is None:
            return None
            
        rider = fetch_rider_by_id(rider_id)
        if rider and rider.get("status") == "active":
            return rider
            
    except (JWTError, Exception):
        return None
    
    return None


def require_rider_admin(current_rider: dict = Depends(get_current_rider)) -> dict:
    """
    Dependency to check if the current rider has admin privileges.
    Checks the 'is_admin' field in the rider_credentials table.
    Raises HTTPException if rider is not an admin.
    """
    if not current_rider.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required. Access denied."
        )
    return current_rider
