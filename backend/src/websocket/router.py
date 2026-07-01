import json
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from backend.src.websocket.manager import manager

logger = logging.getLogger(__name__)

router = APIRouter()

@router.websocket("/streams/{stream_id}")
async def websocket_endpoint(websocket: WebSocket, stream_id: str):
    await manager.connect(websocket, stream_id)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                parsed_data = json.loads(data)
            except json.JSONDecodeError:
                # Handle invalid json gracefully
                await manager.send_personal_message(
                    {"type": "error", "message": "Invalid JSON format"}, 
                    websocket
                )
                continue
            
            # Echo message back
            await manager.send_personal_message(
                {"type": "echo", "message": parsed_data.get("message", "")}, 
                websocket
            )
    except WebSocketDisconnect:
        manager.disconnect(websocket, stream_id)
    except Exception as e:
        logger.error(f"WebSocket error for stream {stream_id}: {e}")
        manager.disconnect(websocket, stream_id)
