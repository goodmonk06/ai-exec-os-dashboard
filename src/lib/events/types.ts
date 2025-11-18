// Base event interface
export interface DomainEvent<T = unknown> {
  id: string;
  type: string;
  timestamp: Date;
  data: T;
  metadata?: {
    userId?: string;
    source?: string;
    correlationId?: string;
    [key: string]: unknown;
  };
}

// Agent Events
export interface AgentCreatedData {
  agentId: string;
  name: string;
  type: string;
  status: string;
}

export interface AgentUpdatedData {
  agentId: string;
  changes: Record<string, unknown>;
}

export interface AgentDeletedData {
  agentId: string;
  name: string;
}

export interface AgentExecutionStartedData {
  executionId: string;
  agentId: string;
  agentName: string;
  input?: unknown;
}

export interface AgentExecutionCompletedData {
  executionId: string;
  agentId: string;
  agentName: string;
  status: string;
  duration?: number;
  output?: unknown;
}

// Workflow Events
export interface WorkflowCreatedData {
  workflowId: string;
  name: string;
  description: string;
}

export interface WorkflowUpdatedData {
  workflowId: string;
  changes: Record<string, unknown>;
}

export interface WorkflowTriggeredData {
  workflowId: string;
  workflowName: string;
  jobId: string;
  triggeredBy?: string;
}

// Job Events
export interface JobCreatedData {
  jobId: string;
  workflowId: string;
  workflowName: string;
  priority: number;
}

export interface JobStartedData {
  jobId: string;
  workflowId: string;
  workflowName: string;
  startedAt: Date;
}

export interface JobCompletedData {
  jobId: string;
  workflowId: string;
  workflowName: string;
  status: string;
  duration?: number;
  result?: unknown;
}

export interface JobFailedData {
  jobId: string;
  workflowId: string;
  workflowName: string;
  error: string;
  retryCount: number;
}

// Step Events
export interface StepExecutionStartedData {
  stepExecutionId: string;
  jobId: string;
  stepId: string;
  stepName: string;
}

export interface StepExecutionCompletedData {
  stepExecutionId: string;
  jobId: string;
  stepId: string;
  stepName: string;
  status: string;
  duration?: number;
  output?: unknown;
}

// Notification Events
export interface NotificationSentData {
  notificationId: string;
  channel: string;
  recipient: string;
  subject?: string;
}

export interface NotificationFailedData {
  notificationId: string;
  channel: string;
  error: string;
}

// Event type constants
export const EventTypes = {
  // Agent events
  AGENT_CREATED: "agent.created",
  AGENT_UPDATED: "agent.updated",
  AGENT_DELETED: "agent.deleted",
  AGENT_EXECUTION_STARTED: "agent.execution.started",
  AGENT_EXECUTION_COMPLETED: "agent.execution.completed",

  // Workflow events
  WORKFLOW_CREATED: "workflow.created",
  WORKFLOW_UPDATED: "workflow.updated",
  WORKFLOW_TRIGGERED: "workflow.triggered",

  // Job events
  JOB_CREATED: "job.created",
  JOB_STARTED: "job.started",
  JOB_COMPLETED: "job.completed",
  JOB_FAILED: "job.failed",

  // Step events
  STEP_EXECUTION_STARTED: "step.execution.started",
  STEP_EXECUTION_COMPLETED: "step.execution.completed",

  // Notification events
  NOTIFICATION_SENT: "notification.sent",
  NOTIFICATION_FAILED: "notification.failed",
} as const;

// Event handler type
export type EventHandler<T = unknown> = (
  event: DomainEvent<T>
) => void | Promise<void>;
