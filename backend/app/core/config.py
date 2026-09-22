from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    SUPABASE_JWT_SECRET: str
    ALGORITHM: str = "HS256"

    SUPABASE_URL: str
    SUPABASE_KEY: str

    ALLOWED_ORIGINS: List[str] = []
    ALLOWED_HOSTS: List[str] = []
    AUTH_PREFIX: str = 'Bearer '

    REPUTATION_WEIGHT: float = 0.5
    RECENCY_HALF_LIFE_DAYS: int = 28

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
