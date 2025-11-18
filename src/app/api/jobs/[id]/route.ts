import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, successResponse, ApiError } from "@/lib/api-response";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/jobs/[id] - Get a single job
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        workflow: true,
      },
    });

    if (!job) {
      throw new ApiError(404, "Job not found", "NOT_FOUND");
    }

    return successResponse(job);
  } catch (error) {
    return handleApiError(error);
  }
}
