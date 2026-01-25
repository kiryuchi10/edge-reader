"""
Advanced RAG document retrieval service
Uses hybrid search (BM25 + vector) and re-ranking
"""
from typing import List, Dict, Any, Optional
import logging

from ..rag.hybrid_search import HybridSearch
from ..rag.reranker import Reranker

logger = logging.getLogger(__name__)

# Global services (singleton pattern)
_hybrid_search: Optional[HybridSearch] = None
_reranker: Optional[Reranker] = None

def get_services():
    """Get or create retrieval services"""
    global _hybrid_search, _reranker
    
    if _hybrid_search is None:
        from .rag_indexer_advanced import get_services as get_indexer_services
        _, _, _hybrid_search = get_indexer_services()
        if _hybrid_search is None:
            # Fallback: create new services
            from ..rag.vector_store import VectorStore
            from ..rag.embedding_service import EmbeddingService
            from ..rag.hybrid_search import HybridSearch
            vector_store = VectorStore()
            embedding_service = EmbeddingService()
            _hybrid_search = HybridSearch(vector_store, embedding_service)
    
    if _reranker is None:
        _reranker = Reranker(use_reranking=True)
    
    return _hybrid_search, _reranker

def retrieve(
    query: str, 
    top_k: int = 5,
    use_reranking: bool = True,
    vector_weight: float = 0.5
) -> List[Dict[str, Any]]:
    """
    Retrieve relevant document chunks using hybrid search and re-ranking
    
    Args:
        query: Search query
        top_k: Number of results to return
        use_reranking: Whether to use re-ranking
        vector_weight: Weight for vector search (0-1, rest is BM25)
        
    Returns:
        List of relevant chunks with scores and metadata
    """
    try:
        hybrid_search, reranker = get_services()
        
        if not hybrid_search:
            logger.warning("Hybrid search not initialized. Returning empty results.")
            return []
        
        # Perform hybrid search
        results = hybrid_search.search(
            query=query,
            n_results=top_k * 2,  # Get more results for reranking
            vector_weight=vector_weight
        )
        
        if not results:
            logger.info(f"No results found for query: {query}")
            return []
        
        # Re-rank results
        if use_reranking:
            results = reranker.rerank(query, results, top_k=top_k)
        else:
            results = results[:top_k]
        
        # Format results
        formatted_results = []
        for result in results:
            formatted_results.append({
                "text": result.get("text", ""),
                "path": result.get("metadata", {}).get("doc_path", ""),
                "filename": result.get("metadata", {}).get("doc_filename", ""),
                "score": result.get("score", 0.0),
                "vector_score": result.get("vector_score", 0.0),
                "bm25_score": result.get("bm25_score", 0.0),
                "rerank_score": result.get("rerank_score"),
                "chunk_index": result.get("metadata", {}).get("chunk_index", 0),
                "doc_id": result.get("id", "")
            })
        
        logger.info(f"Retrieved {len(formatted_results)} results for query: {query}")
        return formatted_results
        
    except Exception as e:
        logger.error(f"Error in retrieval: {e}", exc_info=True)
        return []

def get_index_stats() -> Dict[str, Any]:
    """
    Get statistics about the index
    
    Returns:
        Index statistics
    """
    try:
        from .rag_indexer_advanced import get_services
        vector_store, _, _ = get_services()
        
        if not vector_store:
            return {"status": "not_initialized"}
        
        count = vector_store.get_collection_count()
        
        return {
            "status": "loaded" if count > 0 else "empty",
            "total_chunks": count,
            "vector_store": "chromadb"
        }
    except Exception as e:
        logger.error(f"Error getting index stats: {e}")
        return {"status": "error", "message": str(e)}
