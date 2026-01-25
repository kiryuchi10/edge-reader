"""
Advanced RAG document indexing service
Uses vector embeddings and vector database
"""
import os
import json
from typing import List, Dict, Any, Optional
from pathlib import Path
import logging

from ..rag.vector_store import VectorStore
from ..rag.embedding_service import EmbeddingService
from ..rag.hybrid_search import HybridSearch

logger = logging.getLogger(__name__)

# Global services (singleton pattern)
_vector_store: Optional[VectorStore] = None
_embedding_service: Optional[EmbeddingService] = None
_hybrid_search: Optional[HybridSearch] = None

def get_services():
    """Get or create RAG services"""
    global _vector_store, _embedding_service, _hybrid_search
    
    if _vector_store is None:
        _vector_store = VectorStore(collection_name="documents")
    
    if _embedding_service is None:
        _embedding_service = EmbeddingService(provider="local", model_name="all-MiniLM-L6-v2")
    
    if _hybrid_search is None:
        _hybrid_search = HybridSearch(_vector_store, _embedding_service, alpha=0.5)
    
    return _vector_store, _embedding_service, _hybrid_search

def enumerate_pdfs(root_dir: str) -> List[str]:
    """
    Recursively find all PDF files in directory
    
    Args:
        root_dir: Root directory to search
        
    Returns:
        List of PDF file paths
    """
    pdf_files = []
    try:
        root_path = Path(root_dir)
        if root_path.exists():
            pdf_files = list(root_path.rglob("*.pdf"))
            pdf_files = [str(p) for p in pdf_files]
    except Exception as e:
        logger.error(f"Error enumerating PDFs: {e}")
    
    return pdf_files

def pdf_to_text(pdf_path: str) -> str:
    """
    Extract text from PDF file
    
    Args:
        pdf_path: Path to PDF file
        
    Returns:
        Extracted text content
    """
    try:
        # Try pypdf first
        try:
            from pypdf import PdfReader
            reader = PdfReader(pdf_path)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text
        except ImportError:
            logger.warning("pypdf not installed. Install with: pip install pypdf")
        
        # Fallback: dummy implementation
        filename = os.path.basename(pdf_path)
        logger.warning(f"Using dummy PDF extraction for {filename}. Install pypdf for real extraction.")
        return f"This is dummy text content extracted from {filename}. In production, install pypdf for real PDF extraction."
    except Exception as e:
        logger.error(f"Error extracting text from {pdf_path}: {e}")
        return f"Error extracting text: {str(e)}"

def chunk_text(text: str, chunk_size: int = 500, chunk_overlap: int = 50) -> List[str]:
    """
    Split text into overlapping chunks
    
    Args:
        text: Input text to chunk
        chunk_size: Maximum characters per chunk
        chunk_overlap: Overlap between chunks
        
    Returns:
        List of text chunks
    """
    if not text:
        return []
    
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        chunk_text = text[start:end]
        chunks.append(chunk_text.strip())
        
        # Move start position with overlap
        start = end - chunk_overlap
    
    return chunks

def build_index(papers_root: str, reset: bool = False) -> Dict[str, Any]:
    """
    Build advanced document index with embeddings and vector store
    
    Args:
        papers_root: Root directory containing PDF files
        reset: Whether to reset existing index
        
    Returns:
        Index metadata and statistics
    """
    try:
        vector_store, embedding_service, hybrid_search = get_services()
        
        # Reset if requested
        if reset:
            vector_store.reset_collection()
            logger.info("Vector store reset")
        
        # Find all PDFs
        pdf_files = enumerate_pdfs(papers_root)
        logger.info(f"Found {len(pdf_files)} PDF files")
        
        if not pdf_files:
            return {
                "status": "no_documents",
                "total_pdfs": 0,
                "total_chunks": 0,
                "message": f"No PDF files found in {papers_root}"
            }
        
        # Process documents
        all_texts = []
        all_metadatas = []
        all_ids = []
        
        for pdf_path in pdf_files:
            try:
                # Extract text
                text = pdf_to_text(pdf_path)
                
                # Create chunks
                text_chunks = chunk_text(text, chunk_size=500, chunk_overlap=50)
                
                # Create metadata for each chunk
                for i, chunk_text in enumerate(text_chunks):
                    chunk_id = f"{os.path.basename(pdf_path)}_chunk_{i}"
                    all_texts.append(chunk_text)
                    all_metadatas.append({
                        "doc_path": pdf_path,
                        "doc_filename": os.path.basename(pdf_path),
                        "chunk_index": i,
                        "total_chunks": len(text_chunks)
                    })
                    all_ids.append(chunk_id)
                
                logger.info(f"Processed {pdf_path}: {len(text_chunks)} chunks")
                
            except Exception as e:
                logger.error(f"Error processing {pdf_path}: {e}")
        
        if not all_texts:
            return {
                "status": "error",
                "message": "No text extracted from PDFs"
            }
        
        # Generate embeddings
        logger.info(f"Generating embeddings for {len(all_texts)} chunks...")
        embeddings = embedding_service.embed(all_texts, batch_size=32)
        
        # Add to vector store
        logger.info("Adding documents to vector store...")
        vector_store.add_documents(
            texts=all_texts,
            embeddings=embeddings,
            metadatas=all_metadatas,
            ids=all_ids
        )
        
        # Build BM25 index for hybrid search
        hybrid_search.build_bm25_index(all_texts)
        hybrid_search.documents = all_texts
        hybrid_search.metadatas = all_metadatas
        hybrid_search.ids = all_ids
        
        logger.info(f"Index built successfully: {len(all_texts)} chunks from {len(pdf_files)} documents")
        
        return {
            "status": "success",
            "total_pdfs": len(pdf_files),
            "total_chunks": len(all_texts),
            "papers_root": papers_root,
            "vector_store_count": vector_store.get_collection_count()
        }
        
    except Exception as e:
        logger.error(f"Error building index: {e}", exc_info=True)
        return {
            "status": "error",
            "message": str(e)
        }
