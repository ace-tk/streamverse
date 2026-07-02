import httpx
import logging
from typing import Dict, Any
from backend.src.core.config import settings

logger = logging.getLogger(__name__)

class AutomationService:
    def __init__(self):
        self.enabled = settings.N8N_ENABLED
        self.base_url = settings.N8N_WEBHOOK_BASE_URL.rstrip('/')
        self.timeout = 5.0 # configurable timeout for webhook requests
        self.milestones_reached: Dict[str, set] = {}

    async def _trigger_webhook(self, endpoint: str, payload: Dict[str, Any]) -> bool:
        if not self.enabled:
            logger.info(f"Automation disabled. Skipping webhook for {endpoint}")
            return False
            
        url = f"{self.base_url}/{endpoint}"
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, json=payload)
                response.raise_for_status()
                logger.info(f"Successfully triggered automation webhook: {endpoint}")
                return True
        except httpx.HTTPStatusError as e:
            logger.error(f"Automation webhook failed with status {e.response.status_code}: {e.response.text}")
            return False
        except Exception as e:
            logger.error(f"Failed to trigger automation webhook {endpoint}: {str(e)}")
            return False

    async def trigger_stream_started(self, stream_id: str, creator_id: str, creator_name: str, title: str, category: str, started_at: str) -> bool:
        """Triggered automatically when a creator starts a stream."""
        payload = {
            "event": "stream_started",
            "stream_id": stream_id,
            "creator_id": creator_id,
            "creator_name": creator_name,
            "title": title,
            "category": category,
            "started_at": started_at,
            "viewer_count": 0
        }
        return await self._trigger_webhook("stream-started", payload)

    async def trigger_viewer_milestone(self, stream_id: str, creator_id: str, title: str, creator_name: str, viewer_count: int, milestone: int) -> bool:
        """Triggered automatically when a viewer milestone is reached."""
        payload = {
            "event": "viewer_milestone",
            "stream_id": stream_id,
            "creator_id": creator_id,
            "creator_name": creator_name,
            "title": title,
            "viewer_count": viewer_count,
            "milestone": milestone,
            "timestamp": __import__('datetime').datetime.utcnow().isoformat() + "Z"
        }
        return await self._trigger_webhook("viewer-milestone", payload)

    async def trigger_stream_ended(self, stream_id: str, final_viewer_count: int) -> bool:
        """Called when stream ends to clean up milestone state."""
        if stream_id in self.milestones_reached:
            del self.milestones_reached[stream_id]
        return True

    async def trigger_daily_digest(self) -> bool:
        """TODO: Implement daily digest automation"""
        return True

automation_service = AutomationService()
