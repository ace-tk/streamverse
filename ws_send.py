import asyncio
import websockets
import json
import sys

async def send_msg(stream_id):
    uri = f"ws://127.0.0.1:8003/ws/streams/{stream_id}"
    async with websockets.connect(uri) as ws:
        await ws.recv() # viewer count
        await ws.send(json.dumps({"message": "Hello via WS"}))
        print("Sent message")
        await ws.recv() # echo chat

asyncio.run(send_msg(sys.argv[1]))
