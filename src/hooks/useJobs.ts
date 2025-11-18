import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/apiClient";
import type { Job } from "@/types";

export function useJobs() {
  return useQuery({
    queryKey: ["jobs"],
    queryFn: () => apiGet<Job[]>("/jobs"),
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: ["jobs", id],
    queryFn: () => apiGet<Job>(`/jobs/${id}`),
    enabled: !!id,
  });
}
