from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime

class NotificationBase(BaseModel):
    type: str
    title: str
    body: str

class NotificationCreate(NotificationBase):
    user_id: UUID

class NotificationResponse(NotificationBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
