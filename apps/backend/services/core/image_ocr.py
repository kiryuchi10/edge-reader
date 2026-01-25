"""
Image OCR service using Tesseract
"""
from typing import Dict, Any
import logging
from ..ai import OCRService

logger = logging.getLogger(__name__)

# Initialize OCR service (singleton pattern)
_ocr_service = None

def get_ocr_service() -> OCRService:
    """Get or create OCR service instance"""
    global _ocr_service
    if _ocr_service is None:
        _ocr_service = OCRService(lang="eng")
    return _ocr_service

async def run_ocr(image_bytes: bytes) -> Dict[str, Any]:
    """
    Extract text from image bytes using Tesseract OCR
    
    Args:
        image_bytes: Image file bytes
        
    Returns:
        Dict with extracted text, bounding boxes, and confidence
    """
    try:
        ocr_service = get_ocr_service()
        result = ocr_service.extract_text(image_bytes)
        
        # Format to match expected response structure
        return {
            "text": result.get("text", ""),
            "boxes": [
                {
                    "text": box.get("text", ""),
                    "bbox": [
                        box.get("left", 0),
                        box.get("top", 0),
                        box.get("left", 0) + box.get("width", 0),
                        box.get("top", 0) + box.get("height", 0)
                    ],
                    "confidence": box.get("confidence", 0.0)
                }
                for box in result.get("boxes", [])
            ],
            "confidence": result.get("confidence", 0.0),
            "word_count": result.get("word_count", 0),
            "language": result.get("language", "eng"),
        }
        
    except Exception as e:
        logger.error(f"OCR extraction failed: {e}", exc_info=True)
        return {
            "text": f"Error processing image: {str(e)}",
            "boxes": [],
            "confidence": 0.0,
            "error": str(e)
        }