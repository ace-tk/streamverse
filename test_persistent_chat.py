import asyncio
import websockets
import json
import urllib.request

API_BASE = "http://127.0.0.1:8002"
WS_BASE = "ws://127.0.0.1:8002"
STREAM_ID = "00000000-0000-4000-8000-000000000001"

async def test():
    uri = f"{WS_BASE}/ws/streams/{STREAM_ID}"

    # Connect two clients and send messages
    async with websockets.connect(uri) as ws1:
        # Receive viewer_count on connect
        r = await ws1.recv()
        print(f"ws1 connect: {r}")

        async with websockets.connect(uri) as ws2:
            # Both get viewer_count=2
            r1 = await ws1.recv()
            r2 = await ws2.recv()
            print(f"ws1 viewer update: {r1}")
            print(f"ws2 viewer update: {r2}")

            # Send messages
            await ws1.send(json.dumps({"sender_name": "Alice", "message": "Hello from Alice"}))
            # Both receive broadcast
            c1 = await ws1.recv()
            c2 = await ws2.recv()
            print(f"ws1 chat: {c1}")
            print(f"ws2 chat: {c2}")

            await ws2.send(json.dumps({"sender_name": "Bob", "message": "Hey Alice!"}))
            c3 = await ws1.recv()
            c4 = await ws2.recv()
            print(f"ws1 chat: {c3}")
            print(f"ws2 chat: {c4}")

    # Small delay for DB commit
    await asyncio.sleep(0.5)

    # Now fetch history via REST
    url = f"{API_BASE}/api/v1/streams/{STREAM_ID}/messages"
    req = urllib.request.Request(url)
    resp = urllib.request.urlopen(req)
    data = json.loads(resp.read())
    print(f"\nREST GET {url}")
    print(f"Messages returned: {len(data)}")
    for msg in data:
        print(f"  [{msg['sender_name']}]: {msg['message']}")

asyncio.run(test())
