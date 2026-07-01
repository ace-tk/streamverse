import uuid
from typing import Optional
from enum import Enum
from fastapi import APIRouter, Depends, Query, status

from backend.src.schemas.stream import (
    StreamCreateRequest, 
    StreamResponse, 
    StreamDetailResponse, 
    PaginatedStreamResponse
)
from backend.src.models.stream import StreamStatus


class SortBy(str, Enum):
    newest = "newest"
    oldest = "oldest"
    viewers = "viewers"
from backend.src.models.user import User
from backend.src.services.stream import StreamService
from backend.src.dependencies.auth import get_current_user
from backend.src.dependencies.stream import get_stream_service

router = APIRouter()

@router.post(
    "",
    response_model=StreamResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new live stream"
)
async def create_stream(
    stream_data: StreamCreateRequest,
    current_user: User = Depends(get_current_user),
    stream_service: StreamService = Depends(get_stream_service)
):
    """
    Creates a new stream for the authenticated user and sets its status to LIVE.
    Prevents a user from having more than one active LIVE stream at a time.
    """
    return await stream_service.create_stream(creator_id=current_user.id, stream_data=stream_data)

@router.patch(
    "/{stream_id}/end",
    response_model=StreamResponse,
    summary="End an active live stream"
)
async def end_stream(
    stream_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    stream_service: StreamService = Depends(get_stream_service)
):
    """
    Ends a currently LIVE stream. Only the creator of the stream can end it.
    Updates the status to ENDED and sets the ended_at timestamp.
    """
    result = await stream_service.end_stream(stream_id=stream_id, user_id=current_user.id)
    
    # Close all associated websocket connections
    from backend.src.websocket.manager import manager
    await manager.close_stream(str(stream_id))
    
    return result

@router.get(
    "",
    response_model=PaginatedStreamResponse,
    summary="Discover streams with filtering and sorting"
)
async def list_live_streams(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Number of items per page"),
    category: Optional[str] = Query(None, description="Filter by category"),
    status: Optional[StreamStatus] = Query(None, description="Filter by status: LIVE or ENDED. Defaults to LIVE."),
    search: Optional[str] = Query(None, description="Case-insensitive partial match on stream title"),
    sort_by: SortBy = Query(SortBy.newest, description="Sort order: newest, oldest, or viewers"),
    stream_service: StreamService = Depends(get_stream_service)
):
    """
    Returns a paginated list of streams with optional filtering by status, category,
    and title search. Supports sorting by newest, oldest, or viewer count.
    Defaults to LIVE streams ordered newest first.
    """
    streams, total = await stream_service.list_live_streams(
        page=page,
        size=size,
        category=category,
        status=status,
        search=search,
        sort_by=sort_by.value,
    )
    return PaginatedStreamResponse(
        items=streams,
        total=total,
        page=page,
        size=size
    )

@router.get(
    "/{stream_id}",
    response_model=StreamDetailResponse,
    summary="Get details of a specific stream"
)
async def get_stream_details(
    stream_id: uuid.UUID,
    stream_service: StreamService = Depends(get_stream_service)
):
    """
    Retrieves detailed information about a specific stream, including creator details 
    and placeholder metrics like follower_count.
    """
    return await stream_service.get_stream_details(stream_id=stream_id)
