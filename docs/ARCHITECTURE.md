# Architecture Documentation

## System Overview

AI Exec OS Dashboard is a full-stack orchestration platform built on a modern, event-driven architecture. The system provides comprehensive management of AI agents, workflow orchestration, and execution monitoring with enterprise-grade observability and extensibility.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │Dashboard │  │ Agents   │  │Workflows │  │  Jobs    │       │
│  │   Page   │  │   Page   │  │   Page   │  │   Page   │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       │             │              │             │              │
│       └─────────────┴──────────────┴─────────────┘              │
│                         │                                        │
│                   React Query                                    │
│                         │                                        │
└─────────────────────────┼────────────────────────────────────────┘
                          │
┌─────────────────────────┼────────────────────────────────────────┐
│                   API Layer (Next.js Routes)                     │
│                         │                                        │
│  ┌──────────┬───────────┴────────────┬───────────┐             │
│  │          │                        │           │             │
│  ▼          ▼                        ▼           ▼             │
│ Agents   Workflows                 Jobs      Dashboard         │
│  API       API                      API        API             │
│  │         │                         │          │              │
│  └─────────┴─────────────────────────┴──────────┘              │
│                         │                                        │
│                   Validation Layer (Zod)                        │
│                         │                                        │
└─────────────────────────┼────────────────────────────────────────┘
                          │
┌─────────────────────────┼────────────────────────────────────────┐
│                   Domain Logic Layer                             │
│                         │                                        │
│  ┌─────────────────────┴────────────────────────┐              │
│  │                                                │              │
│  ▼                                                ▼              │
│ Service Layer                              Event System          │
│  │                                                │              │
│  ├─ Agent Service                                ├─ Event Bus   │
│  ├─ Workflow Service                             ├─ Handlers    │
│  ├─ Job Service                                  └─ Types       │
│  └─ Notification Service                                        │
│                         │                                        │
│  ┌──────────────────────┴─────────────────────────┐            │
│  │                                                  │            │
│  ▼                                                  ▼            │
│ Adapter Registry                           Observability         │
│  │                                                  │            │
│  ├─ Agent Providers                                ├─ Logger    │
│  │  ├─ Script                                      ├─ Metrics   │
│  │  ├─ API                                         └─ Tracing   │
│  │  └─ LLM                                                      │
│  │                                                               │
│  └─ Notification Adapters                                       │
│     ├─ Console                                                  │
│     ├─ Email                                                    │
│     ├─ Slack                                                    │
│     └─ Webhook                                                  │
│                                                                  │
└──────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────┼────────────────────────────────────────┐
│                   Data Layer                                     │
│                         │                                        │
│                    Prisma ORM                                    │
│                         │                                        │
│  ┌──────────────────────┴─────────────────────────┐            │
│  │              PostgreSQL Database                │            │
│  │                                                  │            │
│  │  Core Entities:                                 │            │
│  │  • Agent              • Workflow                │            │
│  │  • Job                • WorkflowStep            │            │
│  │                                                  │            │
│  │  History & Execution:                           │            │
│  │  • AgentExecution     • StepExecution           │            │
│  │                                                  │            │
│  │  Compliance & Notifications:                    │            │
│  │  • AuditLog           • Notification            │            │
│  │                                                  │            │
│  │  Tagging & Organization:                        │            │
│  │  • Tag                • AgentTag                │            │
│  │  • WorkflowTag        • JobTag                  │            │
│  └──────────────────────────────────────────────────┘           │
└──────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Frontend Layer

**Technology**: React 18 + Next.js 15 App Router

**Key Features**:
- Server Components for optimal performance
- React Query for state management and caching
- shadcn/ui for consistent UI components
- Real-time updates via polling (future: WebSockets)

**Pages**:
- `/dashboard` - System overview with metrics cards
- `/agents` - Agent management (CRUD operations)
- `/workflows` - Workflow management and triggering
- `/jobs` - Job monitoring and execution history

### 2. API Layer

**Technology**: Next.js API Routes (Serverless)

