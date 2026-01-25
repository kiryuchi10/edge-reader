from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from app.models.equipment import EquipmentStatus

class EquipmentCreate(BaseModel):
    name: str
    type: str
    protocol: str = "opcua"
    location: Optional[str] = None
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    config: Dict[str, Any]  # EquipmentConfig JSON

class EquipmentUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    status: Optional[EquipmentStatus] = None

class EquipmentResponse(BaseModel):
    id: int
    name: str
    type: str
    protocol: str
    status: EquipmentStatus
    location: Optional[str] = None
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class EquipmentDetailResponse(EquipmentResponse):
    config: Optional[Dict[str, Any]] = None
