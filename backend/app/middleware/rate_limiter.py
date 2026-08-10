from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse


# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)


def custom_rate_limit_handler(request: Request, exc: RateLimitExceeded):
    """
    Custom handler for rate limit exceeded errors.
    Returns a user-friendly error message.
    """
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={
            "detail": f"Rate limit exceeded. Please try again later.",
            "limit": exc.detail,
        }
    )


# Rate limit configurations
RATE_LIMITS = {
    # Authentication endpoints - very strict to prevent brute force
    "auth": "5/minute",  # 5 requests per minute
    
    # General API endpoints - moderate limit
    "general": "100/minute",  # 100 requests per minute
    
    # Admin endpoints - stricter
    "admin": "50/minute",  # 50 requests per minute
    
    # Public endpoints - more lenient
    "public": "200/minute",  # 200 requests per minute
}


def get_rate_limit(endpoint_type: str = "general"):
    """
    Get rate limit string for a specific endpoint type.
    Defaults to general rate limit if type not found.
    """
    return RATE_LIMITS.get(endpoint_type, RATE_LIMITS["general"])
