"""
Edge Reader MVP - Main FastAPI Application
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .api.routes_health import router as health_router
from .api.routes_ingest import router as ingest_router
from .api.routes_analysis import router as analysis_router
from .api.routes_chat import router as chat_router

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Edge Reader MVP",
    description="Multimodal AI-powered document processing system",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health_router, tags=["health"])
app.include_router(ingest_router, prefix="/ingest", tags=["ingest"])
app.include_router(analysis_router, prefix="/analysis", tags=["analysis"])
app.include_router(chat_router, prefix="/chat", tags=["chat"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("apps.backend.main:app", host="0.0.0.0", port=8000, reload=True)