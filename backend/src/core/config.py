from pydantic_settings import BaseSettings, SettingsConfigDict
import os
from pathlib import Path

# Explicitly point to backend/.env
ENV_FILE_PATH = Path(__file__).resolve().parent.parent.parent / ".env"

class Settings(BaseSettings):
    PROJECT_NAME: str = "StreamVerse API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/postgres"
    
    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    
    # Security
    JWT_SECRET_KEY: str = "secret"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    model_config = SettingsConfigDict(env_file=str(ENV_FILE_PATH), env_file_encoding="utf-8", extra="ignore")

settings = Settings()
