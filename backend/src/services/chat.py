import uuid
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from backend.src.models.message import Message


class ChatService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def save_message(
        self,
        stream_id: uuid.UUID,
        sender_name: str,
        message: str,
    ) -> Message:
        """Persist a chat message to the database."""
        new_message = Message(
            stream_id=stream_id,
            sender_name=sender_name,
            message=message,
        )
        self.db.add(new_message)
        await self.db.commit()
        await self.db.refresh(new_message)
        return new_message

    async def get_recent_messages(
        self,
        stream_id: uuid.UUID,
        limit: int = 50,
    ) -> List[Message]:
        """Retrieve the most recent messages for a stream, ordered oldest → newest."""
        result = await self.db.execute(
            select(Message)
            .where(Message.stream_id == stream_id)
            .order_by(Message.created_at.desc())
            .limit(limit)
        )
        messages = list(result.scalars().all())
        # Reverse so the response is oldest → newest
        messages.reverse()
        return messages
