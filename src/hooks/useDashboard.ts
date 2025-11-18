import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/apiClient";
import type { DashboardStats } from "@/types";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => apiGet<DashboardStats>("/dashboard/stats"),
  });
}
