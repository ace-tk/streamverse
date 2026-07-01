import json
import uuid
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from backend.src.websocket.manager import manager
from backend.src.services.chat import ChatService
from backend.src.dependencies.chat import get_chat_service
from backend.src.services.stream import StreamService
from backend.src.dependencies.stream import get_stream_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.websocket("/streams/{stream_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    stream_id: str,
    chat_service: ChatService = Depends(get_chat_service),
    stream_service: StreamService = Depends(get_stream_service)
):
    try:
        stream = await stream_service.get_stream_details(uuid.UUID(stream_id))
        from backend.src.models.stream import StreamStatus
        if stream.status != StreamStatus.LIVE:
            await websocket.accept()
            await websocket.send_json({"type": "error", "message": "This stream is no longer live."})
            await websocket.close(code=1008)
            return
    except Exception:
        # Stream not found or invalid UUID
        await websocket.close(code=1008)
        return

    await manager.connect(websocket, stream_id, stream_service)
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

            # Broadcast chat message to all clients in the stream
            message = parsed_data.get("message")
            sender_name = parsed_data.get("sender_name", "Anonymous")
            if message:
                # Persist to database
                try:
                    await chat_service.save_message(
                        stream_id=uuid.UUID(stream_id),
                        sender_name=sender_name,
                        message=message,
                    )
                except Exception as e:
                    logger.error(f"Failed to persist chat message: {e}")

                # Broadcast regardless of persistence success
                await manager.broadcast_chat(stream_id, sender_name, message)
    except WebSocketDisconnect:
        await manager.disconnect(websocket, stream_id, stream_service)
    except Exception as e:
        logger.error(f"WebSocket error for stream {stream_id}: {e}")
        await manager.disconnect(websocket, stream_id, stream_service)
