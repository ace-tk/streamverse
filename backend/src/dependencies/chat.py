from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.src.database.session import get_db
from backend.src.services.chat import ChatService


def get_chat_service(db: AsyncSession = Depends(get_db)) -> ChatService:
    """Dependency to provide the ChatService"""
    return ChatService(db)