**Features**:
- RESTful endpoints for all entities
- Zod validation for all inputs
- Centralized error handling
- Type-safe responses
- Request/response logging
- Metrics collection

**Endpoints**:
- `/api/agents` - Agent CRUD
- `/api/workflows` - Workflow CRUD + trigger
- `/api/jobs` - Job querying
- `/api/dashboard/stats` - Aggregated statistics

### 3. Domain Logic Layer

**Service Layer**:
- Business logic encapsulation
- Transaction management
- Cross-cutting concerns (auth, logging, metrics)

**Event System**:
- **Event Bus**: Central hub for all domain events
- **Event Types**: Strongly-typed event definitions
- **Handlers**: Asynchronous event processors
- **Use Cases**:
  - Audit logging
  - Notification triggering
  - Metrics collection
  - Side-effect orchestration

**Adapter System**:
- **Agent Providers**: Pluggable agent execution engines
  - Script Provider: JavaScript/TypeScript execution
  - API Provider: HTTP API interactions
  - LLM Provider: Large Language Model calls
- **Notification Adapters**: Multi-channel notification delivery
  - Console: Development logging
  - Email: SMTP delivery
  - Slack: Slack API integration
  - Webhook: HTTP POST notifications

### 4. Observability Infrastructure

**Logger** (`src/lib/logger.ts`):
- Structured JSON logging
- Context propagation (requestId, userId, traceId)
- Log levels: debug, info, warn, error
- Production vs. development formatting

**Metrics** (`src/lib/metrics.ts`):
- In-memory metrics storage
- Counter, Gauge, and Histogram types
- Percentile calculations (p50, p95, p99)
- Standard metrics:
  - API request count/duration
  - Database query performance
  - Job execution metrics
  - Agent execution metrics

**Event Tracking**:
- Domain event emission
- Handler execution monitoring
- Event processing duration

### 5. Data Layer

**ORM**: Prisma

**Database**: PostgreSQL

**Entity Categories**:

1. **Core Entities**:
   - `Agent`: AI workers with configurations
   - `Workflow`: Orchestrated task sequences
   - `Job`: Workflow execution instances
   - `WorkflowStep`: Individual workflow steps

2. **Execution & History**:
   - `AgentExecution`: Agent run history with I/O
   - `StepExecution`: Step-level execution tracking

3. **Compliance & Notifications**:
   - `AuditLog`: Change tracking for compliance
   - `Notification`: Multi-channel alert system

4. **Tagging & Organization**:
   - `Tag`: Flexible categorization
   - Many-to-many joins for Agent, Workflow, Job

## Data Flow

### 1. Agent Creation Flow

```
User → Frontend → POST /api/agents
                      ↓
                 Zod Validation
                      ↓
                 Prisma.agent.create()
                      ↓
                 Event: AgentCreated
                      ↓
           ┌──────────┴──────────┐
           ↓                     ↓
     Audit Log Handler    Metrics Handler
           ↓                     ↓
   Create AuditLog         Increment Counter
```

### 2. Workflow Trigger Flow

```
User → Frontend → POST /api/workflows/:id/trigger
                           ↓
                  Check workflow status
                           ↓
                  Create Job (pending)
                           ↓
                  Event: WorkflowTriggered
                           ↓
           ┌───────────────┴────────────────┐
           ↓                                 ↓
    Job Executor                      Audit Logger
           ↓                                 ↓
  Update Job (running)              Create AuditLog
           ↓
  Execute Workflow Steps
           ↓
  ┌────────┴─────────┐
  ↓                  ↓
Success           Failure
  ↓                  ↓
Update Job      Update Job + Error
  ↓                  ↓
Event:          Event: JobFailed
JobCompleted          ↓
  ↓            Create Notification
Metrics
```

### 3. Agent Execution Flow

