from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional, List
from backend.src.models.stream import StreamStatus
from backend.src.schemas.user import UserResponse

class StreamBase(BaseModel):
    title: str
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    category: Optional[str] = None

class StreamCreateRequest(StreamBase):
    pass

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

class StreamListResponse(StreamResponse):
    creator: UserResponse

class PaginatedStreamResponse(BaseModel):
    items: List[StreamListResponse]
    total: int
    page: int
    size: int

class StreamDetailResponse(StreamResponse):
    creator: UserResponse
    follower_count: int = 0
