from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from datetime import datetime
from enum import Enum

class EquipmentStatus(Enum):
    """Standard equipment states"""
    IDLE = "idle"
    RUNNING = "running"
    PAUSED = "paused"
    ERROR = "error"
    MAINTENANCE = "maintenance"
    OFFLINE = "offline"

class EquipmentInterface(ABC):
    """
    Abstract base class that all equipment adapters must implement
    Ensures consistent interface across different hardware types
    """
    
    def __init__(self, equipment_id: str, config: Dict[str, Any]):
        self.equipment_id = equipment_id
        self.config = config
        self.status = EquipmentStatus.OFFLINE
        self.last_update = None
        self.connected = False
    
    @abstractmethod
    async def connect(self) -> bool:
        """Establish connection to equipment"""
        pass
    
    @abstractmethod
    async def disconnect(self) -> bool:
        """Gracefully disconnect from equipment"""
        pass
    
    @abstractmethod
    async def get_status(self) -> Dict[str, Any]:
        """Get current equipment status"""
        pass
    
    @abstractmethod
    async def get_telemetry(self, keys: Optional[List[str]] = None) -> Dict[str, Any]:
        """Get real-time telemetry data (temp, pressure, flow, etc.)"""
        pass
    
    @abstractmethod
    async def send_command(self, command: str, parameters: Dict[str, Any]) -> bool:
        """Send command to equipment"""
        pass
    
    @abstractmethod
    async def get_alarms(self) -> List[Dict[str, Any]]:
        """Get active alarms/warnings"""
        pass
    
    async def health_check(self) -> bool:
        """Basic health check - override if equipment has specific health monitoring"""
        try:
            if not self.connected:
                return False
            status = await self.get_status()
            return status.get('connected', False)
        except:
            return False
