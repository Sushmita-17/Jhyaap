from fastapi import APIRouter, HTTPException, status, Depends
from app.services.settings_service import DynamicSettings, get_dynamic_settings, update_dynamic_settings
from app.core.config import settings
from app.middleware.auth import get_current_admin
from typing import Optional
import httpx
import psycopg2

router = APIRouter(prefix="/settings", tags=["settings"])

@router.get("", response_model=DynamicSettings, dependencies=[Depends(get_current_admin)])
def read_settings():
    """Retrieve current dynamic settings configuration values."""
    try:
        return get_dynamic_settings()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to read settings: {str(e)}"
        )

@router.post("", response_model=DynamicSettings, dependencies=[Depends(get_current_admin)])
def save_settings(payload: DynamicSettings):
    """Write configuration settings so they apply dynamically to the system."""
    try:
        updated = update_dynamic_settings(payload)
        return updated
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update settings: {str(e)}"
        )

@router.get("/check-connections", dependencies=[Depends(get_current_admin)])
def check_connections():
    """Verify live connectivity for PostgreSQL database and Supabase client APIs."""
    status_dict = {
        "postgres": "unconfigured",
        "supabase": "unconfigured",
        "postgres_error": None,
        "supabase_error": None
    }

    # 1. Check PostgreSQL Database connection
    db_url = settings.DATABASE_URL
    if not db_url:
        status_dict["postgres"] = "sqlite"
    else:
        try:
            if db_url.startswith("postgres://"):
                db_url = db_url.replace("postgres://", "postgresql://", 1)

            conn = psycopg2.connect(db_url, connect_timeout=3)
            cursor = conn.cursor()
            cursor.execute("SELECT 1;")
            cursor.fetchone()
            cursor.close()
            conn.close()
            status_dict["postgres"] = "active"
        except Exception as e:
            status_dict["postgres"] = "failed"
            status_dict["postgres_error"] = str(e)

    # 2. Check Supabase connection
    sub_url = settings.SUPABASE_URL
    sub_key = settings.SUPABASE_ANON_KEY
    if not sub_url or not sub_key:
        status_dict["supabase"] = "unconfigured"
    else:
        try:
            headers = {
                "apikey": sub_key,
                "Authorization": f"Bearer {sub_key}"
            }
            # Query a non-existent table on purpose. A valid key gets back
            # PGRST205 (table not found) - proof auth succeeded.
            # An invalid key gets back a 401 "Invalid API key" instead.
            base = sub_url.rstrip("/")
            url = f"{base}/rest/v1/__connection_probe__?select=*&limit=1"

            with httpx.Client(timeout=4.0) as client:
                response = client.get(url, headers=headers)

            body_lower = response.text.lower()

            if response.status_code == 401 or "invalid api key" in body_lower:
                status_dict["supabase"] = "failed"
                status_dict["supabase_error"] = f"Supabase URL HTTP {response.status_code}: {response.text[:150]}"
            elif response.status_code in [200, 201, 204, 300, 404] or "pgrst205" in body_lower or "does not exist" in body_lower:
                status_dict["supabase"] = "active"
            else:
                status_dict["supabase"] = "failed"
                status_dict["supabase_error"] = f"Supabase URL HTTP {response.status_code}: {response.text[:150]}"
        except Exception as e:
            status_dict["supabase"] = "failed"
            status_dict["supabase_error"] = str(e)

    return status_dict


