from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.alarm import AlarmSeverity

class AlarmResponse(BaseModel):
    id: int
    equipment_id: int
    ts: datetime
    severity: AlarmSeverity
    code: Optional[str] = None
    message: str
    acked_at: Optional[datetime] = None
    equipment_name: Optional[str] = None
    
    class Config:
        from_attributes = True
