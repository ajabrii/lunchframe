"""Launchframe — Gateway Configuration."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://lunchframe:secret@postgres:5432/lunchframe"

    # Redis
    REDIS_URL: str = "redis://redis:6379/0"

    # JWT
    JWT_SECRET: str = "change_me_in_production_minimum_32_chars"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24

    # Downstream services
    CRAWLER_URL: str = "http://crawler:8001"
    SCRIPTGEN_URL: str = "http://scriptgen:8002"
    TTS_URL: str = "http://tts:8004"
    RENDERER_URL: str = "http://renderer:8003"

    # MinIO
    MINIO_URL: str = "http://minio:9000"
    MINIO_ACCESS_KEY: str = "lunchframe_dev"
    MINIO_SECRET_KEY: str = "lunchframe_dev_secret_min_8"

    class Config:
        env_file = ".env"


settings = Settings()
