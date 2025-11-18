import { prisma } from "@/lib/prisma";
import { handleApiError, successResponse } from "@/lib/api-response";

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [agentCount, workflowCount, todayJobCount, runningJobCount] = await Promise.all([
      prisma.agent.count(),
      prisma.workflow.count({ where: { status: "active" } }),
      prisma.job.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      }),
      prisma.job.count({
        where: {
          status: "running",
        },
      }),
    ]);

    return successResponse({
      agentCount,
      workflowCount,
      todayJobCount,
      runningJobCount,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
