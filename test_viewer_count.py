import asyncio
import websockets
import json

async def connect_client(client_id, uri):
    async with websockets.connect(uri) as websocket:
        print(f"Client {client_id} connected")
        response1 = await websocket.recv()
        print(f"Client {client_id} received: {response1}")
        
        # Keep connection open for a bit
        await asyncio.sleep(2)
        
        if client_id == 2:
            return
            
        response2 = await websocket.recv()
        print(f"Client {client_id} received: {response2}")

async def test():
    uri = "ws://localhost:8000/ws/streams/123"
    
    # Start client 1
    task1 = asyncio.create_task(connect_client(1, uri))
    await asyncio.sleep(0.5) # Let client 1 connect first
    
    # Start client 2
    task2 = asyncio.create_task(connect_client(2, uri))
    
    await asyncio.gather(task1, task2)

asyncio.run(test())
