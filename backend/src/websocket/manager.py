from typing import Dict, Set
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Maps stream_id to a set of active websocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, stream_id: str):
        await websocket.accept()
        if stream_id not in self.active_connections:
            self.active_connections[stream_id] = set()
        self.active_connections[stream_id].add(websocket)
        await self.broadcast_viewer_count(stream_id)

    async def disconnect(self, websocket: WebSocket, stream_id: str):
        if stream_id in self.active_connections:
            self.active_connections[stream_id].discard(websocket)
            if not self.active_connections[stream_id]:
                del self.active_connections[stream_id]
            else:
                await self.broadcast_viewer_count(stream_id)

    def get_viewer_count(self, stream_id: str) -> int:
        return len(self.active_connections.get(stream_id, set()))

    async def broadcast_viewer_count(self, stream_id: str):
        count = self.get_viewer_count(stream_id)
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

    async def broadcast_chat(self, stream_id: str, message: str):
        payload = {
            "type": "chat",
            "message": message
        }
        await self.broadcast(payload, stream_id)

manager = ConnectionManager()
