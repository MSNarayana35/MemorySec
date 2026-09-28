import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "MemorySec - AI Incident Response Agent"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # LLM Settings
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "openai/gpt-oss-120b"
    
    # Hindsight Memory Settings
    HINDSIGHT_API_URL: Optional[str] = "http://localhost:8888"
    HINDSIGHT_API_KEY: Optional[str] = None
    HINDSIGHT_BANK_ID: str = "memorysec-soc-bank"
    
    # Database Settings
    DATABASE_URL: str = "sqlite:///./memorysec.db"
    
    # Environment
    APP_ENV: str = "development"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
