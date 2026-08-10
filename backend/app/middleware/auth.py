from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from typing import Optional
import os

from app.core.config import settings

security = HTTPBearer()


def verify_token(token: str) -> dict:
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_customer(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Get current authenticated customer from JWT token.
    This dependency can be used to protect endpoints.
    """
    token = credentials.credentials
    payload = verify_token(token)
    
    # Extract customer_id from token
    customer_id = payload.get("sub")
    if customer_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return {
        "customer_id": customer_id,
        "phone_number": payload.get("phone_number"),
        "name": payload.get("name")
    }


def get_optional_customer(credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))) -> Optional[dict]:
    """
    Get current authenticated customer if token is provided, otherwise return None.
    This allows optional authentication for endpoints.
    """
    if credentials is None:
        return None
    
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        customer_id = payload.get("sub")
        if customer_id is None:
            return None
        
        return {
            "customer_id": customer_id,
            "phone_number": payload.get("phone_number"),
            "name": payload.get("name")
        }
    except JWTError:
        return None


def require_customer(customer: dict = Depends(get_current_customer)) -> str:
    """
    Require customer authentication and return customer_id.
    Use this when you need just the customer_id string.
    """
    return customer["customer_id"]


def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Require a valid JWT belonging to an active admin_users record."""
    payload = verify_token(credentials.credentials)
    admin_id = payload.get("sub")
    if not admin_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin authentication credentials.")

    from app.db.database import get_connection, is_postgres
    conn = get_connection()
    cursor = conn.cursor()
    try:
        placeholder = "%s" if is_postgres(conn) else "?"
        cursor.execute(f"SELECT id, email, name, role, is_active FROM admin_users WHERE id = {placeholder}", (admin_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin account not found.")
        admin = dict(row) if isinstance(row, dict) else dict(zip([column[0] for column in cursor.description], row))
        if not admin.get("is_active", False) or admin.get("role") not in ("admin", "super_admin"):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access is not allowed.")
        return admin
    finally:
        cursor.close()
        conn.close()
