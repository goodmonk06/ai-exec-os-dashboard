import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createWorkflowSchema } from "@/lib/validations";
import { handleApiError, successResponse } from "@/lib/api-response";

// GET /api/workflows - List all workflows
export async function GET() {
  try {
    const workflows = await prisma.workflow.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { jobs: true },
        },
      },
    });

    return successResponse(workflows);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/workflows - Create a new workflow
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createWorkflowSchema.parse(body);

    const workflow = await prisma.workflow.create({
      data: validatedData,
    });

    return successResponse(workflow, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
