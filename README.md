# AI Exec OS Dashboard

A modern, full-stack dashboard for managing AI execution workflows. Built with Next.js 15, this application provides a complete solution for orchestrating AI agents, managing workflows, and monitoring job executions.

## Overview

AI Exec OS Dashboard is a production-ready application that demonstrates enterprise-grade architecture with:

- **Vertical Integration**: Complete CRUD operations from database to UI
- **Type Safety**: End-to-end TypeScript with Prisma and Zod validation
- **Modern Stack**: Next.js 15 App Router with React Query for optimal UX
- **Production Ready**: Docker deployment, comprehensive testing, and error handling

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Library**: React 18
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: TanStack React Query (v5)
- **Icons**: Lucide React

### Backend
- **API**: Next.js API Routes (serverless functions)
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod schemas
- **Error Handling**: Centralized error handling with type-safe responses

### DevOps
- **Containerization**: Docker + Docker Compose
- **Testing**: Vitest with 26 passing tests
- **Database Migrations**: Prisma Migrate
- **Code Quality**: ESLint + TypeScript

## Domain Model

The system manages three core entities:

### Agent
Autonomous AI workers that perform specific tasks.
- **Fields**: id, name, type, status (active/inactive/error), config (JSON), timestamps
- **Examples**: Data Scraper, Email Processor, Report Generator

### Workflow
Orchestrated sequences of tasks and logic.
- **Fields**: id, name, description, status (active/inactive), config (JSON), timestamps
- **Relationships**: One-to-many with Jobs
- **Examples**: Daily Data Sync, Email Processing Pipeline

### Job
Individual workflow executions with status tracking.
- **Fields**: id, workflowId, workflowName, status (pending/running/completed/failed), startedAt, completedAt, error, result (JSON), timestamps
- **Auto-tracked**: Execution time, error details, results

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Docker and Docker Compose (for containerized setup)
- PostgreSQL 16 (if running without Docker)

### Quick Start with Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-exec-os-dashboard
   ```

2. **Copy environment variables**
   ```bash
   cp .env.example .env
   ```

3. **Start the application**
   ```bash
   docker compose up
   ```

4. **Access the application**
   - Dashboard: http://localhost:3000
   - Database: localhost:5432

The Docker setup automatically:
- Starts PostgreSQL database
- Runs database migrations
- Seeds initial data
- Starts the Next.js application

### Local Development Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_exec_os?schema=public"
   NEXT_PUBLIC_CORE_API_BASE_URL=/api
   NEXT_PUBLIC_ENVIRONMENT=local
   ```

3. **Start PostgreSQL**
   ```bash
   # Using Docker
   docker run --name ai-exec-os-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ai_exec_os -p 5432:5432 -d postgres:16-alpine

   # Or use your local PostgreSQL installation
   ```

4. **Run database migrations**
   ```bash
   npm run db:push
   ```

5. **Seed the database**
   ```bash
   npm run db:seed
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   - Navigate to http://localhost:3000
   - You'll be redirected to `/dashboard`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Create production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run all tests with Vitest |
| `npm run test:ui` | Run tests with UI interface |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:push` | Push schema changes to database |
| `npm run db:migrate` | Create and run migrations |
| `npm run db:seed` | Seed database with demo data |
| `npm run db:studio` | Open Prisma Studio (database GUI) |

## Vertical Slice: Agents CRUD

This application implements a complete vertical slice for **Agents**:

### 1. Create Agent
- **Frontend**: Modal form with validation (`/agents`)
- **API**: `POST /api/agents`
- **Validation**: Zod schema ensures name and type are present
- **Database**: Prisma creates record with auto-generated ID

### 2. List Agents
- **Frontend**: Data table with status badges and actions
- **API**: `GET /api/agents`
- **Features**: Ordered by creation date, real-time updates via React Query

### 3. View Agent Details
- **API**: `GET /api/agents/:id`
- **Response**: Full agent data including config JSON

### 4. Update Agent
- **API**: `PATCH /api/agents/:id`
- **Validation**: Partial updates supported
- **Fields**: Name, type, status, config

### 5. Delete Agent
- **Frontend**: Confirmation dialog with optimistic updates
- **API**: `DELETE /api/agents/:id`
- **Behavior**: Immediate removal from UI

### Testing the Flow

1. Start the application
2. Navigate to http://localhost:3000/agents
3. Click "New Agent" to create an agent
4. Fill in the form (Name: "Test Agent", Type: "test")
5. View the agent in the table
6. Click delete icon to remove it

## Demo Data

The seed script (`npm run db:seed`) creates realistic demo data:

