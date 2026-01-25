"""
OCR service for image text extraction
Uses Tesseract OCR for text recognition
"""
from PIL import Image
import pytesseract
from typing import Dict, Any, List, Optional
import logging
import io

logger = logging.getLogger(__name__)

class OCRService:
    """Image text extraction using Tesseract OCR"""
    
    def __init__(self, tesseract_cmd: Optional[str] = None, lang: str = "eng"):
        """
        Initialize OCR service
        
        Args:
            tesseract_cmd: Path to tesseract executable (if not in PATH)
            lang: Language code (e.g., 'eng', 'kor', 'eng+kor' for multiple)
        """
        if tesseract_cmd:
            pytesseract.pytesseract.tesseract_cmd = tesseract_cmd
        self.lang = lang
        logger.info(f"OCR service initialized with language: {lang}")
    
    def extract_text(
        self, 
        image_bytes: bytes,
        lang: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Extract text from image bytes
        
        Args:
            image_bytes: Image file bytes
            lang: Language code (overrides default if provided)
        
        Returns:
            Dict with text, confidence, bounding boxes, word count
        """
        try:
            # Use provided language or default
            ocr_lang = lang or self.lang
            
            # Load image from bytes
            image = Image.open(io.BytesIO(image_bytes))
            
            logger.info(f"Running OCR on image: {image.size[0]}x{image.size[1]} pixels, lang: {ocr_lang}")
            
            # Get detailed data with bounding boxes
            data = pytesseract.image_to_data(
                image,
                lang=ocr_lang,
                output_type=pytesseract.Output.DICT
            )
            
            # Extract full text
            text = pytesseract.image_to_string(image, lang=ocr_lang)
            
            # Calculate average confidence
            confidences = [int(conf) for conf in data['conf'] if int(conf) > 0]
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
            
            # Extract bounding boxes for words
            boxes = self._extract_boxes(data)
            
            # Count words
            words = [w for w in data['text'] if w.strip()]
            word_count = len(words)
            
            response = {
                "text": text.strip(),
                "confidence": round(avg_confidence / 100.0, 3),  # Normalize to 0-1
                "language": ocr_lang,
                "word_count": word_count,
                "boxes": boxes,
            }
            
            logger.info(f"OCR complete: {word_count} words, confidence: {response['confidence']:.2f}")
            return response
            
        except Exception as e:
            logger.error(f"OCR extraction failed: {e}", exc_info=True)
            return {
                "text": "",
                "confidence": 0.0,
                "language": lang or self.lang,
                "word_count": 0,
                "boxes": [],
                "error": str(e)
            }
    
    def _extract_boxes(self, data: Dict) -> List[Dict[str, Any]]:
        """Extract bounding boxes for detected words"""
        boxes = []
        n_boxes = len(data['text'])
        
        for i in range(n_boxes):
            conf = int(data['conf'][i])
            text = data['text'][i].strip()
            
            # Only include boxes with text and confidence > 0
            if conf > 0 and text:
                boxes.append({
                    "text": text,
                    "left": int(data['left'][i]),
                    "top": int(data['top'][i]),
                    "width": int(data['width'][i]),
                    "height": int(data['height'][i]),
                    "confidence": round(conf / 100.0, 3),  # Normalize to 0-1
                    "level": int(data['level'][i]),  # 5 = word level
                })
        
        return boxes
