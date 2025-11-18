import { z } from "zod";

// Agent validation schemas
export const createAgentSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  type: z.string().min(1, "Type is required").max(50, "Type is too long"),
  config: z.record(z.unknown()).optional(),
});

export const updateAgentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.string().min(1).max(50).optional(),
  status: z.enum(["active", "inactive", "error"]).optional(),
  config: z.record(z.unknown()).optional(),
});

// Workflow validation schemas
export const createWorkflowSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().min(1, "Description is required").max(500, "Description is too long"),
  config: z.record(z.unknown()).optional(),
});

export const updateWorkflowSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(500).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  config: z.record(z.unknown()).optional(),
});

// Type exports for TypeScript
export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>;
export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>;
export type UpdateWorkflowInput = z.infer<typeof updateWorkflowSchema>;
