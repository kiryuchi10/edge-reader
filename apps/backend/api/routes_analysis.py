"""
Text analysis endpoints
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

from ..services.core.text_nlp import analyze_text

router = APIRouter()

class TextAnalysisRequest(BaseModel):
    text: str

@router.post("/text")
async def analyze_text_endpoint(request: TextAnalysisRequest) -> Dict[str, Any]:
    """
    Analyze text for NLP insights
    
    Args:
        request: Text analysis request with text field
        
    Returns:
        Dict with NLP analysis results (intent, sentiment, entities, topics)
    """
    try:
        if not request.text or len(request.text.strip()) == 0:
            raise HTTPException(status_code=400, detail="Text field cannot be empty")
        
        # Process with NLP analysis
        analysis_result = await analyze_text(request.text)
        
        return {
            "text": request.text,
            "analysis": analysis_result,
            "status": "success"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing text: {str(e)}")