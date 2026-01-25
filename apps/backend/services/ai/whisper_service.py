"""
Whisper-based audio transcription service
Uses OpenAI Whisper for speech-to-text conversion
"""
import whisper
from pathlib import Path
from typing import Optional, Dict, Any, List
import logging
import tempfile
import os

logger = logging.getLogger(__name__)

class WhisperService:
    """Audio transcription using OpenAI Whisper"""
    
    _model_cache = {}  # Cache loaded models
    
    def __init__(self, model_size: str = "base", use_gpu: bool = True):
        """
        Initialize Whisper service
        
        Args:
            model_size: Model size - tiny, base, small, medium, large, or large-v2
            use_gpu: Whether to use GPU if available
        """
        self.model_size = model_size
        self.use_gpu = use_gpu
        
        # Load model (cached per size)
        if model_size not in self._model_cache:
            logger.info(f"Loading Whisper model: {model_size}")
            self.model = whisper.load_model(model_size)
            self._model_cache[model_size] = self.model
            logger.info(f"Whisper model {model_size} loaded successfully")
        else:
            self.model = self._model_cache[model_size]
            logger.info(f"Using cached Whisper model: {model_size}")
    
    def transcribe(
        self, 
        audio_bytes: bytes,
        audio_format: str = "wav",
        language: Optional[str] = None,
        task: str = "transcribe"
    ) -> Dict[str, Any]:
        """
        Transcribe audio bytes to text
        
        Args:
            audio_bytes: Audio file bytes
            audio_format: Audio format (wav, mp3, etc.)
            language: Language code (e.g., 'en', 'ko') or None for auto-detect
            task: 'transcribe' or 'translate' (translate to English)
        
        Returns:
            Dict with text, language, segments, confidence, etc.
        """
        temp_path = None
        try:
            # Save audio bytes to temporary file
            suffix = f".{audio_format}" if not audio_format.startswith('.') else audio_format
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
                temp_file.write(audio_bytes)
                temp_path = temp_file.name
            
            logger.info(f"Transcribing audio: {temp_path} (size: {len(audio_bytes)} bytes)")
            
            # Transcribe with Whisper
            result = self.model.transcribe(
                temp_path,
                language=language,
                task=task,
                verbose=False,
                fp16=False  # Use fp32 for better compatibility
            )
            
            # Format response
            response = {
                "text": result["text"].strip(),
                "language": result.get("language", "unknown"),
                "segments": [
                    {
                        "start": float(seg.get("start", 0)),
                        "end": float(seg.get("end", 0)),
                        "text": seg.get("text", "").strip()
                    }
                    for seg in result.get("segments", [])
                ],
                "no_speech_prob": float(result.get("no_speech_prob", 0.0)),
                "confidence": 1.0 - float(result.get("no_speech_prob", 0.0)),
            }
            
            logger.info(f"Transcription complete: {len(response['text'])} characters, language: {response['language']}")
            return response
            
        except Exception as e:
            logger.error(f"Whisper transcription failed: {e}", exc_info=True)
            return {
                "text": "",
                "language": "unknown",
                "segments": [],
                "confidence": 0.0,
                "error": str(e)
            }
        finally:
            # Clean up temp file
            if temp_path and os.path.exists(temp_path):
                try:
                    os.unlink(temp_path)
                except Exception as e:
                    logger.warning(f"Failed to delete temp file {temp_path}: {e}")
    
    def translate(self, audio_bytes: bytes, audio_format: str = "wav", language: Optional[str] = None) -> Dict[str, Any]:
        """
        Translate audio to English
        
        Args:
            audio_bytes: Audio file bytes
            audio_format: Audio format
            language: Source language code (optional, auto-detect if None)
        
        Returns:
            Dict with translated text and metadata
        """
        return self.transcribe(audio_bytes, audio_format=audio_format, language=language, task="translate")
