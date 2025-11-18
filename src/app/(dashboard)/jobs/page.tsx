"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingPage } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { StatusBadge } from "@/components/ui/status-badge";
import { useJobs, useJob } from "@/hooks/useJobs";
import { Eye } from "lucide-react";

export default function JobsPage() {
  const { data: jobs, isLoading, error } = useJobs();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const { data: selectedJob } = useJob(selectedJobId || "");

  if (isLoading) return <LoadingPage />;
  if (error) return <ErrorMessage message={(error as Error).message} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Jobs</h1>
        <p className="text-muted-foreground">
          Monitor workflow execution jobs
        </p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Workflow</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Started At</TableHead>
              <TableHead>Completed At</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs && jobs.length > 0 ? (
              jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-mono text-sm">
                    {job.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>{job.workflowName}</TableCell>
                  <TableCell>
                    <StatusBadge status={job.status} />
                  </TableCell>
                  <TableCell>
                    {job.startedAt
                      ? new Date(job.startedAt).toLocaleString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {job.completedAt
                      ? new Date(job.completedAt).toLocaleString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedJobId(job.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  No jobs found. Trigger a workflow to create jobs.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!selectedJobId}
        onOpenChange={(open) => !open && setSelectedJobId(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Job Details</DialogTitle>
            <DialogDescription>
              View detailed information about this job
            </DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Job ID
                  </h4>
                  <p className="font-mono text-sm">{selectedJob.id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Workflow
                  </h4>
                  <p>{selectedJob.workflowName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Status
                  </h4>
                  <StatusBadge status={selectedJob.status} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Started At
                  </h4>
                  <p>
                    {selectedJob.startedAt
                      ? new Date(selectedJob.startedAt).toLocaleString()
                      : "-"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Completed At
                  </h4>
                  <p>
                    {selectedJob.completedAt
                      ? new Date(selectedJob.completedAt).toLocaleString()
                      : "-"}
                  </p>
                </div>
              </div>
              {selectedJob.error && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Error
                  </h4>
                  <div className="p-4 bg-destructive/10 border border-destructive/50 rounded-lg">
                    <p className="text-sm text-destructive font-mono">
                      {selectedJob.error}
                    </p>
                  </div>
                </div>
              )}
              {selectedJob.result !== undefined && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Result
                  </h4>
                  <div className="p-4 bg-muted rounded-lg">
                    <pre className="text-sm overflow-auto">
                      {JSON.stringify(selectedJob.result, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
