from typing import Dict, Any, List, Optional
from datetime import datetime
import logging
from app.hardware.base.equipment_interface import EquipmentInterface, EquipmentStatus
from app.hardware.protocols.opcua_client import OPCUAClient

logger = logging.getLogger(__name__)

class OPCUAEquipment(EquipmentInterface):
    """
    OPC UA Equipment Adapter
    Connects to OPC UA servers (PLCs, SCADA systems, etc.)
    """
    
    def __init__(self, equipment_id: str, config: Dict[str, Any]):
        super().__init__(equipment_id, config)
        self.endpoint_url = config.get('endpoint_url')
        self.node_map = config.get('nodes', {})  # { "temperature": "ns=2;s=Temp", ... }
        self.username = config.get('username')
        self.password = config.get('password')
        self.timeout = config.get('timeout', 5)
        
        if not self.endpoint_url:
            raise ValueError("endpoint_url is required in config")
        
        self.opcua_client = OPCUAClient(
            endpoint_url=self.endpoint_url,
            username=self.username,
            password=self.password,
            timeout=self.timeout
        )
    
    async def connect(self) -> bool:
        """Establish connection to OPC UA server"""
        try:
            success = await self.opcua_client.connect()
            if success:
                self.connected = True
                self.status = EquipmentStatus.IDLE
                self.last_update = datetime.now()
            else:
                self.status = EquipmentStatus.OFFLINE
            return success
        except Exception as e:
            logger.error(f"Equipment {self.equipment_id} connection failed: {e}")
            self.status = EquipmentStatus.ERROR
            return False
    
    async def disconnect(self) -> bool:
        """Disconnect from OPC UA server"""
        try:
            await self.opcua_client.disconnect()
            self.connected = False
            self.status = EquipmentStatus.OFFLINE
            self.last_update = datetime.now()
            return True
        except Exception as e:
            logger.error(f"Equipment {self.equipment_id} disconnect failed: {e}")
            return False
    
    async def get_status(self) -> Dict[str, Any]:
        """Get current equipment status"""
        if not self.connected:
            return {
                'equipment_id': self.equipment_id,
                'status': EquipmentStatus.OFFLINE.value,
                'connected': False,
                'timestamp': datetime.now().isoformat()
            }
        
        try:
            # Try reading a node to verify connection
            if self.node_map:
                first_node = list(self.node_map.values())[0]
                await self.opcua_client.read_node(first_node)
            
            return {
                'equipment_id': self.equipment_id,
                'status': self.status.value,
                'connected': True,
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Status check failed: {e}")
            self.status = EquipmentStatus.ERROR
            return {
                'equipment_id': self.equipment_id,
                'status': EquipmentStatus.ERROR.value,
                'connected': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    async def get_telemetry(self, keys: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Get real-time telemetry data from OPC UA nodes
        
        Args:
            keys: List of telemetry keys to read (e.g., ["temperature", "pressure"])
                  If None, reads all configured nodes
        """
        if not self.connected:
            raise ConnectionError("Equipment not connected")
        
        if not self.node_map:
            return {}
        
        # Determine which nodes to read
        if keys is None:
            keys_to_read = list(self.node_map.keys())
        else:
            keys_to_read = [k for k in keys if k in self.node_map]
        
        if not keys_to_read:
            return {}
        
        try:
            # Build node IDs list
            node_ids = [self.node_map[key] for key in keys_to_read]
            
            # Read all nodes
            values = await self.opcua_client.read_nodes(node_ids)
            
            # Map back to keys
            result = {}
            for key in keys_to_read:
                node_id = self.node_map[key]
                if node_id in values:
                    result[key] = values[node_id]
            
            return {
                'equipment_id': self.equipment_id,
                'timestamp': datetime.now().isoformat(),
                'metrics': result
            }
        except Exception as e:
            logger.error(f"Telemetry read failed: {e}")
            raise
    
    async def send_command(self, command: str, parameters: Dict[str, Any]) -> bool:
        """
        Send command to equipment
        
        Commands:
        - "set": Set a node value (requires "node" and "value" in parameters)
        - "start": Start process (if available)
        - "stop": Stop process (if available)
        """
        if not self.connected:
            raise ConnectionError("Equipment not connected")
        
        try:
            if command == "set":
                node = parameters.get("node")
                value = parameters.get("value")
                if not node or value is None:
                    raise ValueError("'set' command requires 'node' and 'value' parameters")
                
                # If node is a key (e.g., "temperature"), look up the actual node ID
                node_id = self.node_map.get(node, node)
                
                success = await self.opcua_client.write_node(node_id, value)
                return success
            
            elif command in ["start", "stop"]:
                # These would require method calls or specific nodes
                # For MVP, just log the command
                logger.info(f"Command {command} received but not implemented yet")
                return True
            
            else:
                logger.warning(f"Unknown command: {command}")
                return False
                
        except Exception as e:
            logger.error(f"Command failed: {e}")
            return False
    
    async def get_alarms(self) -> List[Dict[str, Any]]:
        """Get active alarms (if supported by OPC UA server)"""
        # MVP: Return empty list, can be extended to read alarm nodes
        return []
