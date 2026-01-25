#!/usr/bin/env python3
"""
Simple server runner for Edge Reader MVP
"""
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "apps.backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )