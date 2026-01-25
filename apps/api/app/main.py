from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.db import engine, Base
from app.api.v1.hardware import router as hardware_router
from app.models import *  # Import all models for table creation

# Create database tables (for development - use Alembic in production)
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning: Could not create tables: {e}")

app = FastAPI(
    title="Edge Reader - Hardware Integration API",
    description="Industrial hardware integration MVP",
    version="0.1.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(hardware_router, prefix="/api/v1", tags=["hardware"])

@app.get("/api/v1/health")
async def health():
    return {"status": "ok", "service": "edge-reader-api"}

@app.get("/")
async def root():
    return {
        "message": "Edge Reader Hardware Integration API",
        "version": "0.1.0",
        "docs": "/docs"
    }