### Agents (4 total)
- Data Scraper Agent (active)
- Email Processor Agent (active)
- Report Generator Agent (inactive)
- Monitoring Agent (active)

### Workflows (4 total)
- Daily Data Sync (active)
- Email Processing Pipeline (active)
- Weekly Analytics Report (inactive)
- Real-time Monitoring (active)

### Jobs (5 total)
- 2 completed jobs with results
- 1 running job
- 1 failed job with error details
- 1 pending job

## API Documentation

### Response Format

All API endpoints return a standardized response:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": { ... }
  }
}
```

### Agent Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/agents` | List all agents |
| POST | `/api/agents` | Create new agent |
| GET | `/api/agents/:id` | Get agent details |
| PATCH | `/api/agents/:id` | Update agent |
| DELETE | `/api/agents/:id` | Delete agent |

### Workflow Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workflows` | List all workflows |
| POST | `/api/workflows` | Create new workflow |
| GET | `/api/workflows/:id` | Get workflow details |
| PATCH | `/api/workflows/:id` | Update workflow |
| DELETE | `/api/workflows/:id` | Delete workflow |
| POST | `/api/workflows/:id/trigger` | Trigger workflow execution |

### Job Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | List all jobs (last 100) |
| GET | `/api/jobs/:id` | Get job details |

### Dashboard Endpoint

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get dashboard statistics |

## Testing

The project includes comprehensive tests for business logic:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui
```

**Test Coverage:**
- Validation schemas (16 tests)
- API response handling (10 tests)
- Error handling for all error types
- Success response formatting

## Database Management

### View Data (Prisma Studio)
```bash
npm run db:studio
```
Opens GUI at http://localhost:5555

### Create Migration
```bash
npm run db:migrate
```
Creates migration file and applies it

### Reset Database
```bash
npx prisma migrate reset
```
⚠️ Destructive: Drops database, runs all migrations, seeds data

## Project Structure

```
ai-exec-os-dashboard/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed script
├── src/
│   ├── app/
│   │   ├── (dashboard)/       # Dashboard route group
│   │   │   ├── agents/        # Agents page
│   │   │   ├── workflows/     # Workflows page
│   │   │   ├── jobs/          # Jobs page
│   │   │   ├── dashboard/     # Dashboard page
│   │   │   └── layout.tsx     # Dashboard layout
│   │   ├── api/               # API routes
│   │   │   ├── agents/        # Agent CRUD endpoints
│   │   │   ├── workflows/     # Workflow endpoints
│   │   │   ├── jobs/          # Job endpoints
│   │   │   └── dashboard/     # Stats endpoint
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Root page (redirects)
│   │   ├── providers.tsx      # React Query provider
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── layout/            # Layout components
│   │   │   ├── sidebar.tsx    # Navigation sidebar
│   │   │   └── header.tsx     # Top header with env badge
│   │   └── ui/                # shadcn/ui components
│   ├── hooks/                 # React Query hooks
│   │   ├── useAgents.ts
│   │   ├── useWorkflows.ts
│   │   ├── useJobs.ts
│   │   └── useDashboard.ts
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── apiClient.ts       # API fetch wrapper
│   │   ├── validations.ts     # Zod schemas
│   │   ├── api-response.ts    # Error handling
│   │   └── utils.ts           # Utility functions
│   └── types/
│       └── index.ts           # TypeScript types
├── tests/
│   ├── lib/                   # Unit tests
│   └── setup.ts               # Test setup
├── docker-compose.yml         # Docker orchestration
├── Dockerfile                 # Production container
├── vitest.config.ts           # Test configuration
└── package.json               # Dependencies and scripts
```

## Future Extensions

### Near-term Enhancements
- **Real-time Updates**: WebSocket integration for live job status
- **Agent Execution**: Actual agent runners instead of mock execution
- **Workflow Builder**: Visual workflow designer with drag-and-drop
- **Advanced Scheduling**: Cron-based workflow triggers
- **User Authentication**: NextAuth.js integration

### Medium-term Features
- **Audit Logs**: Track all system changes
- **Notifications**: Email/Slack alerts for job failures
- **Analytics Dashboard**: Execution metrics and trends
- **API Rate Limiting**: Protect endpoints from abuse
- **Multi-tenancy**: Support multiple organizations

### Long-term Vision
- **Agent Marketplace**: Discover and install community agents
- **Workflow Templates**: Pre-built workflow patterns
- **LLM Integration**: Natural language workflow creation
- **Distributed Execution**: Kubernetes-based job runners
- **Plugin System**: Extensible architecture for custom integrations

## License

MIT
