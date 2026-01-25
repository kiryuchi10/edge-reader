"""
RAG document indexing service
"""
import os
import json
from typing import List, Dict, Any
from pathlib import Path

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
        print(f"Error enumerating PDFs: {e}")
    
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
        # Dummy implementation - replace with actual PDF parser (pypdf, pdfplumber, etc.)
        filename = os.path.basename(pdf_path)
        return f"This is dummy text content extracted from {filename}. In production, this would contain the actual PDF text content using libraries like pypdf or pdfplumber."
    except Exception as e:
        return f"Error extracting text from {pdf_path}: {str(e)}"

def chunk(text: str, chunk_size: int = 800) -> List[str]:
    """
    Split text into chunks
    
    Args:
        text: Input text to chunk
        chunk_size: Maximum characters per chunk
        
    Returns:
        List of text chunks
    """
    if not text:
        return []
    
    chunks = []
    for i in range(0, len(text), chunk_size):
        chunk_text = text[i:i + chunk_size]
        chunks.append(chunk_text)
    
    return chunks

def build_index(papers_root: str) -> Dict[str, Any]:
    """
    Build document index from PDF files
    
    Args:
        papers_root: Root directory containing PDF files
        
    Returns:
        Document index with chunks and metadata
    """
    try:
        # Find all PDFs
        pdf_files = enumerate_pdfs(papers_root)
        
        index = {
            "documents": [],
            "chunks": [],
            "metadata": {
                "total_pdfs": len(pdf_files),
                "total_chunks": 0,
                "papers_root": papers_root
            }
        }
        
        # Process each PDF
        for pdf_path in pdf_files:
            try:
                # Extract text
                text = pdf_to_text(pdf_path)
                
                # Create chunks
                text_chunks = chunk(text)
                
                # Add document
                doc_id = len(index["documents"])
                index["documents"].append({
                    "id": doc_id,
                    "path": pdf_path,
                    "filename": os.path.basename(pdf_path),
                    "text_length": len(text),
                    "chunk_count": len(text_chunks)
                })
                
                # Add chunks
                for i, chunk_text in enumerate(text_chunks):
                    index["chunks"].append({
                        "id": len(index["chunks"]),
                        "doc_id": doc_id,
                        "chunk_index": i,
                        "text": chunk_text,
                        "path": pdf_path
                    })
                
            except Exception as e:
                print(f"Error processing {pdf_path}: {e}")
        
        index["metadata"]["total_chunks"] = len(index["chunks"])
        
        return index
        
    except Exception as e:
        return {
            "documents": [],
            "chunks": [],
            "metadata": {"error": str(e)}
        }