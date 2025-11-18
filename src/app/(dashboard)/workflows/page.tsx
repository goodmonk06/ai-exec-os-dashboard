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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingPage } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  useWorkflows,
  useCreateWorkflow,
  useTriggerWorkflow,
} from "@/hooks/useWorkflows";
import { Plus, Play } from "lucide-react";

export default function WorkflowsPage() {
  const { data: workflows, isLoading, error } = useWorkflows();
  const createWorkflow = useCreateWorkflow();
  const triggerWorkflow = useTriggerWorkflow();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createWorkflow.mutateAsync(formData);
      setFormData({ name: "", description: "" });
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to create workflow:", error);
    }
  };

  const handleTrigger = async (id: string) => {
    try {
      await triggerWorkflow.mutateAsync(id);
    } catch (error) {
      console.error("Failed to trigger workflow:", error);
    }
  };

  if (isLoading) return <LoadingPage />;
  if (error) return <ErrorMessage message={(error as Error).message} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflows</h1>
          <p className="text-muted-foreground">Manage and trigger workflows</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Workflow
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Workflow</DialogTitle>
              <DialogDescription>
                Add a new workflow to your system
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Workflow name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Workflow description"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createWorkflow.isPending}>
                  {createWorkflow.isPending ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workflows && workflows.length > 0 ? (
              workflows.map((workflow) => (
                <TableRow key={workflow.id}>
                  <TableCell className="font-medium">{workflow.name}</TableCell>
                  <TableCell>{workflow.description}</TableCell>
                  <TableCell>
                    <StatusBadge status={workflow.status} />
                  </TableCell>
                  <TableCell>
                    {new Date(workflow.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleTrigger(workflow.id)}
                      disabled={
                        triggerWorkflow.isPending || workflow.status === "inactive"
                      }
                      title="Trigger workflow"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  No workflows found. Create your first workflow to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
