from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='../.env', env_file_encoding='utf-8', extra='ignore')

    database_url: str = 'postgresql://jhyaap:jhyaap_dev@localhost:5432/jhyaap'
    api_secret_key: str = 'dev-api-secret-change-in-production'
    jwt_access_token_expire_minutes: int = 15
    jwt_refresh_token_expire_days: int = 30
    cors_origins: str = 'http://localhost:3000,http://127.0.0.1:3000'
    otp_expire_minutes: int = 5
    otp_max_attempts: int = 3
    otp_lockout_minutes: int = 30
    min_order_value: int = 0
    free_delivery_threshold: int = 3000
    default_delivery_fee: int = 150
    debug: bool = True

    @property
    def cors_origin_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(',') if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
