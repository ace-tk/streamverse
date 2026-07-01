import uuid
from datetime import datetime
from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from backend.src.database.session import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    avatar: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    streams: Mapped[list["Stream"]] = relationship(back_populates="creator", cascade="all, delete-orphan")
    messages: Mapped[list["Message"]] = relationship(back_populates="sender", cascade="all, delete-orphan")
    notifications: Mapped[list["Notification"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    
    # Self-referential Many-to-Many relationships via Follower table
    followers: Mapped[list["Follower"]] = relationship(
        foreign_keys="[Follower.creator_id]",
        back_populates="creator",
        cascade="all, delete-orphan"
    )
    following: Mapped[list["Follower"]] = relationship(
        foreign_keys="[Follower.follower_id]",
        back_populates="follower",
        cascade="all, delete-orphan"
    )
