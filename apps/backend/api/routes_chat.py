"""
RAG-based chat endpoints
Now using advanced RAG with vector search, hybrid search, and re-ranking
"""
import os
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import logging

from ..services.core.rag_indexer_advanced import build_index
from ..services.core.rag_retriever_advanced import retrieve, get_index_stats
from ..services.responder import draft_reply

logger = logging.getLogger(__name__)
router = APIRouter()

class ChatRequest(BaseModel):
    query: str
    top_k: Optional[int] = 5
    use_reranking: Optional[bool] = True
    vector_weight: Optional[float] = 0.5

def ensure_index(reset: bool = False) -> Dict[str, Any]:
    """
    Ensure document index is built and loaded
    
    Args:
        reset: Whether to reset existing index
    
    Returns:
        Index status information
    """
    try:
        # Check if index is already loaded
        stats = get_index_stats()
        if stats.get("status") == "loaded" and not reset:
            return stats
        
        # Build new index
        papers_root = os.getenv("PAPERS_ROOT", "./papers")
        
        if not os.path.exists(papers_root):
            return {
                "status": "error",
                "message": f"Papers directory not found: {papers_root}"
            }
        
        # Build index with embeddings
        index_result = build_index(papers_root, reset=reset)
        
        if index_result.get("status") == "success":
            return {
                "status": "built",
                "total_documents": index_result.get("total_pdfs", 0),
                "total_chunks": index_result.get("total_chunks", 0),
                "papers_root": papers_root,
                "vector_store_count": index_result.get("vector_store_count", 0)
            }
        else:
            return index_result
        
    except Exception as e:
        logger.error(f"Error ensuring index: {e}", exc_info=True)
        return {
            "status": "error",
            "message": str(e)
        }

@router.post("/")
async def chat(request: ChatRequest) -> Dict[str, Any]:
    """
    Advanced RAG-based chat endpoint
    Uses hybrid search (BM25 + vector) and re-ranking
    
    Args:
        request: Chat request with query and optional parameters
        
    Returns:
        Dict with answer, evidence sources, and search metadata
    """
    try:
        if not request.query or len(request.query.strip()) == 0:
            raise HTTPException(status_code=400, detail="Query cannot be empty")
        
        # Ensure index is loaded
        index_status = ensure_index()
        if index_status.get("status") == "error":
            raise HTTPException(status_code=500, detail=index_status.get("message"))
        
        if index_status.get("status") not in ["loaded", "built"]:
            raise HTTPException(
                status_code=500, 
                detail=f"Index not ready: {index_status.get('status')}"
            )
        
        # Retrieve relevant documents using advanced RAG
        top_k = request.top_k or 5
        evidences = retrieve(
            query=request.query,
            top_k=top_k,
            use_reranking=request.use_reranking if request.use_reranking is not None else True,
            vector_weight=request.vector_weight or 0.5
        )
        
        if not evidences:
            return {
                "query": request.query,
                "answer": "No relevant documents found for your query. Please try rephrasing or ensure documents are indexed.",
                "evidences": [],
                "index_status": index_status,
                "status": "no_results"
            }
        
        # Generate response
        response = await draft_reply(request.query, evidences)
        
        return {
            "query": request.query,
            "answer": response["answer"],
            "evidences": [
                {
                    "text": ev["text"][:300] + "..." if len(ev["text"]) > 300 else ev["text"],
                    "path": ev.get("path", ""),
                    "filename": ev.get("filename", ""),
                    "score": round(ev.get("score", 0.0), 4),
                    "vector_score": round(ev.get("vector_score", 0.0), 4),
                    "bm25_score": round(ev.get("bm25_score", 0.0), 4),
                    "rerank_score": round(ev.get("rerank_score", 0.0), 4) if ev.get("rerank_score") else None,
                }
                for ev in evidences
            ],
            "index_status": index_status,
            "search_metadata": {
                "total_results": len(evidences),
                "vector_weight": request.vector_weight or 0.5,
                "reranking_used": request.use_reranking if request.use_reranking is not None else True
            },
            "status": "success"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing chat request: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error processing chat request: {str(e)}")

@router.get("/index-status")
async def get_index_status() -> Dict[str, Any]:
    """
    Get current index status
    
    Returns:
        Index status and statistics
    """
    try:
        status = ensure_index()
        return status
    except Exception as e:
        logger.error(f"Error getting index status: {e}", exc_info=True)
        return {
            "status": "error",
            "message": str(e)
        }

@router.post("/rebuild-index")
async def rebuild_index(reset: bool = Query(False)) -> Dict[str, Any]:
    """
    Rebuild the document index
    
    Args:
        reset: Whether to reset existing index before rebuilding
    
    Returns:
        Index build status
    """
    try:
        status = ensure_index(reset=reset)
        return status
    except Exception as e:
        logger.error(f"Error rebuilding index: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error rebuilding index: {str(e)}")