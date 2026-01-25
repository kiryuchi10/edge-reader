"""
DeepSeek API service for AI chat
"""
import os
from typing import Optional, List, Dict, Any
import httpx
import logging

logger = logging.getLogger(__name__)

class DeepSeekService:
    """Service for interacting with DeepSeek API"""
    
    def __init__(self):
        self.api_key = os.getenv("DEEPSEEK_API_KEY")
        self.api_url = os.getenv("DEEPSEEK_API_URL", "https://api.deepseek.com")
        self.model = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")
        
        if not self.api_key:
            logger.warning("DEEPSEEK_API_KEY not found in environment variables. AI Chat will use dummy responses.")
            self.api_key = None
    
    def is_configured(self) -> bool:
        """Check if DeepSeek API is properly configured"""
        return self.api_key is not None and len(self.api_key.strip()) > 0
    
    async def chat(
        self, 
        messages: List[Dict[str, str]], 
        stream: bool = False,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Send chat request to DeepSeek API
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            stream: Whether to stream the response
            temperature: Sampling temperature (0.0-2.0)
            max_tokens: Maximum tokens to generate
            
        Returns:
            API response dict
        """
        if not self.is_configured():
            raise ValueError(
                "DEEPSEEK_API_KEY not configured. "
                "Please set DEEPSEEK_API_KEY in your .env file. "
                "See docs/DEEPSEEK_API_SETUP.md for instructions."
            )
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": messages,
            "stream": stream,
            "temperature": temperature
        }
        
        if max_tokens:
            payload["max_tokens"] = max_tokens
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.api_url}/v1/chat/completions",
                    headers=headers,
                    json=payload
                )
                response.raise_for_status()
                return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"DeepSeek API HTTP error: {e.response.status_code} - {e.response.text}")
            raise Exception(f"DeepSeek API error: {e.response.status_code}")
        except httpx.RequestError as e:
            logger.error(f"DeepSeek API request error: {e}")
            raise Exception(f"Failed to connect to DeepSeek API: {str(e)}")
        except Exception as e:
            logger.error(f"DeepSeek API unexpected error: {e}", exc_info=True)
            raise
    
    async def generate_response(
        self,
        query: str,
        context: Optional[str] = None,
        system_prompt: Optional[str] = None
    ) -> str:
        """
        Generate a response to a query with optional context
        
        Args:
            query: User query
            context: Optional context/evidence to include
            system_prompt: Optional system prompt
            
        Returns:
            Generated response text
        """
        messages = []
        
        # Add system prompt if provided
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        elif context:
            # Default system prompt when context is provided
            messages.append({
                "role": "system",
                "content": "You are a helpful AI assistant that answers questions based on the provided context. "
                          "Use the context to provide accurate and relevant answers. "
                          "If the context doesn't contain enough information, say so."
            })
        else:
            messages.append({
                "role": "system",
                "content": "You are a helpful AI assistant."
            })
        
        # Add context if provided
        if context:
            messages.append({
                "role": "user",
                "content": f"Context:\n{context}\n\nQuestion: {query}"
            })
        else:
            messages.append({"role": "user", "content": query})
        
        try:
            response = await self.chat(messages)
            
            # Extract the response text
            if "choices" in response and len(response["choices"]) > 0:
                return response["choices"][0]["message"]["content"]
            else:
                raise Exception("Unexpected response format from DeepSeek API")
                
        except ValueError as e:
            # API key not configured - return error message
            raise
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            raise


# Global instance
_deepseek_service: Optional[DeepSeekService] = None

def get_deepseek_service() -> DeepSeekService:
    """Get or create DeepSeek service instance"""
    global _deepseek_service
    if _deepseek_service is None:
        _deepseek_service = DeepSeekService()
    return _deepseek_service
