"""
Documents API Router
Handles document upload, processing, and retrieval
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.db import get_db
from app.schemas.document import (
    DocumentUploadResponse,
    DocumentResponse,
    PageDataResponse
)

router = APIRouter(prefix="/documents", tags=["documents"])

@router.post("/upload", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    project_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Upload a document (PDF, image, video) for processing
    
    Supported formats:
    - PDF documents
    - Images (JPG, PNG, TIFF)
    - Videos (MP4, AVI)
    """
    # TODO: Implement document upload logic
    # 1. Save file to storage (local/S3)
    # 2. Create Document record in DB
    # 3. Trigger OCR/processing job
    raise HTTPException(status_code=501, detail="Not implemented yet")

@router.get("", response_model=List[DocumentResponse])
async def list_documents(
    skip: int = 0,
    limit: int = 100,
    project_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """List all documents"""
    # TODO: Implement document listing
    return []

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: int,
    db: Session = Depends(get_db)
):
    """Get document details"""
    # TODO: Implement document retrieval
    raise HTTPException(status_code=404, detail="Document not found")

@router.get("/{document_id}/pages", response_model=List[PageDataResponse])
async def get_document_pages(
    document_id: int,
    db: Session = Depends(get_db)
):
    """Get all pages/frames from a document"""
    # TODO: Implement page/frame retrieval
    return []

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: int,
    db: Session = Depends(get_db)
):
    """Delete a document and its associated data"""
    # TODO: Implement document deletion
    raise HTTPException(status_code=501, detail="Not implemented yet")
