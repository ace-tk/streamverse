import asyncio
import websockets
import json
import urllib.request
import time

API_BASE = "http://127.0.0.1:8005"
WS_BASE = "ws://127.0.0.1:8005"

def end_stream(stream_id, token):
    url = f"{API_BASE}/api/v1/streams/{stream_id}/end"
    req = urllib.request.Request(url, method="PATCH", headers={"Authorization": f"Bearer {token}"})
    resp = urllib.request.urlopen(req)
    return json.loads(resp.read())

async def test():
    # 1. Login
    req_login = urllib.request.Request(f"{API_BASE}/api/v1/auth/login", method="POST", data=json.dumps({
        "email": "alice2@example.com",
        "password": "Password123!"
    }).encode("utf-8"), headers={"Content-Type": "application/json"})
    
    resp_login = urllib.request.urlopen(req_login)
    token_data = json.loads(resp_login.read())
    token = token_data["access_token"]
        
    # 2. Create stream
    req_stream = urllib.request.Request(f"{API_BASE}/api/v1/streams", method="POST", data=json.dumps({
        "title": "Termination Test",
        "category": "Gaming"
    }).encode("utf-8"), headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"})
    
    resp_stream = urllib.request.urlopen(req_stream)
    stream_data = json.loads(resp_stream.read())
    stream_id = stream_data["id"]

    print(f"Created Stream: {stream_id}")

    # 3. Connect client A and B
    uri = f"{WS_BASE}/ws/streams/{stream_id}"
    ws_A = await websockets.connect(uri)
    await ws_A.recv() # v_c 1
    
    ws_B = await websockets.connect(uri)
    await ws_A.recv() # v_c 2
    await ws_B.recv() # v_c 2
    
    print("Clients connected.")

    # 4. End Stream
    end_stream(stream_id, token)
    print("Stream ended via API.")

    # 5. Receive termination messages
    msg_a = await ws_A.recv()
    msg_b = await ws_B.recv()
    print(f"Client A termination message: {msg_a}")
    print(f"Client B termination message: {msg_b}")
    
    # Connection should be closed
    try:
        await ws_A.recv()
        print("Error: Client A is still open!")
    except websockets.exceptions.ConnectionClosed:
        print("Client A is closed correctly.")

    # 6. Reject new connections
    try:
        ws_C = await websockets.connect(uri)
        msg_c = await ws_C.recv()
        print(f"Client C connected! Received: {msg_c}")
        await ws_C.recv() # should error here if closed immediately after message
    except websockets.exceptions.ConnectionClosed as e:
        print(f"Client C connection rejected correctly with code {e.code}")

asyncio.run(test())
