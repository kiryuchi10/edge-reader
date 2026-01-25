from typing import Dict, Any, Optional, List
import logging
from asyncua import Client, ua

logger = logging.getLogger(__name__)

class OPCUAClient:
    """
    OPC UA client wrapper for industrial equipment communication
    Supports secure connections, subscriptions, and method calls
    """
    
    def __init__(self, endpoint_url: str, 
                 username: Optional[str] = None,
                 password: Optional[str] = None,
                 certificate_path: Optional[str] = None,
                 timeout: int = 5):
        self.endpoint_url = endpoint_url
        self.username = username
        self.password = password
        self.certificate_path = certificate_path
        self.timeout = timeout
        self.client = None
        self.connected = False
    
    async def connect(self) -> bool:
        """Connect to OPC UA server with authentication"""
        try:
            self.client = Client(url=self.endpoint_url, timeout=self.timeout)
            
            # Set security if certificates provided
            if self.certificate_path:
                await self.client.set_security_string(
                    f"Basic256Sha256,SignAndEncrypt,{self.certificate_path}"
                )
            
            # Set user authentication
            if self.username and self.password:
                await self.client.set_user(self.username)
                await self.client.set_password(self.password)
            
            await self.client.connect()
            self.connected = True
            logger.info(f"Connected to OPC UA server: {self.endpoint_url}")
            return True
            
        except Exception as e:
            logger.error(f"OPC UA connection failed: {e}")
            self.connected = False
            return False
    
    async def disconnect(self):
        """Disconnect from OPC UA server"""
        if self.client and self.connected:
            try:
                await self.client.disconnect()
                logger.info("Disconnected from OPC UA server")
            except Exception as e:
                logger.error(f"Disconnect error: {e}")
            finally:
                self.connected = False
                self.client = None
    
    async def read_node(self, node_id: str) -> Any:
        """Read value from a specific node"""
        if not self.connected or not self.client:
            raise ConnectionError("Not connected to OPC UA server")
        
        try:
            node = self.client.get_node(node_id)
            value = await node.read_value()
            return value
        except Exception as e:
            logger.error(f"Failed to read node {node_id}: {e}")
            raise
    
    async def read_nodes(self, node_ids: List[str]) -> Dict[str, Any]:
        """Read multiple nodes at once"""
        if not self.connected or not self.client:
            raise ConnectionError("Not connected to OPC UA server")
        
        try:
            nodes = [self.client.get_node(node_id) for node_id in node_ids]
            values = await self.client.read_values(nodes)
            return dict(zip(node_ids, values))
        except Exception as e:
            logger.error(f"Failed to read nodes: {e}")
            raise
    
    async def write_node(self, node_id: str, value: Any) -> bool:
        """Write value to a specific node"""
        if not self.connected or not self.client:
            raise ConnectionError("Not connected to OPC UA server")
        
        try:
            node = self.client.get_node(node_id)
            await node.write_value(value)
            logger.info(f"Wrote {value} to node {node_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to write node {node_id}: {e}")
            return False
    
    async def browse_nodes(self, node_id: str = "i=85") -> List[Dict[str, Any]]:
        """Browse available nodes (default: Objects folder)"""
        if not self.connected or not self.client:
            raise ConnectionError("Not connected to OPC UA server")
        
        try:
            node = self.client.get_node(node_id)
            children = await node.get_children()
            result = []
            for child in children:
                display_name = await child.read_display_name()
                result.append({
                    "node_id": str(child.nodeid),
                    "display_name": display_name.Text,
                    "browse_name": str(await child.read_browse_name())
                })
            return result
        except Exception as e:
            logger.error(f"Failed to browse nodes: {e}")
            raise
