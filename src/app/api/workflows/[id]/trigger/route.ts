import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, successResponse, ApiError } from "@/lib/api-response";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// POST /api/workflows/[id]/trigger - Trigger a workflow execution
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    // Check if workflow exists and is active
    const workflow = await prisma.workflow.findUnique({
      where: { id },
    });

    if (!workflow) {
      throw new ApiError(404, "Workflow not found", "NOT_FOUND");
    }

    if (workflow.status !== "active") {
      throw new ApiError(400, "Workflow is not active", "WORKFLOW_INACTIVE");
    }

    // Create a new job for this workflow
    const job = await prisma.job.create({
      data: {
        workflowId: workflow.id,
        workflowName: workflow.name,
        status: "pending",
      },
    });

    // Simulate async job execution (in real app, this would be a background job)
    // For now, we'll just update it to running
    setTimeout(async () => {
      try {
        await prisma.job.update({
          where: { id: job.id },
          data: {
            status: "running",
            startedAt: new Date(),
          },
        });

        // Simulate job completion after 2 seconds
        setTimeout(async () => {
          await prisma.job.update({
            where: { id: job.id },
            data: {
              status: "completed",
              completedAt: new Date(),
              result: {
                message: "Workflow executed successfully",
                workflowName: workflow.name,
              },
            },
          });
        }, 2000);
      } catch (error) {
        console.error("Error updating job:", error);
      }
    }, 100);

    return successResponse({
      message: "Workflow triggered successfully",
      job,
    }, 202);
  } catch (error) {
    return handleApiError(error);
  }
}
