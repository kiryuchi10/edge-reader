"""
Vision service for image understanding
Uses OpenAI GPT-4V or Anthropic Claude for image analysis
"""
import os
from typing import Dict, Any, Optional
import logging
import base64
from pathlib import Path

logger = logging.getLogger(__name__)

class VisionService:
    """Image understanding using vision-language models"""
    
    def __init__(self, provider: str = "openai", api_key: Optional[str] = None):
        """
        Initialize vision service
        
        Args:
            provider: 'openai' or 'anthropic'
            api_key: API key (if None, reads from environment)
        """
        self.provider = provider.lower()
        
        if self.provider == "openai":
            try:
                from openai import OpenAI
                self.client = OpenAI(api_key=api_key or os.getenv("OPENAI_API_KEY"))
                self.model = "gpt-4o"  # or "gpt-4-vision-preview"
                logger.info("Vision service initialized with OpenAI")
            except ImportError:
                logger.warning("OpenAI library not installed. Install with: pip install openai")
                self.client = None
                
        elif self.provider == "anthropic":
            try:
                from anthropic import Anthropic
                self.client = Anthropic(api_key=api_key or os.getenv("ANTHROPIC_API_KEY"))
                self.model = "claude-3-5-sonnet-20241022"  # or "claude-3-opus-20240229"
                logger.info("Vision service initialized with Anthropic")
            except ImportError:
                logger.warning("Anthropic library not installed. Install with: pip install anthropic")
                self.client = None
        else:
            raise ValueError(f"Unknown provider: {provider}. Use 'openai' or 'anthropic'")
    
    def describe_image(
        self, 
        image_bytes: bytes,
        prompt: str = "Describe this image in detail. Include any text, objects, layout, and context.",
        max_tokens: int = 300
    ) -> Dict[str, Any]:
        """
        Get detailed description of image
        
        Args:
            image_bytes: Image file bytes
            prompt: Custom prompt for description
            max_tokens: Maximum tokens in response
        
        Returns:
            Dict with description and metadata
        """
        if not self.client:
            return {
                "description": "",
                "provider": self.provider,
                "error": f"{self.provider.capitalize()} client not initialized. Check API key and library installation."
            }
        
        try:
            # Encode image to base64
            image_data = base64.b64encode(image_bytes).decode('utf-8')
            
            # Determine image format (simplified - assumes JPEG/PNG)
            image_format = "jpeg"  # Default, could be detected from bytes
            
            logger.info(f"Analyzing image with {self.provider} ({self.model})")
            
            if self.provider == "openai":
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": prompt},
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:image/{image_format};base64,{image_data}"
                                    }
                                }
                            ]
                        }
                    ],
                    max_tokens=max_tokens,
                )
                description = response.choices[0].message.content
                
            else:  # anthropic
                response = self.client.messages.create(
                    model=self.model,
                    max_tokens=max_tokens,
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "image",
                                    "source": {
                                        "type": "base64",
                                        "media_type": f"image/{image_format}",
                                        "data": image_data,
                                    }
                                },
                                {"type": "text", "text": prompt}
                            ]
                        }
                    ]
                )
                description = response.content[0].text
            
            logger.info(f"Vision analysis complete: {len(description)} characters")
            
            return {
                "description": description,
                "provider": self.provider,
                "model": self.model,
                "tokens_used": getattr(response, 'usage', {}).get('total_tokens', 0) if hasattr(response, 'usage') else 0
            }
            
        except Exception as e:
            logger.error(f"Vision analysis failed: {e}", exc_info=True)
            return {
                "description": "",
                "provider": self.provider,
                "error": str(e)
            }
