# Appendix – Representative AI Prompts
## Note to Reviewers

This document presents a curated collection of representative AI prompts used throughout the development of **StreamVerse**. The selected prompts demonstrate the project's progression from architecture planning and backend implementation to frontend development, automation, debugging, testing, and documentation.

As the project involved a substantial number of AI-assisted interactions, only representative examples have been included to keep this document concise and easy to review.

For complete transparency, **the full raw Antigravity chat history (exported as a PDF) will also be included with the submission**. This provides the complete chronological record of the AI-assisted development process beyond the representative prompts documented here.
The following prompts are representative examples of how AI tools (ChatGPT and Antigravity) were used during the development of StreamVerse. They illustrate the overall engineering workflow rather than every individual debugging iteration.

---

## Representative Prompt 1 – Project Architecture

**Objective:** Design the overall project architecture.

**Prompt**

Design a production-ready architecture for a mobile-first live streaming platform called **StreamVerse**.

Requirements:

- React Native (Expo) mobile application
- FastAPI backend
- PostgreSQL database
- JWT authentication
- WebSocket-based real-time chat
- Feature-based frontend architecture
- Layered backend architecture
- Docker support
- n8n workflow automation
- Clean, scalable folder structure

Explain the reasoning behind the architecture and ensure it is suitable for future expansion.

---

## Representative Prompt 2 – Backend Foundation

**Objective:** Build the backend infrastructure.

**Prompt**

Generate a FastAPI backend following clean architecture principles.

Requirements:

- SQLAlchemy ORM
- Alembic migrations
- Pydantic schemas
- Dependency Injection
- Service layer
- JWT authentication
- Stream CRUD APIs
- Configuration management
- PostgreSQL integration

Separate API routes, business logic, schemas, and persistence into dedicated modules.

---

## Representative Prompt 3 – Real-Time Streaming

**Objective:** Implement the core streaming experience.

**Prompt**

Implement the complete real-time streaming workflow.

Requirements:

- Creator can start and end streams.
- Viewer can browse and join live streams.
- Implement WebSocket-based real-time chat.
- Synchronize live viewer counts.
- Handle connection/disconnection gracefully.
- Persist chat history.
- Ensure asynchronous, non-blocking communication.

Maintain production-ready error handling and lifecycle management.

---

## Representative Prompt 4 – Mobile Application

**Objective:** Build the React Native frontend.

**Prompt**

Develop a modern React Native application using Expo.

Requirements:

- Authentication screens
- Creator dashboard
- Viewer browsing experience
- Live stream interface
- Real-time chat integration
- React Query for data fetching
- Responsive UI
- Loading, empty, and error states
- Accessibility improvements
- Production-quality user experience

---

## Representative Prompt 5 – n8n Automation

**Objective:** Integrate workflow automation.

**Prompt**

Integrate n8n into the existing StreamVerse architecture.

Requirements:

- Dockerized n8n instance
- AutomationService abstraction
- Asynchronous webhook communication
- Graceful failure handling
- Environment-based configuration

Implement the following workflows:

- Stream Started
- Viewer Milestone
- Stream Ended
- Daily Digest

Ensure webhook execution never blocks user requests.

---

## Representative Prompt 6 – Debugging & Integration

**Objective:** Resolve integration issues.

**Prompt**

Analyze the existing implementation and identify the root cause of runtime and integration failures.

Focus on:

- JWT authentication
- WebSocket communication
- React Native UI issues
- Axios networking
- Docker configuration
- n8n webhook integration

Provide the smallest possible production-ready fix while preserving the existing architecture.

---

## Representative Prompt 7 – Documentation & Final Review

**Objective:** Prepare the project for submission.

**Prompt**

Review the complete project and generate professional documentation.

Requirements:

- Comprehensive README
- AI Development Log
- Testing instructions
- Architecture explanation
- Setup guide
- Automation overview
- Repository organization
- Final verification checklist

Ensure the documentation is suitable for a technical assessment submission and accurately reflects the implemented system.