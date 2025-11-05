# N8N Workflow Automation Platform

![N8N Workflow Architecture](./apps/web/public/N8N.png)

A powerful, self-hosted workflow automation platform inspired by n8n. Build complex automation workflows with a visual node-based editor, connect different services, and let them work together seamlessly.

## What's This About?

Think of this as your personal automation tool. Whether you want to send emails when a webhook is triggered, collect form responses and notify your Telegram, or have an AI agent process data before forwarding it—you can chain these actions together visually, and the system handles the rest.

## Tech Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for blazing fast development
- **React Flow** for the node-based workflow editor
- **Tailwind CSS + shadcn/ui** for modern, accessible UI components

### Backend

- **Python 3.11+** with FastAPI
- **SQLModel + Prisma** for type-safe database operations
- **Redis** for job queue management
- **Alembic** for database migrations
- **PostgreSQL** as the primary database

## Core Features

### Visual Workflow Builder

Drag and drop nodes onto a canvas, connect them with edges, and watch your automation come to life. Each node can be configured with its own settings, credentials, and logic.

### Multiple Trigger Types

- **Manual**: Run workflows on-demand
- **Webhook**: Trigger workflows via HTTP requests

### Available Nodes

- **Webhook**: Receive HTTP requests with headers, body, and query params
- **Form**: Pause workflow and collect user input via a public form
- **Email**: Send emails using Resend or other providers
- **Telegram**: Send messages to Telegram chats/channels
- **Agent**: AI-powered nodes with tool calling (web search, summaries)
- More nodes can be easily added!

### Credential Management

Store API keys, tokens, and secrets securely. Each node can reference credentials without exposing sensitive data in the workflow definition.

## Project Structure

```
N8N/
├── apps/
│   ├── web/                    # React frontend (Vite)
│   │   ├── src/
│   │   │   ├── components/     # UI components & workflow editor
│   │   │   ├── pages/          # Route pages (Editor, Insights, Admin)
│   │   │   ├── contexts/       # Auth & global state
│   │   │   └── lib/            # API clients & utilities
│   │   └── dist/               # Production build
│   └── server/                 # TypeScript server (legacy/alternate)
├── python-backend/
│   ├── server/
│   │   ├── routes/             # API endpoints (workflows, executions, webhooks)
│   │   ├── controller/         # Business logic handlers
│   │   └── redis/              # Queue operations (addToQueue, getFromQueue)
│   ├── Workers/
│   │   ├── index.py            # Main worker loop
│   │   └── nodes/              # Node implementations (email, telegram, agent, etc.)
│   └── db/
│       ├── models/             # SQLModel schemas
│       └── migrations/         # Alembic database migrations
├── packages/
│   ├── db/                     # Shared Prisma schema
│   ├── exports/                # Shared utilities (Redis client, Zod schemas)
```

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm/yarn/pnpm
- **Python** 3.11+
- **PostgreSQL** database
- **Redis** server
- **UV** (Python package manager - recommended)

### Environment Setup

Create `.env` files for both frontend and backend:

**Backend `.env`** (in `python-backend/`):

```env
DATABASE_URL=postgresql://user:password@localhost:5432/n8n
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=          # Optional
JWT_SECRET=your-secret-key
RESEND_API_KEY=          # For email node
TELEGRAM_BOT_TOKEN=      # For Telegram node
OPENAI_API_KEY=          # For AI agent node
```

**Frontend `.env`** (in `apps/web/`):

```env
VITE_API_URL=http://localhost:8000
```

### Installation

```bash
# Install all dependencies (monorepo)
npm install

# Install Python dependencies
cd python-backend
uv sync
# or: pip install -r requirements.txt

# Run database migrations
cd db
alembic upgrade head
```

### Running the Platform

You need to run three processes:

**1. Backend Server**

```bash
cd python-backend
uv run uvicorn server.main:app --reload --port 8000
```

**2. Worker Process**

```bash
cd python-backend
uv run python Workers/index.py
```

**3. Frontend Dev Server**

```bash
cd apps/web
npm run dev
```

### Building for Production

```bash
# Build frontend
cd apps/web
npm run build

# For backend, use gunicorn or similar:
cd python-backend
uvnicorn server.main:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```
