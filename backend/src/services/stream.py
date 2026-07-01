import uuid
from typing import Optional, List, Tuple
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from sqlalchemy.orm import selectinload

from backend.src.models.stream import Stream, StreamStatus
from backend.src.models.user import User
from backend.src.schemas.stream import StreamCreateRequest, StreamResponse, StreamDetailResponse, StreamListResponse

class StreamService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_stream(self, creator_id: uuid.UUID, stream_data: StreamCreateRequest) -> StreamResponse:
        # Check if the creator already has a LIVE stream
        result = await self.db.execute(
            select(Stream).where(
                Stream.creator_id == creator_id,
                Stream.status == StreamStatus.LIVE
            )
        )
        existing_stream = result.scalars().first()
        if existing_stream:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You already have an active LIVE stream."
            )

        new_stream = Stream(
            creator_id=creator_id,
            title=stream_data.title,
            description=stream_data.description,
            thumbnail_url=stream_data.thumbnail_url,
            category=stream_data.category,
            status=StreamStatus.LIVE,
            viewer_count=0
        )
        self.db.add(new_stream)
        await self.db.commit()
        await self.db.refresh(new_stream)
        return new_stream

    async def end_stream(self, stream_id: uuid.UUID, user_id: uuid.UUID) -> StreamResponse:
        result = await self.db.execute(select(Stream).where(Stream.id == stream_id))
        stream = result.scalars().first()

        if not stream:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Stream not found."
            )

        if stream.creator_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to end this stream."
            )

        if stream.status == StreamStatus.ENDED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Stream is already ended."
            )

        stream.status = StreamStatus.ENDED
        stream.ended_at = func.now()
        stream.viewer_count = 0
        
        await self.db.commit()
        await self.db.refresh(stream)
        return stream

    async def get_stream_details(self, stream_id: uuid.UUID) -> StreamDetailResponse:
        result = await self.db.execute(
            select(Stream)
            .options(selectinload(Stream.creator))
            .where(Stream.id == stream_id)
        )
        stream = result.scalars().first()

        if not stream:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Stream not found."
            )

        return StreamDetailResponse(
            id=stream.id,
            creator_id=stream.creator_id,
            title=stream.title,
            description=stream.description,
            thumbnail_url=stream.thumbnail_url,
            category=stream.category,
            status=stream.status,
            viewer_count=stream.viewer_count,
            started_at=stream.started_at,
            ended_at=stream.ended_at,
            creator=stream.creator,
            follower_count=0 # Placeholder
        )

    async def list_live_streams(
        self, 
        page: int = 1, 
        size: int = 20, 
        category: Optional[str] = None,
        status: Optional[StreamStatus] = None,
        search: Optional[str] = None,
        sort_by: str = "newest"
    ) -> Tuple[List[StreamListResponse], int]:
        
        query = select(Stream).options(selectinload(Stream.creator))
        
        if status:
            query = query.where(Stream.status == status)
        else:
            # Preserve backward compatibility
            query = query.where(Stream.status == StreamStatus.LIVE)
            
        if category:
            query = query.where(Stream.category == category)
            
        if search:
            query = query.where(Stream.title.ilike(f"%{search}%"))

        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0

        # Pagination and ordering
        if sort_by == "oldest":
            query = query.order_by(Stream.started_at.asc())
        elif sort_by == "viewers":
            query = query.order_by(Stream.viewer_count.desc(), Stream.started_at.desc())
        else:
            # Default to newest
            query = query.order_by(Stream.started_at.desc())

        query = query.offset((page - 1) * size).limit(size)
        
        result = await self.db.execute(query)
        streams = result.scalars().all()
        
        return streams, total

    async def update_viewer_count(self, stream_id: uuid.UUID, viewer_count: int):
        result = await self.db.execute(select(Stream).where(Stream.id == stream_id))
        stream = result.scalars().first()
        if stream:
            stream.viewer_count = viewer_count
            await self.db.commit()
