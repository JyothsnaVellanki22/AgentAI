from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import desc

from app.api import deps
from app.db.models import User, Conversation, Message
from app.schemas import chat as chat_schema

router = APIRouter()

@router.post("/conversations", response_model=chat_schema.Conversation)
def create_conversation(
    *,
    db: Session = Depends(deps.get_db),
    conversation_in: chat_schema.ConversationCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create a new conversation.
    """
    conversation = Conversation(
        title=conversation_in.title or "New Chat",
        user_id=current_user.id
    )
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation

@router.get("/conversations", response_model=List[chat_schema.Conversation])
def get_conversations(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve conversations for current user.
    """
    conversations = db.query(Conversation)\
        .filter(Conversation.user_id == current_user.id)\
        .order_by(Conversation.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    return conversations

@router.get("/conversations/{conversation_id}", response_model=chat_schema.Conversation)
def get_conversation(
    conversation_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get a specific conversation by ID.
    """
    conversation = db.query(Conversation)\
        .options(selectinload(Conversation.messages))\
        .filter(Conversation.id == conversation_id, Conversation.user_id == current_user.id)\
        .first()
        
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation

@router.post("/conversations/{conversation_id}/messages", response_model=chat_schema.Message)
async def create_message(
    conversation_id: int,
    message_in: chat_schema.MessageCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create a new message in a conversation.
    """
    # Check if conversation exists and belongs to user
    conversation = db.query(Conversation)\
        .filter(Conversation.id == conversation_id, Conversation.user_id == current_user.id)\
        .first()
        
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    message = Message(
        conversation_id=conversation_id,
        role=message_in.role,
        content=message_in.content
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    
    # Generate AI Response
    from app.services import rag_service
    
    try:
        print(f"DEBUG: Processing message: {message_in.content}")
        
        # Retireve context
        print("DEBUG: Retrieving context...")
        context_docs = await rag_service.retrieve_context(message_in.content)
        print(f"DEBUG: Retrieved {len(context_docs)} context documents")
        
        # Generate answer
        print("DEBUG: Generating response with OpenAI...")
        ai_response_content = await rag_service.generate_response(message_in.content, context_docs)
        print("DEBUG: Response generated successfully")
        
    except Exception as e:
        print(f"ERROR: RAG/OpenAI failed: {e}")
        # Build a fallback error message so UI doesn't hang
        ai_response_content = f"Sorry, I encountered an error: {str(e)}"

    ai_message = Message(
        conversation_id=conversation_id,
        role="assistant",
        content=ai_response_content
    )
    db.add(ai_message)
    db.commit()
    db.refresh(ai_message)
    
    return ai_message
