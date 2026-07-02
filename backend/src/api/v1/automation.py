from fastapi import APIRouter
from pydantic import BaseModel
from backend.src.services.automation import automation_service

router = APIRouter(tags=["automation"])


class TestAutomationResponse(BaseModel):
    success: bool
    stream_started: bool
    viewer_milestone: bool
    stream_ended: bool
    daily_digest: bool


@router.post("/test", response_model=TestAutomationResponse)
async def test_automation():
    """
    Test endpoint to verify connectivity for all four n8n automation webhooks.
    Triggers each workflow and reports individual success/failure.
    Never raises an exception — failures are surfaced as False values.
    """
    r_started = await automation_service.trigger_stream_started(
        stream_id="test-stream-123",
        creator_id="test-creator-456",
        creator_name="Test Creator",
        title="Test Connectivity Stream",
        category="Testing",
        started_at="2026-07-02T10:00:00Z"
    )

    r_milestone = await automation_service.trigger_viewer_milestone(
        stream_id="test-stream-123",
        creator_id="test-creator-456",
        creator_name="Test Creator",
        title="Test Connectivity Stream",
        viewer_count=50,
        milestone=50
    )

    r_ended = await automation_service.trigger_stream_ended(
        stream_id="test-stream-123",
        creator_id="test-creator-456",
        creator_name="Test Creator",
        title="Test Connectivity Stream",
        category="Testing",
        started_at="2026-07-02T10:00:00Z",
        ended_at="2026-07-02T11:35:00Z",
        duration_minutes=95,
        peak_viewers=72,
        total_messages=418,
        final_viewers=14
    )

    r_digest = await automation_service.trigger_daily_digest(
        date="2026-07-02",
        total_streams=15,
        top_stream_title="Test Connectivity Stream",
        top_stream_creator="Test Creator",
        top_stream_peak_viewers=72
    )

    return {
        "success": all([r_started, r_milestone, r_ended, r_digest]),
        "stream_started": r_started,
        "viewer_milestone": r_milestone,
        "stream_ended": r_ended,
        "daily_digest": r_digest,
    }
