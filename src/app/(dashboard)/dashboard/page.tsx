"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingPage } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { useDashboardStats } from "@/hooks/useDashboard";
import { Bot, Workflow, BriefcaseBusiness, Clock } from "lucide-react";

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) return <LoadingPage />;
  if (error) return <ErrorMessage message={(error as Error).message} />;

  const cards = [
    {
      title: "Agents",
      value: stats?.agentCount || 0,
      icon: Bot,
      description: "Total registered agents",
    },
    {
      title: "Workflows",
      value: stats?.workflowCount || 0,
      icon: Workflow,
      description: "Active workflows",
    },
    {
      title: "Today's Jobs",
      value: stats?.todayJobCount || 0,
      icon: BriefcaseBusiness,
      description: "Jobs executed today",
    },
    {
      title: "Running Jobs",
      value: stats?.runningJobCount || 0,
      icon: Clock,
      description: "Currently running",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your AI Exec OS system
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
