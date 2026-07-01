from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime

class FollowerCreate(BaseModel):
    creator_id: UUID
    follower_id: UUID

class FollowerResponse(FollowerCreate):
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
