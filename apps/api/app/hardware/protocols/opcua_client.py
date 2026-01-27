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
    
    async def subscribe_to_changes(self, node_ids: List[str], 
                                   callback, 
                                   interval: int = 100) -> Optional[Any]:
        """
        Subscribe to value changes on multiple nodes
        
        Args:
            node_ids: List of OPC UA node IDs to subscribe to
            callback: Async function to call when values change
                     Signature: async def callback(node_id: str, value: Any, data_type: Any)
            interval: Sampling interval in milliseconds (default: 100ms = 10Hz)
        
        Returns:
            Subscription handle (can be used to unsubscribe)
        """
        if not self.connected or not self.client:
            raise ConnectionError("Not connected to OPC UA server")
        
        try:
            # Create subscription with specified sampling interval
            subscription = await self.client.create_subscription(interval, callback)
            
            # Subscribe to each node
            handles = []
            for node_id in node_ids:
                node = self.client.get_node(node_id)
                handle = await subscription.subscribe_data_change(node)
                handles.append(handle)
                logger.info(f"Subscribed to node {node_id}")
            
            logger.info(f"Subscribed to {len(node_ids)} nodes with {interval}ms interval")
            return {
                "subscription": subscription,
                "handles": handles,
                "node_ids": node_ids
            }
        except Exception as e:
            logger.error(f"Subscription failed: {e}")
            raise
    
    async def unsubscribe(self, subscription_handle: Dict[str, Any]):
        """Unsubscribe from node changes"""
        try:
            subscription = subscription_handle.get("subscription")
            if subscription:
                await subscription.delete()
                logger.info("Unsubscribed from nodes")
        except Exception as e:
            logger.error(f"Unsubscribe failed: {e}")
    
    async def call_method(self, object_id: str, method_id: str, 
                         arguments: List[Any] = None) -> Any:
        """
        Call a method on the OPC UA server
        
        Args:
            object_id: Parent object node ID
            method_id: Method node ID to call
            arguments: List of input arguments (must match method signature)
        
        Returns:
            Method return value(s)
        """
        if not self.connected or not self.client:
            raise ConnectionError("Not connected to OPC UA server")
        
        try:
            parent = self.client.get_node(object_id)
            method = self.client.get_node(method_id)
            
            if arguments is None:
                arguments = []
            
            result = await parent.call_method(method, *arguments)
            logger.info(f"Called method {method_id} on {object_id}")
            return result
        except Exception as e:
            logger.error(f"Method call failed: {e}")
            raise
    
    async def get_node_attributes(self, node_id: str) -> Dict[str, Any]:
        """Get all attributes of a node"""
        if not self.connected or not self.client:
            raise ConnectionError("Not connected to OPC UA server")
        
        try:
            node = self.client.get_node(node_id)
            attributes = {
                "node_id": str(node.nodeid),
                "display_name": (await node.read_display_name()).Text,
                "browse_name": str(await node.read_browse_name()),
                "data_type": str(await node.read_data_type_as_variant_type()),
                "value": await node.read_value(),
                "access_level": await node.read_access_level(),
                "user_access_level": await node.read_user_access_level(),
            }
            return attributes
        except Exception as e:
            logger.error(f"Failed to read node attributes: {e}")
            raise
    
    def is_connected(self) -> bool:
        """Check if client is connected"""
        return self.connected and self.client is not None
