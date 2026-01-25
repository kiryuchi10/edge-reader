"""
Hybrid search combining BM25 (keyword) and vector (semantic) search
"""
from typing import List, Dict, Any, Optional
import logging
from rank_bm25 import BM25Okapi
import numpy as np

from .vector_store import VectorStore
from .embedding_service import EmbeddingService

logger = logging.getLogger(__name__)

class HybridSearch:
    """Hybrid search combining BM25 and vector search"""
    
    def __init__(
        self,
        vector_store: VectorStore,
        embedding_service: EmbeddingService,
        alpha: float = 0.5
    ):
        """
        Initialize hybrid search
        
        Args:
            vector_store: Vector store instance
            embedding_service: Embedding service instance
            alpha: Weight for vector search (1-alpha for BM25). 0.5 = equal weight
        """
        self.vector_store = vector_store
        self.embedding_service = embedding_service
        self.alpha = alpha  # Vector search weight
        self.bm25_index: Optional[BM25Okapi] = None
        self.documents: List[str] = []
        self.metadatas: List[Dict[str, Any]] = []
        self.ids: List[str] = []
        
        logger.info(f"Hybrid search initialized (alpha={alpha})")
    
    def build_bm25_index(self, documents: List[str]) -> None:
        """
        Build BM25 index from documents
        
        Args:
            documents: List of document texts
        """
        try:
            # Tokenize documents for BM25
            tokenized_docs = [doc.lower().split() for doc in documents]
            self.bm25_index = BM25Okapi(tokenized_docs)
            self.documents = documents
            logger.info(f"BM25 index built with {len(documents)} documents")
        except Exception as e:
            logger.error(f"Failed to build BM25 index: {e}", exc_info=True)
            self.bm25_index = None
    
    def search(
        self,
        query: str,
        n_results: int = 5,
        vector_weight: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        """
        Perform hybrid search
        
        Args:
            query: Search query
            n_results: Number of results to return
            vector_weight: Override default alpha for this search
        
        Returns:
            List of results with combined scores
        """
        alpha = vector_weight if vector_weight is not None else self.alpha
        
        results = []
        
        # 1. Vector search
        try:
            query_embedding = self.embedding_service.embed_query(query)
            vector_results = self.vector_store.search(query_embedding, n_results=n_results * 2)
            
            # Normalize vector scores (distance to similarity)
            vector_scores = {}
            if vector_results["distances"]:
                max_dist = max(vector_results["distances"]) if vector_results["distances"] else 1.0
                for i, (doc_id, distance) in enumerate(zip(vector_results["ids"], vector_results["distances"])):
                    # Convert distance to similarity (1 - normalized_distance)
                    similarity = 1.0 - (distance / max_dist) if max_dist > 0 else 1.0
                    vector_scores[doc_id] = {
                        "score": similarity,
                        "text": vector_results["documents"][i],
                        "metadata": vector_results["metadatas"][i],
                        "distance": distance
                    }
        except Exception as e:
            logger.warning(f"Vector search failed: {e}")
            vector_scores = {}
        
        # 2. BM25 search
        bm25_scores = {}
        try:
            if self.bm25_index and self.documents:
                tokenized_query = query.lower().split()
                bm25_scores_raw = self.bm25_index.get_scores(tokenized_query)
                
                # Normalize BM25 scores
                max_bm25 = max(bm25_scores_raw) if len(bm25_scores_raw) > 0 and max(bm25_scores_raw) > 0 else 1.0
                
                for i, score in enumerate(bm25_scores_raw):
                    if i < len(self.documents):
                        doc_id = self.ids[i] if i < len(self.ids) else f"doc_{i}"
                        normalized_score = score / max_bm25 if max_bm25 > 0 else 0.0
                        bm25_scores[doc_id] = {
                            "score": normalized_score,
                            "text": self.documents[i],
                            "metadata": self.metadatas[i] if i < len(self.metadatas) else {}
                        }
        except Exception as e:
            logger.warning(f"BM25 search failed: {e}")
            bm25_scores = {}
        
        # 3. Combine scores
        combined_scores = {}
        all_doc_ids = set(vector_scores.keys()) | set(bm25_scores.keys())
        
        for doc_id in all_doc_ids:
            vector_score = vector_scores.get(doc_id, {}).get("score", 0.0)
            bm25_score = bm25_scores.get(doc_id, {}).get("score", 0.0)
            
            # Weighted combination
            combined_score = alpha * vector_score + (1 - alpha) * bm25_score
            
            # Get text and metadata from either source
            text = vector_scores.get(doc_id, {}).get("text") or bm25_scores.get(doc_id, {}).get("text", "")
            metadata = vector_scores.get(doc_id, {}).get("metadata") or bm25_scores.get(doc_id, {}).get("metadata", {})
            
            combined_scores[doc_id] = {
                "id": doc_id,
                "text": text,
                "metadata": metadata,
                "score": combined_score,
                "vector_score": vector_score,
                "bm25_score": bm25_score
            }
        
        # 4. Sort and return top results
        sorted_results = sorted(
            combined_scores.values(),
            key=lambda x: x["score"],
            reverse=True
        )
        
        return sorted_results[:n_results]
