import asyncio
import websockets
import json
import urllib.request
import time

API_BASE = "http://127.0.0.1:8004"
WS_BASE = "ws://127.0.0.1:8004"

def fetch_viewer_count(stream_id):
    url = f"{API_BASE}/api/v1/streams/{stream_id}"
    req = urllib.request.Request(url)
    resp = urllib.request.urlopen(req)
    data = json.loads(resp.read())
    return data["viewer_count"]

async def test():
    # 1. Create a user (we need a valid user ID to create a stream)
    req_login = urllib.request.Request(f"{API_BASE}/api/v1/auth/login", method="POST", data=json.dumps({
        "email": "alice2@example.com",
        "password": "Password123!"
    }).encode("utf-8"), headers={"Content-Type": "application/json"})
    
    resp_login = urllib.request.urlopen(req_login)
    token_data = json.loads(resp_login.read())
    token = token_data["access_token"]
        
    # 2. Create a stream
    req_stream = urllib.request.Request(f"{API_BASE}/api/v1/streams", method="POST", data=json.dumps({
        "title": "Viewer Sync Test Stream",
        "description": "Testing DB sync",
        "category": "Gaming"
    }).encode("utf-8"), headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"})
    
    resp_stream = urllib.request.urlopen(req_stream)
    stream_data = json.loads(resp_stream.read())
    stream_id = stream_data["id"]

    print(f"Created Stream ID: {stream_id}")
    print(f"Initial DB viewer count: {fetch_viewer_count(stream_id)}")

    # 3. Connect client A
    uri = f"{WS_BASE}/ws/streams/{stream_id}"
    ws_A = await websockets.connect(uri)
    print(f"Client A received: {await ws_A.recv()}")
    
    await asyncio.sleep(0.5) # allow DB sync
    print(f"DB viewer count after Client A: {fetch_viewer_count(stream_id)}")

    # 4. Connect client B
    ws_B = await websockets.connect(uri)
    print(f"Client A received: {await ws_A.recv()}")
    print(f"Client B received: {await ws_B.recv()}")
    
    await asyncio.sleep(0.5) # allow DB sync
    print(f"DB viewer count after Client B: {fetch_viewer_count(stream_id)}")

    # 5. Disconnect client B
    await ws_B.close()
    print(f"Client A received: {await ws_A.recv()}")
    
    await asyncio.sleep(0.5)
    print(f"DB viewer count after Client B leaves: {fetch_viewer_count(stream_id)}")

    # 6. Disconnect client A
    await ws_A.close()
    
    await asyncio.sleep(0.5)
    print(f"DB viewer count after all leave: {fetch_viewer_count(stream_id)}")

asyncio.run(test())
