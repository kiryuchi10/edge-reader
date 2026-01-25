from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime

class TelemetryData(BaseModel):
    timestamp: datetime
    equipment_id: int
    metrics: Dict[str, float]  # { "temperature": 24.5, "pressure": 1.02 }

class TelemetryPointCreate(BaseModel):
    equipment_id: int
    key: str
    value: float
    unit: Optional[str] = None

class TelemetryPointResponse(BaseModel):
    id: int
    equipment_id: int
    ts: datetime
    key: str
    value: float
    unit: Optional[str] = None
    
    class Config:
        from_attributes = True
