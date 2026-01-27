"""
Edge Reader - Main FastAPI Application
Industrial Hardware Integration & AI/ML Analysis Platform
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.core.db import engine, Base
from app.api.v1 import api_router
from app.models import *  # Import all models for table creation

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info(f"Starting Edge Reader API v{settings.APP_VERSION if hasattr(settings, 'APP_VERSION') else '0.1.0'}")
    
    # Create database tables (for development - use Alembic in production)
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized")
    except Exception as e:
        logger.warning(f"Could not create tables: {e}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Edge Reader API")

app = FastAPI(
    title="Edge Reader - Manufacturing Intelligence Platform",
    description="Industrial hardware integration, document processing, and AI/ML analysis",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include main API router (includes all domain routers)
app.include_router(api_router, prefix="/api/v1")

@app.get("/api/v1/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "edge-reader-api",
        "version": "0.1.0"
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Edge Reader - Manufacturing Intelligence Platform",
        "version": "0.1.0",
        "docs": "/api/docs",
        "endpoints": {
            "hardware": "/api/v1/hardware",
            "documents": "/api/v1/documents",
            "datasets": "/api/v1/datasets",
            "jobs": "/api/v1/jobs",
            "ml_models": "/api/v1/models",
            "analytics": "/api/v1/analytics",
            "ai": "/api/v1/ai"
        }
    }
