from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # App
    ENV: str = "development"
    API_BASE_URL: str = "http://localhost:8000/api/v1"
    
    # Database
    DB_DSN: str = "postgresql+psycopg://edge:edgepass@db:5432/edge_reader"
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173"]
    
    # OPC UA
    OPCUA_DEFAULT_TIMEOUT: int = 5
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
