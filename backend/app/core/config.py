"""
App-wide settings, loaded from environment variables (.env in dev,
platform secret manager in production).
"""
import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "Jhyaap Station API"
    APP_ENV: str = "development"  # development | staging | production
    DEBUG: bool = False  # Changed to False by default for security

    # --- Auth / JWT ---
    SECRET_KEY: str = ""  # Must be set in environment variables
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        if not v or v == "":
            raise ValueError("SECRET_KEY must be set in environment variables")
        if len(v) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters long")
        return v

    @field_validator("APP_ENV")
    @classmethod
    def validate_app_env(cls, v: str) -> str:
        valid_envs = ["development", "staging", "production"]
        if v.lower() not in valid_envs:
            raise ValueError(f"APP_ENV must be one of: {', '.join(valid_envs)}")
        return v.lower()

    @field_validator("DEBUG", mode="before")
    @classmethod
    def parse_debug(cls, v):
        if isinstance(v, str):
            return v.strip().lower() in {"1", "true", "yes", "on", "debug", "development"}
        return v
    @field_validator("DEBUG")
    @classmethod
    def validate_debug(cls, v: bool, info) -> bool:
        # Ensure DEBUG is False in production
        if info.data.get("APP_ENV") == "production" and v is True:
            raise ValueError("DEBUG must be False in production environment")
        return v

    # --- Redis (used for OTP storage) ---
    REDIS_URL: str = "redis://localhost:6379/0"

    # --- OTP behavior ---
    OTP_LENGTH: int = 6
    OTP_EXPIRE_SECONDS: int = 300          # 5 minutes
    OTP_MAX_ATTEMPTS: int = 5              # verify attempts before lockout
    OTP_RESEND_COOLDOWN_SECONDS: int = 60  # prevent OTP spam

    # OTP_MODE controls how the OTP is actually delivered:
    #   "mock"    -> never calls Sparrow SMS, just logs/returns the code
    #                (use during UI development to avoid burning trial credits)
    #   "sparrow" -> calls the real Sparrow SMS API (trial or paid credits)
    OTP_MODE: str = "mock"

    # TEST_OTP_CODE: If set, this constant code will be used for all OTPs (for testing)
    TEST_OTP_CODE: str = ""

    # --- Sparrow SMS ---
    SPARROW_SMS_TOKEN: str = ""
    SPARROW_SMS_FROM: str = ""
    SPARROW_SMS_BASE_URL: str = "https://api.sparrowsms.com/v2/sms/"

    # --- Twilio SMS ---
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_FROM_NUMBER: str = ""

    # --- Supabase ---
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    DATABASE_URL: str = ""
    BACKEND_API_KEY: str = "jhyaap-super-secret-backend-developer-key"
    
    # --- Database Connection ---
    USE_POSTGRESQL: bool = False  # Set to true to use PostgreSQL instead of SQLite
    DB_CONNECTION_TIMEOUT: int = 10

    # --- Supabase JWT Configuration ---
    SUPABASE_JWT_SECRET: str = ""  # JWT secret from Supabase settings
    SUPABASE_JWT_ISSUER: str = "https://jbibgtqxjckuaidmodvo.supabase.co"
    SUPABASE_JWT_AUDIENCE: str = "authenticated"
    USE_SUPABASE_JWT: bool = False  # Set to True to use Supabase JWT instead of custom JWT

    # --- User Limits ---
    MAX_MONTHLY_USERS: int = 500  # Maximum new users allowed per month
    FRONTEND_ORIGIN: str = "http://localhost:5173"


settings = Settings()

