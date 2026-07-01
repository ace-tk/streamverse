from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional

class MessageBase(BaseModel):
    message: str

class MessageCreate(MessageBase):
    stream_id: UUID
    sender_id: Optional[UUID] = None
    sender_name: str = "Anonymous"

class ChatMessageResponse(BaseModel):
    id: UUID
    sender_name: str
    message: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class MessageResponse(MessageBase):
    id: UUID
    stream_id: UUID
    sender_id: Optional[UUID] = None
    sender_name: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
