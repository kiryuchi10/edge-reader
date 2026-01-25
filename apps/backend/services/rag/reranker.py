"""
Re-ranking service for search results
Uses cross-encoder models for better relevance scoring
"""
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class Reranker:
    """Re-rank search results using cross-encoder models"""
    
    _model_cache = {}  # Cache loaded models
    
    def __init__(
        self,
        model_name: str = "cross-encoder/ms-marco-MiniLM-L-6-v2",
        use_reranking: bool = True
    ):
        """
        Initialize reranker
        
        Args:
            model_name: Cross-encoder model name
            use_reranking: Whether to actually use reranking (can disable for testing)
        """
        self.model_name = model_name
        self.use_reranking = use_reranking
        self.model = None
        
        if use_reranking:
            try:
                from sentence_transformers import CrossEncoder
                
                if model_name not in self._model_cache:
                    logger.info(f"Loading reranker model: {model_name}")
                    self.model = CrossEncoder(model_name)
                    self._model_cache[model_name] = self.model
                    logger.info(f"Reranker model {model_name} loaded")
                else:
                    self.model = self._model_cache[model_name]
                    logger.info(f"Using cached reranker model: {model_name}")
            except ImportError:
                logger.warning("sentence-transformers not installed. Reranking disabled.")
                self.use_reranking = False
            except Exception as e:
                logger.warning(f"Failed to load reranker: {e}. Reranking disabled.")
                self.use_reranking = False
    
    def rerank(
        self,
        query: str,
        results: List[Dict[str, Any]],
        top_k: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Re-rank search results
        
        Args:
            query: Search query
            results: List of search results with 'text' field
            top_k: Number of top results to return (None = all)
        
        Returns:
            Re-ranked results with updated scores
        """
        if not self.use_reranking or not self.model:
            # Return original results if reranking disabled
            return results[:top_k] if top_k else results
        
        if not results:
            return []
        
        try:
            # Prepare query-document pairs
            pairs = [(query, result.get("text", "")) for result in results]
            
            # Get reranking scores
            scores = self.model.predict(pairs)
            
            # Update scores in results
            reranked = []
            for i, result in enumerate(results):
                new_result = result.copy()
                new_result["rerank_score"] = float(scores[i])
                new_result["original_score"] = result.get("score", 0.0)
                # Use rerank score as primary score
                new_result["score"] = float(scores[i])
                reranked.append(new_result)
            
            # Sort by rerank score
            reranked.sort(key=lambda x: x["rerank_score"], reverse=True)
            
            return reranked[:top_k] if top_k else reranked
            
        except Exception as e:
            logger.error(f"Reranking failed: {e}", exc_info=True)
            # Return original results on error
            return results[:top_k] if top_k else results
