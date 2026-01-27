"""
API v1 Router Aggregator
Combines all domain routers into a single API router
"""
from fastapi import APIRouter
from app.api.v1.hardware import router as hardware_router
from app.api.v1.documents import router as documents_router
from app.api.v1.datasets import router as datasets_router
from app.api.v1.jobs import router as jobs_router
from app.api.v1.ml_models import router as ml_models_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.ai import router as ai_router

# Create main API router
api_router = APIRouter()

# Include all domain routers
api_router.include_router(hardware_router, prefix="/hardware", tags=["hardware"])
api_router.include_router(documents_router, tags=["documents"])
api_router.include_router(datasets_router, tags=["datasets"])
api_router.include_router(jobs_router, tags=["jobs"])
api_router.include_router(ml_models_router, tags=["ml-models"])
api_router.include_router(analytics_router, tags=["analytics"])
api_router.include_router(ai_router, tags=["ai"])
