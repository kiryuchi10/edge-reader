from typing import Dict, Optional, List, AsyncGenerator
import logging
from datetime import datetime
from app.hardware.adapters.opcua_equipment import OPCUAEquipment
from app.hardware.base.equipment_interface import EquipmentInterface

logger = logging.getLogger(__name__)

class HardwareManager:
    """
    Central manager for all equipment instances
    Maintains connection cache and provides unified interface
    """
    
    def __init__(self):
        self._equipment_instances: Dict[int, EquipmentInterface] = {}
    
    def add_equipment(self, equipment_id: int, equipment_type: str, 
                     protocol: str, config: Dict) -> EquipmentInterface:
        """
        Create and cache an equipment adapter instance
        
        Args:
            equipment_id: Database equipment ID
            equipment_type: Type of equipment (plc, hplc, etc.)
            protocol: Communication protocol (opcua, modbus, etc.)
            config: Configuration dictionary
        """
        if equipment_id in self._equipment_instances:
            logger.warning(f"Equipment {equipment_id} already exists, reusing instance")
            return self._equipment_instances[equipment_id]
        
        # Create adapter based on protocol
        if protocol.lower() == "opcua":
            adapter = OPCUAEquipment(
                equipment_id=str(equipment_id),
                config=config
            )
        else:
            raise ValueError(f"Unsupported protocol: {protocol}")
        
        self._equipment_instances[equipment_id] = adapter
        logger.info(f"Added equipment {equipment_id} ({protocol})")
        return adapter
    
    def get_equipment(self, equipment_id: int) -> Optional[EquipmentInterface]:
        """Get equipment adapter instance"""
        return self._equipment_instances.get(equipment_id)
    
    async def connect(self, equipment_id: int) -> bool:
        """Connect to equipment"""
        adapter = self.get_equipment(equipment_id)
        if not adapter:
            raise ValueError(f"Equipment {equipment_id} not found")
        
        return await adapter.connect()
    
    async def disconnect(self, equipment_id: int) -> bool:
        """Disconnect from equipment"""
        adapter = self.get_equipment(equipment_id)
        if not adapter:
            raise ValueError(f"Equipment {equipment_id} not found")
        
        return await adapter.disconnect()
    
    async def get_status(self, equipment_id: int) -> Dict:
        """Get equipment status"""
        adapter = self.get_equipment(equipment_id)
        if not adapter:
            raise ValueError(f"Equipment {equipment_id} not found")
        
        return await adapter.get_status()
    
    async def get_telemetry(self, equipment_id: int, 
                           keys: Optional[List[str]] = None) -> Dict:
        """Get current telemetry data"""
        adapter = self.get_equipment(equipment_id)
        if not adapter:
            raise ValueError(f"Equipment {equipment_id} not found")
        
        return await adapter.get_telemetry(keys)
    
    async def send_command(self, equipment_id: int, command: str, 
                          parameters: Dict) -> bool:
        """Send command to equipment"""
        adapter = self.get_equipment(equipment_id)
        if not adapter:
            raise ValueError(f"Equipment {equipment_id} not found")
        
        return await adapter.send_command(command, parameters)
    
    async def stream_telemetry(self, equipment_id: int, 
                              keys: Optional[List[str]] = None,
                              hz: float = 2.0) -> AsyncGenerator[Dict, None]:
        """
        Stream telemetry data as async generator
        
        Args:
            equipment_id: Equipment ID
            keys: List of keys to stream (None = all)
            hz: Update frequency (Hz)
        
        Yields:
            Telemetry data dictionary
        """
        import asyncio
        
        adapter = self.get_equipment(equipment_id)
        if not adapter:
            raise ValueError(f"Equipment {equipment_id} not found")
        
        interval = 1.0 / hz if hz > 0 else 0.5
        
        while True:
            try:
                data = await adapter.get_telemetry(keys)
                yield data
            except Exception as e:
                logger.error(f"Stream error for equipment {equipment_id}: {e}")
                yield {
                    'equipment_id': equipment_id,
                    'timestamp': datetime.now().isoformat(),
                    'error': str(e),
                    'metrics': {}
                }
            
            await asyncio.sleep(interval)
    
    def remove_equipment(self, equipment_id: int):
        """Remove equipment from cache (and disconnect)"""
        adapter = self._equipment_instances.pop(equipment_id, None)
        if adapter and adapter.connected:
            import asyncio
            asyncio.create_task(adapter.disconnect())

# Global singleton instance
hardware_manager = HardwareManager()
