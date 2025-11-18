import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateWorkflowSchema } from "@/lib/validations";
import { handleApiError, successResponse, ApiError } from "@/lib/api-response";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/workflows/[id] - Get a single workflow
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const workflow = await prisma.workflow.findUnique({
      where: { id },
      include: {
        jobs: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!workflow) {
      throw new ApiError(404, "Workflow not found", "NOT_FOUND");
    }

    return successResponse(workflow);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/workflows/[id] - Update a workflow
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const validatedData = updateWorkflowSchema.parse(body);

    const workflow = await prisma.workflow.update({
      where: { id },
      data: validatedData,
    });

    return successResponse(workflow);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/workflows/[id] - Delete a workflow
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    await prisma.workflow.delete({
      where: { id },
    });

    return successResponse({ message: "Workflow deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