```
Step Execution Request
       ↓
Agent Provider Registry
       ↓
Get Provider for Type
       ↓
┌──────┴──────────────┬──────────────┐
↓                     ↓              ↓
Script Provider    API Provider   LLM Provider
↓                     ↓              ↓
Execute Script    HTTP Request   LLM API Call
↓                     ↓              ↓
└──────┬──────────────┴──────────────┘
       ↓
Create AgentExecution Record
       ↓
Event: AgentExecutionCompleted
       ↓
Metrics + Logging
```

## Extension Points

### 1. Custom Agent Providers

```typescript
class CustomAgentProvider implements IAgentProvider {
  name = "custom";
  supportedTypes = ["custom", "my-agent"];

  async execute(input: AgentExecutionInput): Promise<AgentExecutionResult> {
    // Your custom logic
  }

  validate(config: Record<string, unknown>): boolean {
    // Validation logic
  }

  async isAvailable(): Promise<boolean> {
    // Availability check
  }
}

// Register
agentProviderRegistry.register(new CustomAgentProvider());
```

### 2. Custom Notification Adapters

```typescript
class CustomNotificationAdapter implements INotificationAdapter {
  name = "custom";

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    // Your delivery logic
  }

  async isAvailable(): Promise<boolean> {
    // Availability check
  }
}

// Register
notificationRegistry.register(new CustomNotificationAdapter());
```

### 3. Custom Event Handlers

```typescript
eventEmitter.on("custom.event.type", async (event) => {
  // Handle custom event
  logger.info("Custom event handled", { event });
});
```

## Security Considerations

1. **Input Validation**: All API inputs validated via Zod schemas
2. **SQL Injection**: Prevented via Prisma ORM (parameterized queries)
3. **XSS Protection**: React's built-in XSS prevention
4. **CSRF**: Next.js built-in CSRF protection
5. **Audit Trail**: All mutations logged in AuditLog
6. **Error Handling**: Errors sanitized before client response

## Performance Optimizations

1. **Database Indexes**: Strategic indexes on frequently queried fields
2. **React Query Caching**: Reduces redundant API calls
3. **Server Components**: Reduces client-side JavaScript
4. **Next.js Image Optimization**: Automatic image optimization
5. **Connection Pooling**: Prisma connection pooling
6. **Lazy Loading**: Code splitting for routes

## Scalability Considerations

### Current Architecture (Single Instance)
- Suitable for: 100s of agents, 1000s of jobs/day
- Limitations: In-memory metrics, single-instance event bus

### Future Scaling Path
1. **Horizontal Scaling**: Multiple app instances behind load balancer
2. **Job Queue**: Redis-based queue for job execution
3. **Event Bus**: Replace in-memory with Redis Pub/Sub or RabbitMQ
4. **Metrics**: Export to Prometheus/DataDog
5. **Database**: Read replicas for query scaling
6. **Caching**: Redis for hot data
7. **CDN**: Static assets via CDN

## Development Workflow

1. **Local Development**: `npm run dev`
2. **Database Migrations**: `npm run db:migrate`
3. **Seed Data**: `npm run db:seed`
4. **Testing**: `npm test`
5. **Type Checking**: `npx tsc --noEmit`
6. **Linting**: `npm run lint`

## Deployment

### Docker

```bash
docker compose up
```

Includes:
- Application container
- PostgreSQL database
- Automatic migrations
- Seed data loading

### Production Considerations

1. **Environment Variables**: Set via secrets management
2. **Database**: Managed PostgreSQL (RDS, Cloud SQL, etc.)
3. **Monitoring**: Log aggregation (CloudWatch, Datadog)
4. **Metrics**: Export to monitoring service
5. **Health Checks**: `/health` endpoint for orchestration

## Future Enhancements

1. **Real-time Updates**: WebSocket integration
2. **Distributed Tracing**: OpenTelemetry integration
3. **Job Queue**: Bull/BullMQ for reliable job processing
4. **Rate Limiting**: API rate limiting per user/key
5. **GraphQL**: GraphQL API alongside REST
6. **Multi-tenancy**: Organization-based data isolation
7. **RBAC**: Role-based access control
8. **Workflow Designer**: Visual workflow builder UI
