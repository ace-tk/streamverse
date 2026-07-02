import httpx
import logging
import datetime
from typing import Dict, Any, Optional
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

    async def trigger_stream_ended(
        self,
        stream_id: str,
        creator_id: str,
        creator_name: str,
        title: str,
        category: str,
        started_at: str,
        ended_at: str,
        duration_minutes: int,
        peak_viewers: int,
        total_messages: int,
        final_viewers: int
    ) -> bool:
        """Triggered automatically when a creator ends a stream.
        Also cleans up milestone deduplication state for this stream.
        """
        # Clean up milestone state first
        if stream_id in self.milestones_reached:
            del self.milestones_reached[stream_id]

        payload = {
            "event": "stream_ended",
            "stream_id": stream_id,
            "creator_id": creator_id,
            "creator_name": creator_name,
            "title": title,
            "category": category,
            "started_at": started_at,
            "ended_at": ended_at,
            "duration_minutes": duration_minutes,
            "peak_viewers": peak_viewers,
            "total_messages": total_messages,
            "final_viewers": final_viewers
        }
        return await self._trigger_webhook("stream-ended", payload)

    async def trigger_daily_digest(
        self,
        date: Optional[str] = None,
        total_streams: int = 0,
        top_stream_title: str = "No streams today",
        top_stream_creator: str = "N/A",
        top_stream_peak_viewers: int = 0
    ) -> bool:
        """Triggered to generate and send the daily digest.
        Uses provided values or sensible mock defaults when not supplied.
        """
        if date is None:
            date = datetime.datetime.utcnow().strftime("%Y-%m-%d")

        payload = {
            "event": "daily_digest",
            "date": date,
            "total_streams": total_streams,
            "top_stream": {
                "title": top_stream_title,
                "creator": top_stream_creator,
                "peak_viewers": top_stream_peak_viewers
            }
        }
        return await self._trigger_webhook("daily-digest", payload)

automation_service = AutomationService()
