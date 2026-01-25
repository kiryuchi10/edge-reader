#!/usr/bin/env python3
"""
Edge Reader MVP Startup Script
"""
import os
import sys
import subprocess
from pathlib import Path

def setup_environment():
    """Setup environment and directories"""
    print("Setting up Edge Reader MVP environment...")
    
    # Create necessary directories
    directories = [
        "papers",
        "papers/chat", 
        "logs",
        "dev-reports/development-logs"
    ]
    
    for dir_path in directories:
        Path(dir_path).mkdir(parents=True, exist_ok=True)
        print(f"✓ Created directory: {dir_path}")
    
    # Check if .env exists
    if not Path(".env").exists():
        if Path(".env.example").exists():
            print("⚠ Creating .env from .env.example")
            subprocess.run(["cp", ".env.example", ".env"])
        else:
            print("⚠ No .env file found. Please create one based on .env.example")

def install_dependencies():
    """Install Python dependencies"""
    print("\nInstalling dependencies...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
        print("✓ Dependencies installed successfully")
    except subprocess.CalledProcessError:
        print("✗ Failed to install dependencies")
        return False
    return True

def run_tests():
    """Run basic tests"""
    print("\nRunning basic tests...")
    try:
        subprocess.run([sys.executable, "-m", "pytest", "apps/backend/tests/", "-v"], check=True)
        print("✓ Tests passed")
    except subprocess.CalledProcessError:
        print("⚠ Some tests failed, but continuing...")

def start_server():
    """Start the FastAPI server"""
    print("\nStarting Edge Reader MVP server...")
    print("Server will be available at: http://localhost:8000")
    print("API documentation at: http://localhost:8000/docs")
    print("\nPress Ctrl+C to stop the server")
    
    try:
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "apps.backend.main:app", 
            "--host", "0.0.0.0", 
            "--port", "8000", 
            "--reload"
        ])
    except KeyboardInterrupt:
        print("\n✓ Server stopped")

def main():
    """Main startup function"""
    print("🚀 Edge Reader MVP Startup")
    print("=" * 40)
    
    # Change to script directory
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    # Setup
    setup_environment()
    
    # Install dependencies
    if not install_dependencies():
        sys.exit(1)
    
    # Run tests
    run_tests()
    
    # Start server
    start_server()

if __name__ == "__main__":
    main()