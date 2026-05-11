from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    APP_NAME: str = "爬虫可视化平台"
    DEBUG: bool = True
    PORT: int = 8025
    DATABASE_URL: str = "sqlite:///./database/app.db"
    
    class Config:
        env_file = ".env"

settings = Settings()
