import asyncio
import websockets
import json

async def test():
    uri = "ws://localhost:8000/ws/streams/123"
    async with websockets.connect(uri) as websocket:
        await websocket.send(json.dumps({"message": "hello"}))
        response = await websocket.recv()
        print(f"Received: {response}")

asyncio.run(test())
