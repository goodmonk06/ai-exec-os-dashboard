import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAgentSchema } from "@/lib/validations";
import { handleApiError, successResponse } from "@/lib/api-response";

// GET /api/agents - List all agents
export async function GET() {
  try {
    const agents = await prisma.agent.findMany({
      orderBy: { createdAt: "desc" },
    });

    return successResponse(agents);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/agents - Create a new agent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createAgentSchema.parse(body);

    const agent = await prisma.agent.create({
      data: validatedData,
    });

    return successResponse(agent, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
