"""
Minimal tests for Edge Reader MVP
"""
import pytest
from fastapi.testclient import TestClient
import tempfile
import os

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '../../..'))

from apps.backend.main import app

client = TestClient(app)

def test_health_check():
    """Test health check endpoint"""
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"ok": True}

def test_text_analysis():
    """Test text analysis endpoint"""
    response = client.post(
        "/analysis/text",
        json={"text": "This is a test message for analysis."}
    )
    assert response.status_code == 200
    data = response.json()
    assert "analysis" in data
    assert "intent" in data["analysis"]
    assert "sentiment" in data["analysis"]

def test_chat_endpoint():
    """Test chat endpoint"""
    response = client.post(
        "/chat/",
        json={"query": "What is machine learning?"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "evidences" in data
    assert "status" in data

def test_index_status():
    """Test index status endpoint"""
    response = client.get("/chat/index-status")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data

def test_empty_text_analysis():
    """Test text analysis with empty text"""
    response = client.post(
        "/analysis/text",
        json={"text": ""}
    )
    assert response.status_code == 400

def test_empty_chat_query():
    """Test chat with empty query"""
    response = client.post(
        "/chat/",
        json={"query": ""}
    )
    assert response.status_code == 400

if __name__ == "__main__":
    pytest.main([__file__])