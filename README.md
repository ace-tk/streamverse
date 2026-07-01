# StreamVerse

StreamVerse is a mobile-first live event broadcasting platform allowing creators to start live streams and viewers to join and chat in real-time.

## Architecture Overview

The project is structured into three main directories to maintain separation of concerns and enable long-term scalability.

### Directory Structure

```text
streamverse/
├── backend/                # FastAPI application
│   ├── alembic/            # Database migrations
│   ├── src/
│   │   ├── api/            # API routing and endpoints (v1, v2)
│   │   ├── core/           # Core configuration, security, and settings
│   │   ├── db/             # SQLAlchemy models and database sessions
│   │   ├── schemas/        # Pydantic models for validation and serialization
│   │   ├── services/       # Business logic separated from route handlers
│   │   └── websockets/     # WebSocket connection managers for real-time chat
│   ├── .env.example        # Environment variable template
│   └── requirements.txt    # Python dependencies
├── frontend/               # React Native (Expo) application
│   ├── app/                # Expo Router file-based routing
│   ├── src/
│   │   ├── components/     # Reusable UI components (buttons, inputs)
│   │   ├── features/       # Feature-based modules (e.g., streaming, chat, auth)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Third-party integrations (Supabase client, axios)
│   │   ├── store/          # Zustand state management
│   │   └── types/          # Global TypeScript interfaces
│   ├── .env.example        # Environment variable template
│   ├── package.json        # NPM dependencies and scripts
│   ├── tsconfig.json       # TypeScript configuration
│   └── tailwind.config.js  # NativeWind configuration
└── automation/             # n8n workflows and configuration
    ├── workflows/          # Exported n8n JSON workflows
    └── docker-compose.yml  # Local n8n instance orchestration
```

### Why This Structure?

#### Frontend (Feature-Based Architecture)
The `src/features/` folder is designed for scalability. Instead of dumping all components, hooks, and services into global folders, we group them by feature domain (e.g., `features/chat`, `features/stream`). Global UI components (buttons, headers) stay in `src/components/`, while complex domain logic remains isolated. `app/` is strictly for Expo Router navigation. 

#### Backend (Layered Architecture)
The backend uses a standard multi-layer architecture to decouple concerns:
- **API (`api/`)**: Only handles HTTP requests, responses, and dependency injection.
- **Services (`services/`)**: Contains all business logic. This makes testing easier and allows features to be called internally (e.g., from WebSockets) without going through HTTP layers.
- **Schemas (`schemas/`)**: Strict input/output validation with Pydantic.
- **DB (`db/`)**: SQLAlchemy models defining the database schema.
- **WebSockets (`websockets/`)**: Dedicated handlers for the real-time chat functionality.

#### Automation
`automation/` stores our n8n setups. Using `docker-compose.yml` ensures that the backend automation can be spun up locally for development and tested alongside the application.

## Development Strategy
- **Phase 1**: Core mobile streaming, WebSockets chat, view counts.
- **Phase 2**: Offline sync (planned). Architecture is ready with separated state (`store/`) and services (`services/`).
- **Phase 3**: n8n integration (using `automation/`).
