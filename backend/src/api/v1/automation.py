from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.src.services.automation import automation_service

router = APIRouter(tags=["automation"])

class TestAutomationResponse(BaseModel):
    success: bool

@router.post("/test", response_model=TestAutomationResponse)
async def test_automation():
    """
    Test endpoint to verify connectivity between FastAPI backend and n8n webhook.
    """
    success = await automation_service.trigger_stream_started(
        stream_id="test-stream-123",
        creator_id="test-creator-456",
        creator_name="Test Creator",
        title="Test Connectivity Stream",
        category="Testing",
        started_at="2026-07-02T10:00:00Z"
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to trigger automation webhook")
        
    return {"success": True}
