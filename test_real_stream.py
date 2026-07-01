import asyncio
import websockets
import json
import urllib.request

API_BASE = "http://127.0.0.1:8003"
WS_BASE = "ws://127.0.0.1:8003"

async def test():
    # 1. Create a user (we need a valid user ID to create a stream)
    # Wait, signup is an endpoint
    req_signup = urllib.request.Request(f"{API_BASE}/api/v1/auth/signup", method="POST", data=json.dumps({
        "name": "Test User",
        "email": "testuser@example.com",
        "password": "Password123!"
    }).encode("utf-8"), headers={"Content-Type": "application/json"})
    try:
        resp_signup = urllib.request.urlopen(req_signup)
        user_data = json.loads(resp_signup.read())
        user_id = user_data["id"]
    except urllib.error.HTTPError as e:
        # User might already exist, try to login
        if e.code == 400:
             req_login = urllib.request.Request(f"{API_BASE}/api/v1/auth/login", method="POST", data=json.dumps({
                "email": "testuser@example.com",
                "password": "Password123!"
            }).encode("utf-8"), headers={"Content-Type": "application/json"})
             resp_login = urllib.request.urlopen(req_login)
             token_data = json.loads(resp_login.read())
             user_id = token_data["user"]["id"]
             token = token_data["access_token"]
        else:
             raise
    else:
        # login to get token
        req_login = urllib.request.Request(f"{API_BASE}/api/v1/auth/login", method="POST", data=json.dumps({
            "email": "testuser@example.com",
            "password": "Password123!"
        }).encode("utf-8"), headers={"Content-Type": "application/json"})
        resp_login = urllib.request.urlopen(req_login)
        token_data = json.loads(resp_login.read())
        token = token_data["access_token"]
        
    # 2. Create a stream
    req_stream = urllib.request.Request(f"{API_BASE}/api/v1/streams", method="POST", data=json.dumps({
        "title": "Test Stream",
        "description": "This is a test stream",
        "category": "Gaming"
    }).encode("utf-8"), headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"})
    try:
        resp_stream = urllib.request.urlopen(req_stream)
        stream_data = json.loads(resp_stream.read())
        stream_id = stream_data["id"]
    except urllib.error.HTTPError as e:
        if e.code == 400:
            # Maybe user already has active stream. Let's fetch it
            req_streams = urllib.request.Request(f"{API_BASE}/api/v1/streams")
            resp_streams = urllib.request.urlopen(req_streams)
            streams_data = json.loads(resp_streams.read())
            stream_id = streams_data["items"][0]["id"]
        else:
            raise

    print(f"Using stream ID: {stream_id}")

    # 3. Connect websocket and send message
    uri = f"{WS_BASE}/ws/streams/{stream_id}"
    async with websockets.connect(uri) as ws:
        await ws.recv() # viewer count
        await ws.send(json.dumps({"sender_name": "Test Client", "message": "Does persistence work?"}))
        print(f"Received from WS: {await ws.recv()}") # chat broadcast
    
    # Small delay for DB commit
    await asyncio.sleep(0.5)

    # 4. Fetch messages
    url = f"{API_BASE}/api/v1/streams/{stream_id}/messages"
    req_msgs = urllib.request.Request(url)
    resp_msgs = urllib.request.urlopen(req_msgs)
    msgs = json.loads(resp_msgs.read())
    print(f"Messages fetched: {len(msgs)}")
    for msg in msgs:
        print(f"  [{msg['sender_name']}] {msg['message']}")

asyncio.run(test())
