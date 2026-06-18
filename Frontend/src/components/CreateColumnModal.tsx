import { useState } from "react";
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
import { getErrorMessage } from "@/lib/errors";

interface CreateColumnModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string) => Promise<void>;
}

export default function CreateColumnModal({
  open,
  onOpenChange,
  onCreate,
}: CreateColumnModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setName("");
    setError(null);
  }

  async function handleCreate() {
    if (!name.trim()) {
      setError("Column name is required.");
      return;
    }
    if (submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      await onCreate(name.trim());
      reset();
      onOpenChange(false);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to create column."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create column</DialogTitle>
          <DialogDescription>
            Add a new lane to your Kanban board.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label htmlFor="column-name" className="text-sm font-medium">
            Column name <span className="text-red-400" aria-hidden="true">*</span>
          </label>
          <Input
            id="column-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Backlog"
            disabled={submitting}
            aria-required="true"
            aria-describedby={error ? "create-column-error" : undefined}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
          />
          {error && (
            <p id="create-column-error" className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={submitting} aria-busy={submitting}>
            {submitting ? "Creating…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
