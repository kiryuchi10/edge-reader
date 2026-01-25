"""
RAG document retrieval service
"""
import json
from typing import List, Dict, Any, Optional

# Global index cache
_index_cache: Optional[Dict[str, Any]] = None

def load_index(index_data: Dict[str, Any]) -> None:
    """
    Load index into memory cache
    
    Args:
        index_data: Document index data
    """
    global _index_cache
    _index_cache = index_data

def retrieve(query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Retrieve relevant document chunks for query
    
    Args:
        query: Search query
        top_k: Number of top results to return
        
    Returns:
        List of relevant chunks with metadata
    """
    global _index_cache
    
    if not _index_cache or not _index_cache.get("chunks"):
        return []
    
    try:
        # Simple string similarity search (replace with vector similarity in production)
        query_lower = query.lower()
        scored_chunks = []
        
        for chunk in _index_cache["chunks"]:
            chunk_text = chunk.get("text", "").lower()
            
            # Simple scoring based on keyword overlap
            score = 0.0
            query_words = set(query_lower.split())
            chunk_words = set(chunk_text.split())
            
            if query_words and chunk_words:
                overlap = len(query_words.intersection(chunk_words))
                score = overlap / len(query_words)
            
            if score > 0:
                scored_chunks.append({
                    "chunk": chunk,
                    "score": score
                })
        
        # Sort by score and return top_k
        scored_chunks.sort(key=lambda x: x["score"], reverse=True)
        
        results = []
        for item in scored_chunks[:top_k]:
            chunk = item["chunk"]
            results.append({
                "text": chunk["text"],
                "path": chunk["path"],
                "score": item["score"],
                "doc_id": chunk["doc_id"],
                "chunk_id": chunk["id"]
            })
        
        return results
        
    except Exception as e:
        print(f"Error in retrieval: {e}")
        return []

def get_index_stats() -> Dict[str, Any]:
    """
    Get statistics about the loaded index
    
    Returns:
        Index statistics
    """
    global _index_cache
    
    if not _index_cache:
        return {"status": "no_index_loaded"}
    
    return {
        "status": "loaded",
        "total_documents": len(_index_cache.get("documents", [])),
        "total_chunks": len(_index_cache.get("chunks", [])),
        "metadata": _index_cache.get("metadata", {})
    }