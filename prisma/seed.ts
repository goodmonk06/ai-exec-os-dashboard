import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // Clear existing data
  await prisma.job.deleteMany();
  await prisma.workflow.deleteMany();
  await prisma.agent.deleteMany();

  // Seed agents
  const agents = await Promise.all([
    prisma.agent.create({
      data: {
        name: "Data Scraper Agent",
        type: "scraper",
        status: "active",
        config: {
          url: "https://example.com",
          interval: "1h",
        },
      },
    }),
    prisma.agent.create({
      data: {
        name: "Email Processor Agent",
        type: "processor",
        status: "active",
        config: {
          provider: "gmail",
          folder: "inbox",
        },
      },
    }),
    prisma.agent.create({
      data: {
        name: "Report Generator Agent",
        type: "generator",
        status: "inactive",
        config: {
          format: "pdf",
          schedule: "daily",
        },
      },
    }),
    prisma.agent.create({
      data: {
        name: "Monitoring Agent",
        type: "monitor",
        status: "active",
        config: {
          targets: ["api", "database", "cache"],
          alertThreshold: 90,
        },
      },
    }),
  ]);

  console.log(`Created ${agents.length} agents`);

  // Seed workflows
  const workflows = await Promise.all([
    prisma.workflow.create({
      data: {
        name: "Daily Data Sync",
        description: "Synchronize data from external sources daily",
        status: "active",
        config: {
          schedule: "0 0 * * *",
          retryCount: 3,
        },
      },
    }),
    prisma.workflow.create({
      data: {
        name: "Email Processing Pipeline",
        description: "Process incoming emails and extract actionable items",
        status: "active",
        config: {
          filters: ["important", "unread"],
          actions: ["categorize", "notify"],
        },
      },
    }),
    prisma.workflow.create({
      data: {
        name: "Weekly Analytics Report",
        description: "Generate and send weekly analytics report",
        status: "inactive",
        config: {
          schedule: "0 9 * * 1",
          recipients: ["team@example.com"],
        },
      },
    }),
    prisma.workflow.create({
      data: {
        name: "Real-time Monitoring",
        description: "Monitor system health and send alerts",
        status: "active",
        config: {
          interval: "5m",
          channels: ["slack", "email"],
        },
      },
    }),
  ]);

  console.log(`Created ${workflows.length} workflows`);

  // Seed jobs
  const jobs = await Promise.all([
    // Completed jobs
    prisma.job.create({
      data: {
        workflowId: workflows[0].id,
        workflowName: workflows[0].name,
        status: "completed",
        startedAt: new Date(Date.now() - 3600000),
        completedAt: new Date(Date.now() - 3000000),
        result: {
          recordsProcessed: 1250,
          duration: "10m",
          success: true,
        },
      },
    }),
    prisma.job.create({
      data: {
        workflowId: workflows[1].id,
        workflowName: workflows[1].name,
        status: "completed",
        startedAt: new Date(Date.now() - 7200000),
        completedAt: new Date(Date.now() - 6800000),
        result: {
          emailsProcessed: 45,
          categorized: 40,
          flagged: 5,
        },
      },
    }),
    // Running job
    prisma.job.create({
      data: {
        workflowId: workflows[3].id,
        workflowName: workflows[3].name,
        status: "running",
        startedAt: new Date(Date.now() - 300000),
      },
    }),
    // Failed job
    prisma.job.create({
      data: {
        workflowId: workflows[0].id,
        workflowName: workflows[0].name,
        status: "failed",
        startedAt: new Date(Date.now() - 14400000),
        completedAt: new Date(Date.now() - 14000000),
        error: "Connection timeout: Unable to connect to external data source",
      },
    }),
    // Pending job
    prisma.job.create({
      data: {
        workflowId: workflows[1].id,
        workflowName: workflows[1].name,
        status: "pending",
      },
    }),
  ]);

  console.log(`Created ${jobs.length} jobs`);
  console.log("Seeding finished.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
