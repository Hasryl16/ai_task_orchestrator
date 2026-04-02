# AI Task Orchestrator

A full-stack web dashboard for orchestrating AI agents to plan, build, and validate tasks — with real-time progress tracking via WebSockets.

Built with FastAPI, React, PostgreSQL, and the Claude API. Includes a **mock mode** so the full pipeline works without an API key.

---

## Features

- **3-agent AI pipeline** — Planner → Builder → Validator run sequentially on every task
- **Real-time updates** — WebSocket pushes live progress to the dashboard as each agent runs
- **Mock mode** — full pipeline works out of the box without a Claude API key
- **Task management** — create, view, re-run, and delete tasks from a responsive web UI
- **Persistent storage** — all tasks and execution results stored in PostgreSQL
- **Docker support** — single command to start the entire stack

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI, Python 3.12, SQLAlchemy 2 (async), asyncpg |
| Frontend | React 18, TypeScript, Tailwind CSS |
| Database | PostgreSQL 16 |
| AI | Anthropic Claude API (`claude-opus-4-6`) |
| Real-time | WebSockets |
| Infrastructure | Docker, Docker Compose |

---

## Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose

### 1. Clone and configure

```bash
git clone https://github.com/your-username/ai-task-orchestrator.git
cd ai-task-orchestrator

cp .env.example .env
```

### 2. Start with mock mode (no API key needed)

The default `.env` has `MOCK_MODE=true` — agents return realistic pre-written responses instantly.

```bash
docker-compose up --build
```

### 3. Open the dashboard

| Service | URL |
|---------|-----|
| Dashboard | http://localhost:3000 |
| API docs | http://localhost:8000/docs |
| API health | http://localhost:8000/health |

---

## Switching to Real Claude AI

1. Get an API key from [console.anthropic.com](https://console.anthropic.com/)
2. Edit `.env`:

```bash
MOCK_MODE=false
CLAUDE_API_KEY=sk-ant-your-key-here
```

3. Restart:

```bash
docker-compose up
```

No code changes required — the same endpoints and UI work in both modes.

---

## Project Structure

```
ai-task-orchestrator/
├── backend/
│   ├── app/
│   │   ├── agents/          # Planner, Builder, Validator agents
│   │   ├── routes/          # REST API endpoints
│   │   ├── websocket/       # WebSocket connection manager & events
│   │   ├── models.py        # SQLAlchemy ORM models
│   │   ├── schemas.py       # Pydantic request/response schemas
│   │   ├── orchestrator.py  # Pipeline runner (planner→builder→validator)
│   │   ├── config.py        # Settings (reads from .env)
│   │   └── main.py          # FastAPI app entry point
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/           # Dashboard, TaskDetail
│   │   ├── components/      # TaskForm, ExecutionTimeline, AgentStatus
│   │   ├── hooks/           # useWebSocket, useTask
│   │   ├── services/        # Axios API client
│   │   └── types/           # TypeScript interfaces
│   └── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/tasks` | Create a new task |
| `GET` | `/api/tasks` | List all tasks (supports `?status=` filter) |
| `GET` | `/api/tasks/{id}` | Get task with execution results |
| `POST` | `/api/tasks/{id}/execute` | Trigger the agent pipeline |
| `DELETE` | `/api/tasks/{id}` | Delete a task |
| `GET` | `/api/executions/{id}` | Get a single execution |
| `WS` | `/ws/tasks/{id}` | Real-time execution updates |

Full interactive docs available at `http://localhost:8000/docs` when running.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MOCK_MODE` | `true` | Use mock agents (no API key needed) |
| `CLAUDE_API_KEY` | — | Anthropic API key (required when `MOCK_MODE=false`) |
| `JWT_SECRET_KEY` | — | Secret key for JWT signing |
| `DATABASE_URL` | *(postgres service)* | PostgreSQL connection string |
| `CORS_ORIGINS` | `["http://localhost:3000"]` | Allowed CORS origins |

---

## How the Pipeline Works

```
User creates task
       │
       ▼
  PlannerAgent ──► breaks task into steps + estimates complexity
       │
       ▼
  BuilderAgent ──► generates solution + code blocks using plan as context
       │
       ▼
 ValidatorAgent ──► reviews solution, scores it, flags issues
       │
       ▼
  Task marked complete, all output stored in DB
  (WebSocket broadcasts each stage in real-time)
```

---

## License

MIT
