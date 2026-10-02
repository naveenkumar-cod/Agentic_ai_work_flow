# 🤖 Agentic AI Automation Platform (`Agentflow_AI`)

An enterprise-grade, full-stack AI Operations Automation Platform that converts natural language prompts into executable visual workflows. It renders interactive React Flow graphs, executes tasks through a cooperating 5-agent pipeline, connects with third-party tools (Gmail, Slack, Discord, Google Sheets) over OAuth, manages background queues, and streams live audit logs to the browser.

---

## 🌟 Key Features

- **🗣️ Natural Language Prompt-to-Workflow Builder (`/workflows/builder`)**:
  - Describe an automation in plain English (e.g. *"When a new customer email arrives in Gmail, analyze sentiment with AI, append to Google Sheets, and alert Slack"*).
  - Multi-tier AI hierarchy: **OpenRouter API** $\rightarrow$ **Google Gemini SDK** $\rightarrow$ **Deterministic Rule Engine Fallback** (100% offline runnable).
- **🎨 Visual React Flow Canvas (`/workflows/[id]`)**:
  - Drag-and-drop node palette (Triggers, AI Agents, Gmail, Slack, Discord, Google Sheets, Condition, Data Transform).
  - Animated execution edges, interactive minimap, zoom controls, and dynamic parameter side inspector.
- **⚡ 5-Agent Cooperative Orchestration Chain**:
  1. **Planner Agent**: Performs topological DAG dependency sorting and emits execution plan confidence scores.
  2. **Execution Agent**: Runs each node with variable interpolation (`{{$trigger.data}}`, `{{$now}}`, etc.) against OAuth integrations or AI engines.
  3. **Validation Agent**: Verifies schema contracts, outputs, and required fields.
  4. **Recovery Agent**: Classifies failure modes (`MISSING_FIELDS`, `API_FAILURE`, `AUTH_EXPIRED`, `RATE_LIMIT`, `TRANSIENT`) and manages exponential retry backoffs or escalations.
  5. **Monitoring Agent**: Emits live WebSocket events and writes persistent audit records.
- **📡 Real-Time Socket.IO Streaming (`/executions/[id]`)**:
  - Watch each agent's thoughts and actions stream live into color-coded timeline badges.
  - Interactive pause, resume, and cancellation controls with state snapshots.
- **🔒 AES-256-GCM Token Security**:
  - All third-party OAuth tokens and secrets are encrypted at rest with an application-level key.
- **🚀 Zero-Friction Local Execution**:
  - Automatically spins up `mongodb-memory-server` if local MongoDB is not running.
  - Automatically uses an In-Memory Queue if local Redis is not running.

---

## 🏗️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js (Pages Router), React 19, Tailwind CSS, Zustand, Axios, React Flow (`@xyflow/react`), Socket.IO Client, Lucide React |
| **Backend** | Node.js, Express, MongoDB (Mongoose), JWT, BullMQ, Redis (ioredis), Socket.IO, Helmet, Morgan, Compression, Express-Validator, Bcrypt.js |
| **Agentic AI** | Google Generative AI SDK, OpenRouter API, LangChain / LangGraph orchestration substrate |
| **Integrations** | Gmail, Slack, Discord, Google Sheets (OAuth 2.0 & encrypted API keys) |

---

## 📋 Prerequisites

Before running the project, ensure you have:
- **Node.js**: v18.0.0 or higher (`node -v`)
- **npm**: v9.0.0 or higher (`npm -v`)
- *(Optional)*: MongoDB daemon & Redis server (the platform automatically falls back to in-memory mode if omitted).

---

## 🚀 Quickstart: Running Locally

### Step 1: Install Root, Server & Client Dependencies

From the project root directory:

```bash
# Option A: One-step command to install all packages
npm run install:all

# Option B: Or install individually
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

---

### Step 2: Environment Configuration

Copy the example environment file:

```bash
# Windows PowerShell
copy .env.example server\.env

# macOS / Linux
cp .env.example server/.env
```

#### Key Environment Variables in `server/.env`:

```ini
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Security Keys
JWT_SECRET=super_secret_jwt_key_agentflow_change_me_in_prod_12345
CREDENTIAL_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef

# Database & Queue (Leave as default to use automatic In-Memory fallbacks)
MONGODB_URI=mongodb://localhost:27017/agentflow_ai
REDIS_URL=redis://localhost:6379

# AI Provider Keys (Optional - deterministic builder works without any keys)
GEMINI_API_KEY=your_gemini_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Third-Party OAuth Credentials (Optional - simulated mode available in dev)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
```

---

### Step 3: Start Backend & Frontend

You can run both concurrently from the root or in separate terminal windows:

#### Single Command (Recommended):
```bash
npm run dev
```

#### Or in Separate Terminals:

**Terminal 1 (Backend API & Socket.IO):**
```bash
cd server
npm run dev
# Server running at: http://localhost:5000
```

**Terminal 2 (Next.js Frontend):**
```bash
cd client
npm run dev
# Frontend running at: http://localhost:3000
```

---

### Step 4: Access the Application

1. Open your browser and navigate to: **`http://localhost:3000`**
2. Sign in with the built-in demo credentials or create a new operator account:
   - **Operator Email:** `operator@agentflow.ai`
   - **Operator Password:** `operator123`
   - *(Or click "Fill Operator Demo" / "Register Account")*

---

## 🧭 Application Walkthrough

