# 🚀 StreamVerse

> **A mobile-first real-time live event broadcasting platform built with React Native, FastAPI, PostgreSQL, WebSockets, and n8n automation.**

StreamVerse enables creators to broadcast live sessions while viewers can discover streams, watch in real-time, interact through live chat, and experience automated event workflows powered by n8n.

---

## ✨ Features

### 📱 Mobile Streaming
- 🎥 Creator can start and end live streams
- 👥 Viewers can browse and join live streams
- 💬 Real-time chat using WebSockets
- 👀 Live viewer count synchronization
- 🔄 Automatic reconnection after network interruptions
- 📡 Background/foreground socket lifecycle handling
- ⚡ Smooth production-ready UI with loading, empty, and error states
- ♿ Accessibility support for screen readers

---

### 🤖 Automation (n8n)

The platform integrates with **n8n** to automate important streaming events.

Implemented workflows:

- ✅ Stream Started Notification
- ✅ Viewer Milestone Alerts
- ✅ Stream End Summary
- ✅ Daily Digest Generation

Automation is triggered asynchronously from the backend without blocking the user experience.

---

## 🏗 Architecture

```
                React Native (Expo)
                        │
                        ▼
                FastAPI Backend
                        │
         ┌──────────────┴──────────────┐
         ▼                             ▼
 PostgreSQL                    WebSocket Manager
         │                             │
         └──────────────┬──────────────┘
                        ▼
                 n8n Automation
```

---

# 🛠 Tech Stack

## Mobile

- React Native
- Expo
- TypeScript
- React Query
- React Navigation
- React Native Paper

## Backend

- FastAPI
- SQLAlchemy
- Alembic
- PostgreSQL
- JWT Authentication
- WebSockets

## Automation

- n8n
- Docker
- Webhooks

---

# 📂 Project Structure

```
streamverse
│
├── backend/
│   ├── src/
│   │   ├── api/
│   │   ├── core/
│   │   ├── database/
│   │   ├── services/
│   │   ├── websocket/
│   │   ├── models/
│   │   └── schemas/
│   └── alembic/
│
├── mobile/
│
├── automation/
│   ├── workflows/
│   └── docker-compose.yml
│
└── README.md
```

---

# ⚙️ Setup

## 1. Clone Repository

```bash
git clone <your-repository-url>

cd streamverse
```

---

## 2. Backend

```bash
cd backend

python -m venv .venv

source .venv/bin/activate

pip install -r requirements.txt
```

Configure:

```
backend/.env
```

Run:

```bash
uvicorn backend.src.main:app --reload
```

Swagger:

```
http://localhost:8000/docs
```

---

## 3. Database

Run PostgreSQL.

Execute Alembic migrations.

```bash
alembic upgrade head
```

---

## 4. Mobile App

```bash
cd mobile

npm install

npx expo start
```

Open:

- Android Emulator
- iOS Simulator
- Expo Go

---

## 5. n8n Automation

```bash
cd automation

docker compose up -d
```

Open:

```
http://localhost:5678
```

Import workflows from:

```
automation/workflows/
```

---

# 🔄 Automation Workflows

| Workflow | Purpose |
|----------|---------|
| Stream Started | Triggered when a creator starts streaming |
| Viewer Milestone | Fires at viewer milestones |
| Stream Ended | Generates stream summary |
| Daily Digest | Generates platform digest |

---

# 🧪 Testing

Backend

```bash
curl -X POST http://localhost:8000/api/v1/automation/test
```

Health

```bash
curl http://localhost:5678/healthz
```

# 🎥 Demo

A Loom walkthrough demonstrating the complete application flow is included with the assignment submission.

---

# 🚀 Assignment Coverage

## ✅ Phase 1 (Streaming)

- Creator streaming
- Viewer streaming
- Live viewer count
- Real-time chat

## ⏭ Phase 2 (Offline)

Not implemented.

## ✅ Phase 3 (Automation)

- Stream Started
- Viewer Milestone
- Stream End
- Daily Digest

---

# 👩‍💻 Author

**Tisha Kharade**

B.Tech Computer Science

Passionate about Full Stack Development, Mobile Applications, AI, and Backend Systems.

---

# ⭐ Acknowledgements

Built as part of the **BuildableLabs Wildcard Generalist Engineer Technical Assessment**.