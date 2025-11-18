export interface Agent {
  id: string;
  name: string;
  type: string;
  status: "active" | "inactive" | "error";
  createdAt: string;
  updatedAt: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  workflowId: string;
  workflowName: string;
  status: "pending" | "running" | "completed" | "failed";
  startedAt?: string;
  completedAt?: string;
  error?: string;
  result?: unknown;
}

export interface DashboardStats {
  agentCount: number;
  workflowCount: number;
  todayJobCount: number;
  runningJobCount: number;
}

export interface CreateAgentInput {
  name: string;
  type: string;
}

export interface CreateWorkflowInput {
  name: string;
  description: string;
}
