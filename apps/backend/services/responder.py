"""
Response generation service
Uses DeepSeek API when configured, falls back to dummy responses otherwise
"""
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)

async def draft_reply(query: str, evidences: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Generate response based on query and retrieved evidence
    Uses DeepSeek API if configured, otherwise uses dummy responses
    
    Args:
        query: User query
        evidences: List of retrieved document chunks
        
    Returns:
        Dict with generated answer
    """
    try:
        # Try to use DeepSeek API if configured
        try:
            from .ai.deepseek_service import get_deepseek_service
            
            deepseek = get_deepseek_service()
            
            if deepseek.is_configured():
                # Build context from evidences
                if evidences:
                    context_parts = []
                    for i, ev in enumerate(evidences[:5], 1):  # Use top 5 evidences
                        context_parts.append(
                            f"[Document {i}]\n"
                            f"Source: {ev.get('filename', ev.get('path', 'Unknown'))}\n"
                            f"Content: {ev.get('text', '')[:500]}\n"
                        )
                    context = "\n\n".join(context_parts)
                else:
                    context = None
                
                # Generate response using DeepSeek
                system_prompt = (
                    "You are a helpful AI assistant that answers questions based on provided documents. "
                    "Use the context from the documents to provide accurate and relevant answers. "
                    "Cite specific documents when possible. "
                    "If the context doesn't contain enough information to answer the question, "
                    "say so clearly."
                )
                
                answer = await deepseek.generate_response(
                    query=query,
                    context=context,
                    system_prompt=system_prompt
                )
                
                return {
                    "answer": answer,
                    "evidence_count": len(evidences),
                    "confidence": 0.9 if evidences else 0.5,
                    "provider": "deepseek"
                }
            else:
                # DeepSeek not configured, use dummy response
                logger.warning("DeepSeek API not configured. Using dummy response.")
                return _generate_dummy_response(query, evidences)
                
        except ImportError:
            # DeepSeek service not available
            logger.warning("DeepSeek service not available. Using dummy response.")
            return _generate_dummy_response(query, evidences)
        except Exception as e:
            # DeepSeek API error, fall back to dummy
            logger.error(f"DeepSeek API error: {e}. Falling back to dummy response.")
            return _generate_dummy_response(query, evidences)
        
    except Exception as e:
        logger.error(f"Error generating response: {e}", exc_info=True)
        return {
            "answer": f"Error generating response: {str(e)}",
            "evidence_count": 0,
            "confidence": 0.0,
            "provider": "error"
        }


def _generate_dummy_response(query: str, evidences: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Generate dummy response when DeepSeek API is not available
    
    Args:
        query: User query
        evidences: List of retrieved document chunks
        
    Returns:
        Dict with dummy answer
    """
    if not evidences:
        answer = (
            f"I couldn't find specific information about '{query}' in the available documents. "
            f"To enable AI-powered responses, please configure DEEPSEEK_API_KEY in your .env file. "
            f"See docs/DEEPSEEK_API_SETUP.md for instructions."
        )
    else:
        evidence_count = len(evidences)
        top_score = evidences[0]["score"] if evidences else 0.0
        
        answer = (
            f"Based on {evidence_count} relevant document(s) found (top relevance: {top_score:.2f}), "
            f"here's what I found about '{query}': "
            f"This is a dummy response. To get AI-generated answers, please configure DEEPSEEK_API_KEY. "
            f"See docs/DEEPSEEK_API_SETUP.md for setup instructions.\n\n"
            f"Found documents:\n"
        )
        for i, ev in enumerate(evidences[:3], 1):
            answer += f"{i}. {ev.get('filename', ev.get('path', 'Unknown'))}\n"
    
    return {
        "answer": answer,
        "evidence_count": len(evidences),
        "confidence": 0.85 if evidences else 0.3,
        "provider": "dummy"
    }