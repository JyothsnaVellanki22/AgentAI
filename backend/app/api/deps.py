from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlalchemy.orm import Session
from app.core import security
from app.core.config import settings
from app.db.session import get_db
from app.db.models import User
from app.schemas import token

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/login/access-token",
    auto_error=False
)

def get_current_user(
    db: Session = Depends(get_db),
    token_str: str = Depends(reusable_oauth2)
) -> User:
    if token_str:
        try:
            payload = jwt.decode(
                token_str, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
            )
            token_data = token.TokenPayload(**payload)
            user = db.query(User).filter(User.id == int(token_data.sub)).first()
            if user:
                return user
        except (JWTError, ValidationError):
            # If token invalid, fall through to guest
            pass
    
    # Guest User Logic
    guest_email = "guest@chatbot.com"
    user = db.query(User).filter(User.email == guest_email).first()
    
    if not user:
        user = User(
            email=guest_email,
            hashed_password=security.get_password_hash("guest_password"),
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
    return user
