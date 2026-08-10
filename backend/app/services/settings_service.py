import os
import json
from pathlib import Path
from pydantic import BaseModel
from typing import Optional

# Path to local settings storage
DATA_DIR = Path("data")
SETTINGS_FILE = DATA_DIR / "dynamic_settings.json"

class DynamicSettings(BaseModel):
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    DATABASE_URL: str = ""
    OTP_MODE: str = "mock"
    SPARROW_SMS_TOKEN: str = ""
    SPARROW_SMS_FROM: str = ""
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    BACKEND_API_KEY: str = "jhyaap-super-secret-backend-developer-key"

def initialize_settings_file():
    """Ensure data directory and settings file exist."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not SETTINGS_FILE.exists():
        with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
            json.dump({}, f)

def update_dotenv_file(dyn: DynamicSettings):
    """Write settings to the backend root .env file so they are stored permanently."""
    dotenv_path = Path(__file__).parent.parent.parent / ".env"
    existing_lines = []
    if dotenv_path.exists():
        try:
            with open(dotenv_path, "r", encoding="utf-8") as f:
                existing_lines = f.readlines()
        except Exception as e:
            print(f"Failed to read .env file: {e}")

    env_keys_values = {}
    for line in existing_lines:
        line_str = line.strip()
        if line_str and not line_str.startswith("#") and "=" in line_str:
            k, v = line_str.split("=", 1)
            env_keys_values[k.strip()] = v.strip()

    updates = dyn.model_dump()
    for key, val in updates.items():
        if val is not None and val != "":
            env_keys_values[key] = str(val)

    try:
        written_keys = set()
        new_lines = []
        for line in existing_lines:
            line_str = line.strip()
            if line_str and not line_str.startswith("#") and "=" in line_str:
                k, _ = line_str.split("=", 1)
                k_clean = k.strip()
                if k_clean in env_keys_values:
                    new_lines.append(f"{k_clean}={env_keys_values[k_clean]}\n")
                    written_keys.add(k_clean)
                else:
                    new_lines.append(line)
            else:
                new_lines.append(line)

        for k, v in env_keys_values.items():
            if k not in written_keys:
                new_lines.append(f"{k}={v}\n")

        with open(dotenv_path, "w", encoding="utf-8") as f:
            f.writelines(new_lines)
    except Exception as e:
        print(f"Failed to write to .env file: {e}")

def apply_to_global_settings(dyn: DynamicSettings):
    """Reflect dynamic configurations on the global app settings instance."""
    try:
        from app.core.config import settings
        settings.SUPABASE_URL = dyn.SUPABASE_URL
        settings.SUPABASE_ANON_KEY = dyn.SUPABASE_ANON_KEY
        settings.SUPABASE_SERVICE_ROLE_KEY = dyn.SUPABASE_SERVICE_ROLE_KEY
        settings.DATABASE_URL = dyn.DATABASE_URL
        settings.OTP_MODE = dyn.OTP_MODE
        settings.SPARROW_SMS_TOKEN = dyn.SPARROW_SMS_TOKEN
        settings.SPARROW_SMS_FROM = dyn.SPARROW_SMS_FROM
        settings.BACKEND_API_KEY = dyn.BACKEND_API_KEY
        
        # Sync with local .env file
        update_dotenv_file(dyn)
    except Exception as e:
        print(f"Failed to synchronize global settings attributes: {e}")

def get_dynamic_settings() -> DynamicSettings:
    """Fetch current dynamic settings, merging with env vars as fallbacks."""
    initialize_settings_file()
    try:
        with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception:
        data = {}

    # Merge with environment variables as fallback
    merged = {
        "SUPABASE_URL": data.get("SUPABASE_URL") or os.getenv("SUPABASE_URL", ""),
        "SUPABASE_ANON_KEY": data.get("SUPABASE_ANON_KEY") or os.getenv("SUPABASE_ANON_KEY", ""),
        "SUPABASE_SERVICE_ROLE_KEY": data.get("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY", ""),
        "DATABASE_URL": data.get("DATABASE_URL") or os.getenv("DATABASE_URL", ""),
        "OTP_MODE": data.get("OTP_MODE") or os.getenv("OTP_MODE", "mock"),
        "SPARROW_SMS_TOKEN": data.get("SPARROW_SMS_TOKEN") or os.getenv("SPARROW_SMS_TOKEN", ""),
        "SPARROW_SMS_FROM": data.get("SPARROW_SMS_FROM") or os.getenv("SPARROW_SMS_FROM", ""),
        "FRONTEND_ORIGIN": data.get("FRONTEND_ORIGIN") or os.getenv("FRONTEND_ORIGIN", "http://localhost:5173"),
        "BACKEND_API_KEY": data.get("BACKEND_API_KEY") or os.getenv("BACKEND_API_KEY", "jhyaap-super-secret-backend-developer-key"),
    }
    dyn = DynamicSettings(**merged)
    apply_to_global_settings(dyn)
    return dyn

def update_dynamic_settings(settings_data: DynamicSettings) -> DynamicSettings:
    """Save settings and apply them to the environment where applicable."""
    initialize_settings_file()
    try:
        with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
            existing = json.load(f)
    except Exception:
        existing = {}

    # Merge: only overwrite fields that were actually provided (non-empty).
    # Prevents saving one section from wiping keys in other sections.
    data = {**existing}
    for key, val in settings_data.model_dump().items():
        if val:
            data[key] = val

    with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)
        
    # Apply to OS environment variables so libraries react to changes
    for key, val in data.items():
        if val:
            os.environ[key] = str(val)
            
    dyn = get_dynamic_settings()
    apply_to_global_settings(dyn)
    return dyn

