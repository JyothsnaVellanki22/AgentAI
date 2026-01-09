from typing import Any
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.services import rag_service
from app.db.models import User, Document
from app.core import security

router = APIRouter()

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Upload a document for RAG ingestion.
    """
    if not file.filename.endswith(".txt") and not file.filename.endswith(".md"):
        raise HTTPException(status_code=400, detail="Only .txt and .md files supported for now")
    
    content = await file.read()
    content_str = content.decode("utf-8")
    
    # Save metadata to DB
    doc_db = Document(
        user_id=current_user.id,
        filename=file.filename,
        file_path="memory" # placeholder
    )
    db.add(doc_db)
    db.commit()
    
    # Ingest to Vector DB
    await rag_service.ingest_document(
        content=content_str,
        metadata={"filename": file.filename, "user_id": str(current_user.id)}
    )
    
    return {"message": "Document uploaded and ingested successfully"}
