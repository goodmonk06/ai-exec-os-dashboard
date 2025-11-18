import { logger } from "../logger";
import { metrics, METRIC_NAMES } from "../metrics";
import { prisma } from "../prisma";
import { eventEmitter } from "./emitter";
import { EventTypes, type DomainEvent } from "./types";
import type {
  AgentCreatedData,
  AgentExecutionCompletedData,
  JobCompletedData,
  JobFailedData,
  WorkflowTriggeredData,
} from "./types";

/**
 * Handle agent creation - record metrics and audit log
 */
async function handleAgentCreated(event: DomainEvent<AgentCreatedData>) {
  const { agentId, name, type } = event.data;

  logger.info(`Agent created: ${name}`, { agentId, type });
  metrics.counter(METRIC_NAMES.AGENT_CREATED, 1, { type });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      entityType: "Agent",
      entityId: agentId,
      action: "create",
      actorId: event.metadata?.userId || "system",
      actorType: event.metadata?.userId ? "user" : "system",
      metadata: { name, type },
    },
  });
}

/**
 * Handle agent execution completion - record metrics
 */
async function handleAgentExecutionCompleted(
  event: DomainEvent<AgentExecutionCompletedData>
) {
  const { agentId, agentName, status, duration } = event.data;

  logger.info(`Agent execution completed: ${agentName}`, {
    agentId,
    status,
    duration,
  });

  metrics.counter(METRIC_NAMES.AGENT_EXECUTION_COUNT, 1, { status });

  if (duration) {
    metrics.histogram(METRIC_NAMES.AGENT_EXECUTION_DURATION, duration, {
      agentName,
      status,
    });
  }
}

/**
 * Handle workflow trigger - record metrics and audit log
 */
async function handleWorkflowTriggered(event: DomainEvent<WorkflowTriggeredData>) {
  const { workflowId, workflowName, jobId } = event.data;

  logger.info(`Workflow triggered: ${workflowName}`, { workflowId, jobId });
  metrics.counter(METRIC_NAMES.WORKFLOW_TRIGGERED, 1, { workflowName });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      entityType: "Workflow",
      entityId: workflowId,
      action: "trigger",
      actorId: event.metadata?.userId || "system",
      actorType: event.metadata?.userId ? "user" : "system",
      metadata: { jobId, workflowName },
    },
  });
}

/**
 * Handle job completion - record metrics and potentially send notifications
 */
async function handleJobCompleted(event: DomainEvent<JobCompletedData>) {
  const { jobId, workflowName, duration, status } = event.data;

  logger.info(`Job completed: ${workflowName}`, { jobId, status, duration });

  metrics.counter(METRIC_NAMES.JOB_COMPLETED, 1, { status, workflowName });

  if (duration) {
    metrics.histogram(METRIC_NAMES.JOB_DURATION, duration, {
      workflowName,
      status,
    });
  }

  // TODO: Check notification rules and send notifications if needed
  // This would integrate with the notification system
}

/**
 * Handle job failure - record metrics and send alert
 */
async function handleJobFailed(event: DomainEvent<JobFailedData>) {
  const { jobId, workflowName, error, retryCount } = event.data;

  logger.error(`Job failed: ${workflowName}`, new Error(error), {
    jobId,
    retryCount,
  });

  metrics.counter(METRIC_NAMES.JOB_FAILED, 1, { workflowName });

  // Create notification for job failure
  await prisma.notification.create({
    data: {
      jobId,
      channel: "console",
      status: "pending",
      recipient: "system",
      subject: `Job Failed: ${workflowName}`,
      message: `Job ${jobId} failed with error: ${error}. Retry count: ${retryCount}`,
      metadata: { workflowName, error, retryCount },
    },
  });
}

/**
 * Global event logger for debugging
 */
async function logAllEvents(event: DomainEvent) {
  if (process.env.LOG_ALL_EVENTS === "true") {
    logger.debug(`[EVENT] ${event.type}`, {
      eventId: event.id,
      data: event.data,
      metadata: event.metadata,
    });
  }
}

/**
 * Register all event handlers
 */
export function registerEventHandlers() {
  // Agent events
  eventEmitter.on(EventTypes.AGENT_CREATED, handleAgentCreated);
  eventEmitter.on(EventTypes.AGENT_EXECUTION_COMPLETED, handleAgentExecutionCompleted);

  // Workflow events
  eventEmitter.on(EventTypes.WORKFLOW_TRIGGERED, handleWorkflowTriggered);

  // Job events
  eventEmitter.on(EventTypes.JOB_COMPLETED, handleJobCompleted);
  eventEmitter.on(EventTypes.JOB_FAILED, handleJobFailed);

  // Global logger (if enabled)
  eventEmitter.onAll(logAllEvents);

  logger.info("Event handlers registered", {
    handlerCount: eventEmitter.getHandlerCount(),
  });
}
