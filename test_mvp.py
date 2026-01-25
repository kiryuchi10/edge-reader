#!/usr/bin/env python3
"""
Quick MVP functionality test
"""
import requests
import json
import time
from pathlib import Path

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/healthz")
        if response.status_code == 200:
            print("✓ Health check passed")
            return True
        else:
            print(f"✗ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("✗ Cannot connect to server. Is it running?")
        return False

def test_text_analysis():
    """Test text analysis endpoint"""
    print("Testing text analysis...")
    try:
        response = requests.post(
            f"{BASE_URL}/analysis/text",
            json={"text": "This is a test message for NLP analysis."}
        )
        if response.status_code == 200:
            data = response.json()
            print("✓ Text analysis working")
            print(f"  Intent: {data['analysis']['intent']['label']}")
            print(f"  Sentiment: {data['analysis']['sentiment']['label']}")
            return True
        else:
            print(f"✗ Text analysis failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Text analysis error: {e}")
        return False

def test_chat():
    """Test chat endpoint"""
    print("Testing chat endpoint...")
    try:
        response = requests.post(
            f"{BASE_URL}/chat/",
            json={"query": "What is artificial intelligence?"}
        )
        if response.status_code == 200:
            data = response.json()
            print("✓ Chat endpoint working")
            print(f"  Answer length: {len(data['answer'])} characters")
            print(f"  Evidence count: {len(data['evidences'])}")
            return True
        else:
            print(f"✗ Chat failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Chat error: {e}")
        return False

def test_index_status():
    """Test index status endpoint"""
    print("Testing index status...")
    try:
        response = requests.get(f"{BASE_URL}/chat/index-status")
        if response.status_code == 200:
            data = response.json()
            print("✓ Index status working")
            print(f"  Status: {data['status']}")
            return True
        else:
            print(f"✗ Index status failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Index status error: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Edge Reader MVP Test Suite")
    print("=" * 40)
    
    tests = [
        test_health,
        test_text_analysis,
        test_chat,
        test_index_status
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 40)
    print(f"Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! MVP is working correctly.")
    else:
        print("⚠ Some tests failed. Check the output above.")

if __name__ == "__main__":
    main()