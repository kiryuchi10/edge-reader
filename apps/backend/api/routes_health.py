"""
Health check endpoints
"""
from fastapi import APIRouter

router = APIRouter()

@router.get("/healthz")
async def health_check():
    """Health check endpoint"""
    return {"ok": True}