```
                    ┌─────────────────────────┐
                    │ Natural Language Prompt │
                    └────────────┬────────────┘
                                 ▼
                     AI Workflow Generation
                  (OpenRouter / Gemini / Rules)
                                 ▼
                    ┌─────────────────────────┐
                    │ Visual React Flow Graph │
                    │ (Interactive Canvas)    │
                    └────────────┬────────────┘
                                 ▼
               Multi-Agent Orchestration Chain
 ┌─────────────────────────────────────────────────────────────┐
 │ 1. Planner Agent    ──> DAG topological sort & confidence   │
 │ 2. Execution Agent  ──> Dispatches steps + Interpolates ctx │
 │ 3. Validation Agent ──> Verifies output contracts & schema  │
 │ 4. Recovery Agent   ──> Error classification & backoff      │
 │ 5. Monitoring Agent ──> Socket.IO stream & audit logs       │
 └─────────────────────────────────────────────────────────────┘
                                 ▼
                    ┌─────────────────────────┐
                    │ Live Timeline & Alerts  │
                    └─────────────────────────┘
```

### 1. Dashboard (`/dashboard`)
- Metric KPI cards: Total Workflows, Active Automations, Total Executions, Success Rate %, Connected Integrations, and Agent Invocations.
- Recent execution cards and live multi-agent WebSocket feed.

### 2. AI Workflow Builder (`/workflows/builder`)
- Input any prompt (e.g. *"When a customer sends a feedback email, analyze sentiment with AI, log to Google Sheets, and notify Slack"*).
- Instant visual graph generation with draggable nodes and automated connections.
- Click **"Save & Run Now"** or **"Open in Canvas Editor"**.

### 3. Visual Workflow Editor (`/workflows/[id]`)
- **Left**: Draggable node palette (Triggers, AI Prompt, Gmail, Slack, Discord, Google Sheets, Condition, Transform).
- **Center**: Full React Flow canvas with pan, zoom, custom handles, and animated connections.
- **Right**: Parameter configuration inspector to edit prompts, channel names, queries, and conditions.
- **Top Bar**: Live dirty state tracker, Save button, and execution run modal.

### 4. Live Execution Audit & Timeline (`/executions/[id]`)
- Real-time Socket.IO live stream displaying chronological agent execution events.
- Color-coded agent badges:
  - 🟣 **Planner Agent**
  - 🔵 **Execution Agent**
  - 🟢 **Validation Agent**
  - 🟡 **Recovery Agent**
  - 🌐 **Monitoring Agent**
- Interactive **Pause**, **Resume**, and **Cancel** controls.
- Output JSON inspector and immutable workflow snapshot tabs.

### 5. Third-Party Integrations Hub (`/integrations`)
- Connect and manage OAuth integrations for Gmail, Slack, Discord, and Google Sheets.
- Connect API keys for OpenRouter and Gemini.
- Live health status and reconnect toggles.

---

## 📡 REST API Reference

### Health & Auth
- `GET /api/health` - System heartbeat, LangGraph availability, and queue status.
- `POST /api/auth/register` - Register a new operator/admin account.
- `POST /api/auth/login` - Authenticate user and receive JWT session.
- `GET /api/auth/me` - Fetch authenticated user profile.

### Workflows
- `GET /api/workflows/dashboard` - Aggregated workflow and execution metrics.
- `GET /api/workflows` - List user workflows with pagination and search.
- `POST /api/workflows` - Create a workflow manually.
- `POST /api/workflows/generate` - Generate visual workflow from prompt via AI.
- `GET /api/workflows/:id` - Fetch workflow structure and nodes.
- `PUT /api/workflows/:id` - Update existing workflow graph.
- `POST /api/workflows/:id/duplicate` - Clone an existing workflow.
- `POST /api/workflows/:id/execute` - Trigger an execution run.
- `DELETE /api/workflows/:id` - Delete a workflow.

### Executions
- `GET /api/executions` - List all execution runs.
- `GET /api/executions/:id` - Fetch single run details and snapshot.
- `GET /api/executions/:id/timeline` - Fetch detailed multi-agent timeline logs.
- `POST /api/executions/:id/pause` - Pause an active execution run.
- `POST /api/executions/:id/resume` - Resume a paused run.
- `POST /api/executions/:id/cancel` - Cancel a running execution.

### Integrations & Notifications
- `GET /api/integrations` - List user connected integrations.
- `GET /api/integrations/status` - Health check on OAuth connections.
- `GET /api/integrations/oauth/:provider/start` - Initiate OAuth flow.
- `GET /api/integrations/oauth/:provider/callback` - Handle OAuth token exchange.
- `POST /api/integrations` - Store manual API key / token (encrypted).
- `DELETE /api/integrations/:provider` - Disconnect integration.
- `GET /api/notifications` - List user notifications.
- `POST /api/notifications/read-all` - Mark all alerts as read.

---

## 🧪 Testing and Verification

To verify the system end-to-end:

1. **Verify Backend Health**:
   ```bash
   curl http://localhost:5000/api/health
   ```
2. **Build Client for Production**:
   ```bash
   npm run build:client
   ```

---

## 🛡️ Security Best Practices Implemented

- **Password Hashing**: Bcrypt with cost factor 12.
- **JWT Authorization**: Signed tokens with user role separation (`admin` / `operator`).
- **Data Encryption**: OAuth tokens encrypted at rest using AES-256-GCM (`CREDENTIAL_ENCRYPTION_KEY`).
- **HTTP Hardening**: Helmet security headers, CORS origin restrictions, Morgan logging, and Gzip compression.
- **Rate Limiting**: Auth endpoints protected via `express-rate-limit`.
- **Validation**: Strict schema checks via `express-validator` across all incoming request bodies.

---

**Agentflow_AI** &bull; Designed and built for seamless multi-agent operations automation.
