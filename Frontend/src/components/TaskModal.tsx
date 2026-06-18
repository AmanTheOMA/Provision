import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ConfirmDialog from "@/components/ConfirmDialog";
import { getErrorMessage } from "@/lib/errors";
import type { Task, TaskPayload } from "@/types/task";

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initial?: Task | null;
  onSave: (payload: TaskPayload) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export default function TaskModal({
  open,
  onOpenChange,
  mode,
  initial,
  onSave,
  onDelete,
}: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? "");
      setDescription(initial?.description ?? "");
      setDueDate(initial?.due_date ? initial.due_date.slice(0, 10) : "");
      setError(null);
      setConfirmDeleteOpen(false);
    }
  }, [open, initial]);

  async function handleSave() {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || null,
        due_date: dueDate || null,
        ...(mode === "edit" && initial ? { position: initial.position } : {}),
      });
      onOpenChange(false);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to save task."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmDelete() {
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete();
      onOpenChange(false);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete task."));
      setConfirmDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  }

  const isDisabled = submitting || deleting;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Create task" : "Edit task"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Add a new task to this column."
                : "Update task details or delete the task."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="task-title" className="text-sm font-medium">
                Title <span className="text-red-400" aria-hidden="true">*</span>
              </label>
              <Input
                id="task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Finish README"
                disabled={isDisabled}
                aria-required="true"
                aria-describedby={error ? "task-error" : undefined}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="task-description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="task-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional details..."
                rows={4}
                disabled={isDisabled}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="task-due-date" className="text-sm font-medium">
                Due date
              </label>
              <Input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isDisabled}
              />
            </div>

            {error && (
              <p id="task-error" className="text-sm text-red-400" role="alert">
                {error}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            {mode === "edit" && onDelete ? (
              <Button
                variant="outline"
                className="text-red-400 hover:bg-red-950/30 hover:text-red-300 focus-visible:ring-red-600"
                onClick={() => setConfirmDeleteOpen(true)}
                disabled={isDisabled}
                aria-label="Delete this task"
              >
                Delete
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isDisabled}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isDisabled}
                aria-busy={submitting}
              >
                {submitting
                  ? "Saving…"
                  : mode === "create"
                    ? "Create"
                    : "Save"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Delete task?"
        description={`"${initial?.title ?? "This task"}" will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
