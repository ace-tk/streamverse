import asyncio
import websockets
import json

async def connect_client(client_id, uri):
    async with websockets.connect(uri) as websocket:
        print(f"Client {client_id} connected")
        response1 = await websocket.recv()
        print(f"Client {client_id} received (viewer count): {response1}")
        
        await asyncio.sleep(1) # wait for both clients to connect
        
        if client_id == 1:
            await websocket.send(json.dumps({"message": "Hello StreamVerse"}))
            response2 = await websocket.recv()
            print(f"Client {client_id} received (chat): {response2}")
        elif client_id == 2:
            response2 = await websocket.recv() # wait for viewer count update from client 1 connecting if this is client 2 connecting first... actually, client 1 connects first. So client 2 gets viewer count = 2.
            # wait for chat message
            response3 = await websocket.recv()
            print(f"Client {client_id} received (chat): {response3}")

async def test():
    uri = "ws://localhost:8000/ws/streams/test"
    
    # Start client 1
    task1 = asyncio.create_task(connect_client(1, uri))
    await asyncio.sleep(0.5) # Let client 1 connect first
    
    # Start client 2
    task2 = asyncio.create_task(connect_client(2, uri))
    
    await asyncio.gather(task1, task2)

asyncio.run(test())
