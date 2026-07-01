import uuid
from datetime import datetime
from sqlalchemy import DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from backend.src.database.session import Base

class Follower(Base):
    __tablename__ = "followers"

    # Composite primary key for the many-to-many relationship
    creator_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True, index=True)
    follower_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    creator: Mapped["User"] = relationship(foreign_keys=[creator_id], back_populates="followers")
    follower: Mapped["User"] = relationship(foreign_keys=[follower_id], back_populates="following")
