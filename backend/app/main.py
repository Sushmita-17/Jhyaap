import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.v1.router import api_router
from app.core.config import settings
from app.db.database import init_db
from app.middleware.rate_limiter import limiter, custom_rate_limit_handler
from app.middleware.security_headers import SecurityHeadersMiddleware
from app.middleware.https_redirect import HTTPSRedirectMiddleware
from slowapi.errors import RateLimitExceeded

app = FastAPI(title=settings.APP_NAME)

# Add rate limiting error handler
app.add_exception_handler(RateLimitExceeded, custom_rate_limit_handler)

# Apply rate limiting to the entire app
app.state.limiter = limiter

# Add security headers middleware (always active, production-specific features enabled in prod)
app.add_middleware(
    SecurityHeadersMiddleware,
    include_hsts=settings.APP_ENV == "production",
    include_csp=settings.APP_ENV == "production",
    environment=settings.APP_ENV
)

# Add HTTPS redirect middleware (only in production)
if settings.APP_ENV == "production":
    app.add_middleware(HTTPSRedirectMiddleware, environment=settings.APP_ENV)

# Ensure uploads directory exists and mount it
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.on_event("startup")
def on_startup():
    from app.services.settings_service import get_dynamic_settings
    get_dynamic_settings()
    init_db()


# Expand CORS for dev flexibility across admin (3000), store (5173), and developer API hub (5174/5175)
# Also allow all localhost ports for Vite dev server (which uses dynamic ports)
dev_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "http://localhost:3004",
    "http://localhost:3005",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002",
    "http://127.0.0.1:3003",
    "http://127.0.0.1:3004",
    "http://127.0.0.1:3005",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
    "http://192.168.1.5:3000",
    "http://192.168.1.5:3001",
    "http://192.168.1.5:3002",
    "http://192.168.1.5:3003",
    "http://192.168.1.5:3004",
    "http://192.168.1.5:3005",
    "http://192.168.1.5:5173",
    "http://192.168.1.5:5174",
    "http://192.168.1.5:5175",
]

# Safely append any additional production origins defined in the .env file
env_origins = os.getenv("ALLOWED_ORIGINS")
if env_origins:
    dev_origins.extend([origin.strip() for origin in env_origins.split(",") if origin.strip()])

configured_frontend_origin = os.getenv("FRONTEND_ORIGIN")
if configured_frontend_origin:
    dev_origins.extend([origin.strip() for origin in configured_frontend_origin.split(",") if origin.strip()])

# Keep the whitelist deterministic and avoid duplicate CORS headers.
allowed_origins = list(dict.fromkeys(dev_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Temporarily allow all origins for debugging
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    return {"status": "ok", "env": settings.APP_ENV, "otp_mode": settings.OTP_MODE}
