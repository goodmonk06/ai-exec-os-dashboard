import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateAgentSchema } from "@/lib/validations";
import { handleApiError, successResponse, ApiError } from "@/lib/api-response";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/agents/[id] - Get a single agent
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const agent = await prisma.agent.findUnique({
      where: { id },
    });

    if (!agent) {
      throw new ApiError(404, "Agent not found", "NOT_FOUND");
    }

    return successResponse(agent);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/agents/[id] - Update an agent
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const validatedData = updateAgentSchema.parse(body);

    const agent = await prisma.agent.update({
      where: { id },
      data: validatedData,
    });

    return successResponse(agent);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/agents/[id] - Delete an agent
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    await prisma.agent.delete({
      where: { id },
    });

    return successResponse({ message: "Agent deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
