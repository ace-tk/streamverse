from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.src.database.session import get_db
from backend.src.services.stream import StreamService

def get_stream_service(db: AsyncSession = Depends(get_db)) -> StreamService:
    """Dependency to provide the StreamService"""
    return StreamService(db)
