import uuid
from typing import List
from fastapi import APIRouter, Depends, Query

from backend.src.schemas.message import ChatMessageResponse
from backend.src.services.chat import ChatService
from backend.src.dependencies.chat import get_chat_service

router = APIRouter()


@router.get(
    "/{stream_id}/messages",
    response_model=List[ChatMessageResponse],
    summary="Get chat messages for a stream",
)
async def get_stream_messages(
    stream_id: uuid.UUID,
    limit: int = Query(50, ge=1, le=200, description="Number of recent messages to retrieve"),
    chat_service: ChatService = Depends(get_chat_service),
):
    """
    Retrieves recent chat messages for a specific stream, ordered oldest to newest.
    New clients can call this endpoint to load chat history before joining the WebSocket.
    """
    return await chat_service.get_recent_messages(stream_id=stream_id, limit=limit)
