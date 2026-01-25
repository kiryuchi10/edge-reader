"""
File ingestion endpoints for multimodal processing
Now using real AI models (Whisper, Tesseract OCR, Vision models)
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Dict, Any
import logging

from ..services.core.audio_stt import transcribe
from ..services.core.audio_emotion import predict_emotion_from_wav
from ..services.core.image_ocr import run_ocr
from ..services.ai import VisionService

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize vision service (optional, only if API keys are available)
_vision_service = None

def get_vision_service() -> VisionService:
    """Get or create vision service instance (if API keys available)"""
    global _vision_service
    if _vision_service is None:
        try:
            import os
            if os.getenv("OPENAI_API_KEY"):
                _vision_service = VisionService(provider="openai")
            elif os.getenv("ANTHROPIC_API_KEY"):
                _vision_service = VisionService(provider="anthropic")
            else:
                logger.info("No vision API keys found. Vision analysis will be skipped.")
        except Exception as e:
            logger.warning(f"Failed to initialize vision service: {e}")
    return _vision_service

@router.post("/upload-audio")
async def upload_audio(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Upload and process audio file for STT and emotion analysis
    Uses Whisper for speech-to-text transcription
    
    Returns:
        Dict with STT text and emotion analysis results
    """
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('audio/'):
            raise HTTPException(status_code=400, detail="File must be an audio file")
        
        # Read file bytes
        audio_bytes = await file.read()
        
        logger.info(f"Processing audio file: {file.filename} ({len(audio_bytes)} bytes)")
        
        # Process with STT (now using Whisper)
        stt_result = await transcribe(audio_bytes)
        
        # Process with emotion analysis (if available)
        emotion_result = await predict_emotion_from_wav(audio_bytes)
        
        return {
            "filename": file.filename,
            "stt": stt_result,
            "emotion": emotion_result,
            "status": "success"
        }
        
    except Exception as e:
        logger.error(f"Error processing audio: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error processing audio: {str(e)}")

@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Upload and process image file for OCR and vision analysis
    Uses Tesseract OCR for text extraction and optional vision models for understanding
    
    Returns:
        Dict with OCR text extraction and vision analysis results
    """
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image file")
        
        # Read file bytes
        image_bytes = await file.read()
        
        logger.info(f"Processing image file: {file.filename} ({len(image_bytes)} bytes)")
        
        # Process with OCR (now using Tesseract)
        ocr_result = await run_ocr(image_bytes)
        
        # Optional: Process with vision model (if available)
        vision_result = None
        vision_service = get_vision_service()
        if vision_service:
            try:
                vision_result = vision_service.describe_image(image_bytes)
            except Exception as e:
                logger.warning(f"Vision analysis failed: {e}")
        
        response = {
            "filename": file.filename,
            "ocr": ocr_result,
            "status": "success"
        }
        
        if vision_result:
            response["vision"] = vision_result
        
        return response
        
    except Exception as e:
        logger.error(f"Error processing image: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")