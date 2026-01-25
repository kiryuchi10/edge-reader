"""
Development logging utility
"""
import json
import os
from datetime import datetime
from pathlib import Path

def log_development_event(event_type: str, message: str, details: dict = None):
    """
    Log development events to JSON format
    
    Args:
        event_type: Type of event (e.g., 'test', 'build', 'deploy')
        message: Event message
        details: Additional event details
    """
    # Create logs directory
    log_dir = Path("dev-reports/development-logs")
    log_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate timestamp-based filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_file = log_dir / f"dev_log_{timestamp}.json"
    
    # Create log entry
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "event_type": event_type,
        "message": message,
        "details": details or {},
        "environment": os.getenv("ENVIRONMENT", "development")
    }
    
    # Write to file
    with open(log_file, 'w') as f:
        json.dump(log_entry, f, indent=2)
    
    print(f"Development event logged: {log_file}")

if __name__ == "__main__":
    # Example usage
    log_development_event(
        "mvp_setup",
        "Edge Reader MVP basic structure created",
        {
            "components": ["FastAPI app", "multimodal services", "RAG system"],
            "status": "initial_implementation"
        }
    )