"""
AI Services for Edge Reader
Real AI model integrations for audio, image, and text processing
"""
from .whisper_service import WhisperService
from .ocr_service import OCRService
from .vision_service import VisionService
from .deepseek_service import DeepSeekService, get_deepseek_service

__all__ = ["WhisperService", "OCRService", "VisionService", "DeepSeekService", "get_deepseek_service"]
