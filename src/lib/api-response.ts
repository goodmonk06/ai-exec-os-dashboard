import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export type ApiResponse<T = unknown> = {
  success: true;
  data: T;
} | {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
};

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error("API Error:", error);

  // Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Validation failed",
          code: "VALIDATION_ERROR",
          details: error.errors,
        },
      },
      { status: 400 }
    );
  }

  // Custom API errors
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
        },
      },
      { status: error.statusCode }
    );
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Resource already exists",
            code: "DUPLICATE_ERROR",
            details: error.meta,
          },
        },
        { status: 409 }
      );
    }
    if (error.code === "P2025") {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Resource not found",
            code: "NOT_FOUND",
          },
        },
        { status: 404 }
      );
    }
  }

  // Generic error
  return NextResponse.json(
    {
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Internal server error",
        code: "INTERNAL_ERROR",
      },
    },
    { status: 500 }
  );
}

export function successResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}
