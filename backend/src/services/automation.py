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

    async def trigger_stream_started(self, stream_id: str, creator_id: str, title: str) -> bool:
        """Temporary implementation for connectivity testing."""
        payload = {
            "event": "stream_started",
            "stream_id": stream_id,
            "creator_id": creator_id,
            "title": title
        }
        # Uses the test-automation endpoint configured in n8n test workflow
        return await self._trigger_webhook("test-automation", payload)

    async def trigger_viewer_milestone(self, stream_id: str, viewer_count: int) -> bool:
        """TODO: Implement viewer milestone automation"""
        return True

    async def trigger_stream_ended(self, stream_id: str, final_viewer_count: int) -> bool:
        """TODO: Implement stream ended automation"""
        return True

    async def trigger_daily_digest(self) -> bool:
        """TODO: Implement daily digest automation"""
        return True

automation_service = AutomationService()
