from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime

class MessageBase(BaseModel):
    message: str

class MessageCreate(MessageBase):
    stream_id: UUID
    sender_id: UUID

class MessageResponse(MessageBase):
    id: UUID
    stream_id: UUID
    sender_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
