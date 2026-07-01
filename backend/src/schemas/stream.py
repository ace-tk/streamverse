from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional
from backend.src.models.stream import StreamStatus

class StreamBase(BaseModel):
    title: str
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    category: Optional[str] = None

class StreamCreate(StreamBase):
    creator_id: UUID

class StreamResponse(StreamBase):
    id: UUID
    creator_id: UUID
    status: StreamStatus
    viewer_count: int
    started_at: datetime
    ended_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
