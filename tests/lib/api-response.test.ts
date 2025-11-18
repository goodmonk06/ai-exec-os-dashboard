import { describe, it, expect } from "vitest";
import { ZodError, z } from "zod";
import { ApiError, handleApiError, successResponse } from "@/lib/api-response";
import { Prisma } from "@prisma/client";

describe("API Response Utils", () => {
  describe("successResponse", () => {
    it("should create successful response with data", async () => {
      const testData = { id: "123", name: "Test" };
      const response = successResponse(testData);
      const json = await response.json();

      expect(json).toEqual({
        success: true,
        data: testData,
      });
      expect(response.status).toBe(200);
    });

    it("should create successful response with custom status", async () => {
      const testData = { id: "123" };
      const response = successResponse(testData, 201);

      expect(response.status).toBe(201);
    });
  });

  describe("handleApiError", () => {
    it("should handle ZodError with validation details", async () => {
      const schema = z.object({
        name: z.string().min(1),
      });

      try {
        schema.parse({ name: "" });
      } catch (error) {
        const response = handleApiError(error);
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json.success).toBe(false);
        expect(json.error.code).toBe("VALIDATION_ERROR");
        expect(json.error.message).toBe("Validation failed");
        expect(json.error.details).toBeDefined();
      }
    });

    it("should handle custom ApiError", async () => {
      const error = new ApiError(404, "Resource not found", "NOT_FOUND");
      const response = handleApiError(error);
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("NOT_FOUND");
      expect(json.error.message).toBe("Resource not found");
    });

    it("should handle Prisma duplicate error (P2002)", async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        "Unique constraint failed",
        {
          code: "P2002",
          clientVersion: "5.0.0",
          meta: { target: ["email"] },
        }
      );

      const response = handleApiError(prismaError);
      const json = await response.json();

      expect(response.status).toBe(409);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("DUPLICATE_ERROR");
    });

    it("should handle Prisma not found error (P2025)", async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        "Record not found",
        {
          code: "P2025",
          clientVersion: "5.0.0",
        }
      );

      const response = handleApiError(prismaError);
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("NOT_FOUND");
    });

    it("should handle generic Error", async () => {
      const error = new Error("Something went wrong");
      const response = handleApiError(error);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("INTERNAL_ERROR");
      expect(json.error.message).toBe("Something went wrong");
    });

    it("should handle unknown error", async () => {
      const error = "string error";
      const response = handleApiError(error);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("INTERNAL_ERROR");
    });
  });

  describe("ApiError class", () => {
    it("should create ApiError with all properties", () => {
      const error = new ApiError(
        400,
        "Bad request",
        "BAD_REQUEST",
        { field: "email" }
      );

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe("Bad request");
      expect(error.code).toBe("BAD_REQUEST");
      expect(error.details).toEqual({ field: "email" });
      expect(error.name).toBe("ApiError");
    });

    it("should create ApiError without optional properties", () => {
      const error = new ApiError(500, "Internal error");

      expect(error.statusCode).toBe(500);
      expect(error.message).toBe("Internal error");
      expect(error.code).toBeUndefined();
      expect(error.details).toBeUndefined();
    });
  });
});
