"""
HTTPS redirect middleware for production environments.
Redirects all HTTP requests to HTTPS in production.
"""
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.base import RequestResponseEndpoint


class HTTPSRedirectMiddleware(BaseHTTPMiddleware):
    """
    Middleware to redirect HTTP requests to HTTPS in production.
    Only active when environment is set to 'production'.
    """
    
    def __init__(self, app, environment: str = "development"):
        super().__init__(app)
        self.environment = environment.lower()
        self.enabled = environment == "production"
    
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        # Only redirect in production environment
        if not self.enabled:
            return await call_next(request)
        
        # Check if request is already HTTPS
        if request.url.scheme == "https":
            return await call_next(request)
        
        # Check for X-Forwarded-Proto header (behind proxy/load balancer)
        forwarded_proto = request.headers.get("X-Forwarded-Proto", "").lower()
        if forwarded_proto == "https":
            return await call_next(request)
        
        # Redirect to HTTPS
        redirect_url = request.url.replace(scheme="https")
        return Response(
            status_code=301,
            headers={"Location": str(redirect_url)}
        )