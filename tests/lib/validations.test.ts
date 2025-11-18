import { describe, it, expect } from "vitest";
import {
  createAgentSchema,
  updateAgentSchema,
  createWorkflowSchema,
  updateWorkflowSchema,
} from "@/lib/validations";

describe("Agent Validations", () => {
  describe("createAgentSchema", () => {
    it("should validate valid agent data", () => {
      const validData = {
        name: "Test Agent",
        type: "scraper",
        config: { url: "https://example.com" },
      };

      const result = createAgentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject agent with empty name", () => {
      const invalidData = {
        name: "",
        type: "scraper",
      };

      const result = createAgentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject agent with missing type", () => {
      const invalidData = {
        name: "Test Agent",
      };

      const result = createAgentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept agent without config", () => {
      const validData = {
        name: "Test Agent",
        type: "scraper",
      };

      const result = createAgentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject agent with too long name", () => {
      const invalidData = {
        name: "a".repeat(101),
        type: "scraper",
      };

      const result = createAgentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("updateAgentSchema", () => {
    it("should validate partial update", () => {
      const validData = {
        name: "Updated Name",
      };

      const result = updateAgentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate status update", () => {
      const validData = {
        status: "inactive",
      };

      const result = updateAgentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid status", () => {
      const invalidData = {
        status: "invalid_status",
      };

      const result = updateAgentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

describe("Workflow Validations", () => {
  describe("createWorkflowSchema", () => {
    it("should validate valid workflow data", () => {
      const validData = {
        name: "Test Workflow",
        description: "Test description",
        config: { schedule: "0 0 * * *" },
      };

      const result = createWorkflowSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject workflow with empty name", () => {
      const invalidData = {
        name: "",
        description: "Test description",
      };

      const result = createWorkflowSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject workflow with missing description", () => {
      const invalidData = {
        name: "Test Workflow",
      };

      const result = createWorkflowSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject workflow with too long description", () => {
      const invalidData = {
        name: "Test Workflow",
        description: "a".repeat(501),
      };

      const result = createWorkflowSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("updateWorkflowSchema", () => {
    it("should validate partial update", () => {
      const validData = {
        name: "Updated Name",
      };

      const result = updateWorkflowSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate status update", () => {
      const validData = {
        status: "inactive",
      };

      const result = updateWorkflowSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid status", () => {
      const invalidData = {
        status: "invalid_status",
      };

      const result = updateWorkflowSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should allow empty update object", () => {
      const validData = {};

      const result = updateWorkflowSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
