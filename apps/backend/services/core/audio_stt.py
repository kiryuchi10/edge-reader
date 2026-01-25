"""
Speech-to-Text service using Whisper
"""
from typing import Dict, Any
import logging
from ..ai import WhisperService

logger = logging.getLogger(__name__)

# Initialize Whisper service (singleton pattern)
_whisper_service = None

def get_whisper_service() -> WhisperService:
    """Get or create Whisper service instance"""
    global _whisper_service
    if _whisper_service is None:
        _whisper_service = WhisperService(model_size="base")
    return _whisper_service

async def transcribe(audio_bytes: bytes) -> Dict[str, Any]:
    """
    Transcribe audio bytes to text using Whisper
    
    Args:
        audio_bytes: Audio file bytes
        
    Returns:
        Dict with text, segments, language, and confidence
    """
    try:
        whisper_service = get_whisper_service()
        result = whisper_service.transcribe(audio_bytes, audio_format="wav")
        
        # Format to match expected response structure
        return {
            "text": result.get("text", ""),
            "segments": result.get("segments", []),
            "lang": result.get("language", "unknown"),
            "confidence": result.get("confidence", 0.0),
            "no_speech_prob": result.get("no_speech_prob", 0.0),
        }
        
    except Exception as e:
        logger.error(f"Transcription failed: {e}", exc_info=True)
        return {
            "text": f"Error processing audio: {str(e)}",
            "segments": [],
            "lang": "unknown",
            "confidence": 0.0,
            "error": str(e)
        }