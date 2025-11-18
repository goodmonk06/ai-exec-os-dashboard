import { Badge, type BadgeProps } from "./badge";

type JobStatus = "pending" | "running" | "completed" | "failed";
type AgentStatus = "active" | "inactive" | "error";
type WorkflowStatus = "active" | "inactive";

interface StatusBadgeProps {
  status: JobStatus | AgentStatus | WorkflowStatus;
}

const statusConfig: Record<string, BadgeProps["variant"]> = {
  pending: "secondary",
  running: "warning",
  completed: "success",
  failed: "destructive",
  active: "success",
  inactive: "secondary",
  error: "destructive",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const variant = statusConfig[status] || "default";

  return <Badge variant={variant}>{status.toUpperCase()}</Badge>;
}
