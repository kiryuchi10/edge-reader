from pydantic import BaseModel
from typing import Dict, Any, Optional

class EquipmentCommand(BaseModel):
    command: str  # start, stop, set, etc.
    parameters: Dict[str, Any]  # { "node": "...", "value": 1.2 }

class CommandResponse(BaseModel):
    success: bool
    message: Optional[str] = None
