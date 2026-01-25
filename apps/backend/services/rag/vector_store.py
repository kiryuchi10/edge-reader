"""
Vector store service using ChromaDB
Manages document embeddings and vector similarity search
"""
import chromadb
from chromadb.config import Settings
from typing import List, Dict, Any, Optional
import logging
import os
from pathlib import Path

logger = logging.getLogger(__name__)

class VectorStore:
    """Vector database for document embeddings"""
    
    def __init__(
        self, 
        collection_name: str = "documents",
        persist_dir: Optional[str] = None
    ):
        """
        Initialize vector store
        
        Args:
            collection_name: Name of the collection
            persist_dir: Directory to persist data (None for in-memory)
        """
        self.collection_name = collection_name
        
        # Default persist directory
        if persist_dir is None:
            persist_dir = os.path.join(
                os.getenv("VECTOR_DB_DIR", "./vector_db"),
                collection_name
            )
        
        # Create persist directory if it doesn't exist
        Path(persist_dir).mkdir(parents=True, exist_ok=True)
        
        # Initialize ChromaDB client
        self.client = chromadb.PersistentClient(
            path=persist_dir,
            settings=Settings(
                anonymized_telemetry=False,
                allow_reset=True
            )
        )
        
        # Get or create collection
        self.collection = self.client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"}  # Use cosine similarity
        )
        
        logger.info(f"Vector store initialized: {collection_name} (persist_dir: {persist_dir})")
    
    def add_documents(
        self,
        texts: List[str],
        embeddings: List[List[float]],
        metadatas: List[Dict[str, Any]],
        ids: Optional[List[str]] = None
    ) -> None:
        """
        Add documents to vector store
        
        Args:
            texts: List of document texts
            embeddings: List of embedding vectors
            metadatas: List of metadata dicts
            ids: Optional list of IDs (auto-generated if None)
        """
        if ids is None:
            ids = [f"doc_{i}" for i in range(len(texts))]
        
        if not all(len(lst) == len(texts) for lst in [embeddings, metadatas, ids]):
            raise ValueError("All lists must have the same length")
        
        try:
            self.collection.add(
                embeddings=embeddings,
                documents=texts,
                metadatas=metadatas,
                ids=ids
            )
            logger.info(f"Added {len(texts)} documents to vector store")
        except Exception as e:
            logger.error(f"Failed to add documents: {e}", exc_info=True)
            raise
    
    def search(
        self,
        query_embedding: List[float],
        n_results: int = 5,
        where: Optional[Dict] = None,
        where_document: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Search similar documents using vector similarity
        
        Args:
            query_embedding: Query embedding vector
            n_results: Number of results to return
            where: Metadata filter
            where_document: Document content filter
        
        Returns:
            Dict with documents, metadatas, distances, and ids
        """
        try:
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=n_results,
                where=where,
                where_document=where_document
            )
            
            return {
                "documents": results["documents"][0] if results["documents"] else [],
                "metadatas": results["metadatas"][0] if results["metadatas"] else [],
                "distances": results["distances"][0] if results["distances"] else [],
                "ids": results["ids"][0] if results["ids"] else [],
            }
        except Exception as e:
            logger.error(f"Vector search failed: {e}", exc_info=True)
            return {
                "documents": [],
                "metadatas": [],
                "distances": [],
                "ids": [],
            }
    
    def get_collection_count(self) -> int:
        """Get number of documents in collection"""
        return self.collection.count()
    
    def delete_collection(self) -> None:
        """Delete the collection"""
        self.client.delete_collection(name=self.collection_name)
        logger.info(f"Deleted collection: {self.collection_name}")
    
    def reset_collection(self) -> None:
        """Reset collection (delete and recreate)"""
        self.delete_collection()
        self.collection = self.client.get_or_create_collection(
            name=self.collection_name,
            metadata={"hnsw:space": "cosine"}
        )
        logger.info(f"Reset collection: {self.collection_name}")
