import { prisma } from "@/lib/prisma";
import { handleApiError, successResponse } from "@/lib/api-response";

// GET /api/jobs - List all jobs
export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: "desc" },
      take: 100, // Limit to last 100 jobs
    });

    return successResponse(jobs);
  } catch (error) {
    return handleApiError(error);
  }
}
