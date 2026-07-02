from typing import Dict, Set
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Maps stream_id to a set of active websocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, stream_id: str, stream_service=None):
        await websocket.accept()
        if stream_id not in self.active_connections:
            self.active_connections[stream_id] = set()
        self.active_connections[stream_id].add(websocket)
        await self.broadcast_viewer_count(stream_id, stream_service)

    async def disconnect(self, websocket: WebSocket, stream_id: str, stream_service=None):
        if stream_id in self.active_connections:
            self.active_connections[stream_id].discard(websocket)
            count = self.get_viewer_count(stream_id)
            if count == 0:
                del self.active_connections[stream_id]
            await self.broadcast_viewer_count(stream_id, stream_service)

    def get_viewer_count(self, stream_id: str) -> int:
        return len(self.active_connections.get(stream_id, set()))

    async def broadcast_viewer_count(self, stream_id: str, stream_service=None):
        count = self.get_viewer_count(stream_id)
        if stream_service:
            import uuid
            import logging
            from backend.src.services.automation import automation_service
            import asyncio
            try:
                await stream_service.update_viewer_count(uuid.UUID(stream_id), count)
                
                # Milestone checking
                milestones = [10, 25, 50, 100, 250, 500]
                if count in milestones:
                    reached = automation_service.milestones_reached.setdefault(stream_id, set())
                    if count not in reached:
                        reached.add(count)
                        # Fetch stream details to get title, creator, etc.
                        try:
                            stream = await stream_service.get_stream_details(uuid.UUID(stream_id))
                            asyncio.create_task(
                                automation_service.trigger_viewer_milestone(
                                    stream_id=str(stream.id),
                                    creator_id=str(stream.creator_id),
                                    title=stream.title,
                                    creator_name=stream.creator.name,
                                    viewer_count=count,
                                    milestone=count
                                )
                            )
                        except Exception as e:
                            logger = logging.getLogger(__name__)
                            logger.error(f"Failed to fetch stream details for milestone: {e}")
            except Exception as e:
                logger = logging.getLogger(__name__)
                logger.error(f"Failed to persist viewer count to DB: {e}")
        await self.broadcast({"type": "viewer_count", "count": count}, stream_id)

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_json(message)

    async def broadcast(self, message: dict, stream_id: str):
        if stream_id in self.active_connections:
            for connection in self.active_connections[stream_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass

    async def broadcast_chat(self, stream_id: str, sender_name: str, message: str):
        payload = {
            "type": "chat",
            "sender_name": sender_name,
            "message": message
        }
        await self.broadcast(payload, stream_id)

    async def close_stream(self, stream_id: str):
        """Close all connections for a stream and send stream_ended message."""
        if stream_id in self.active_connections:
            import logging
            logger = logging.getLogger(__name__)
            # Copy to avoid modifying while iterating
            connections = list(self.active_connections[stream_id])
            for connection in connections:
                try:
                    await connection.send_json({
                        "type": "stream_ended",
                        "message": "This live stream has ended."
                    })
                    await connection.close()
                except Exception as e:
                    logger.error(f"Failed to close websocket during stream termination: {e}")
            
            # Clean up the stream from manager
            if stream_id in self.active_connections:
                del self.active_connections[stream_id]
            
            # Clean up milestones
            try:
                from backend.src.services.automation import automation_service
                import asyncio
                asyncio.create_task(automation_service.trigger_stream_ended(stream_id, 0))
            except Exception as e:
                pass

manager = ConnectionManager()
