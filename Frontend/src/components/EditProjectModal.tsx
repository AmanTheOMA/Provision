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
import { getErrorMessage } from "@/lib/errors";
import type { Project, ProjectVisibility } from "@/types/project";

interface EditProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  onSave: (name: string, visibility: ProjectVisibility) => Promise<void>;
}

export default function EditProjectModal({
  open,
  onOpenChange,
  project,
  onSave,
}: EditProjectModalProps) {
  const [name, setName] = useState(project.name);
  const [visibility, setVisibility] = useState<ProjectVisibility>(project.visibility);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Sync fields when a different project is passed in
  useEffect(() => {
    if (open) {
      setName(project.name);
      setVisibility(project.visibility);
      setError(null);
    }
  }, [open, project.name, project.visibility]);

  async function handleSave() {
    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      await onSave(name.trim(), visibility);
      onOpenChange(false);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to update project."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!submitting) onOpenChange(next); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit project</DialogTitle>
          <DialogDescription>
            Update the project name or visibility.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="edit-project-name" className="text-sm font-medium">
              Project name <span className="text-red-400" aria-hidden="true">*</span>
            </label>
            <Input
              id="edit-project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
              aria-required="true"
              aria-describedby={error ? "edit-project-error" : undefined}
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Visibility</legend>
            <div className="flex gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="edit-visibility"
                  value="public"
                  checked={visibility === "public"}
                  onChange={() => setVisibility("public")}
                  disabled={submitting}
                />
                <span>Public</span>
                <span className="text-xs text-muted-foreground">(visible to all)</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="edit-visibility"
                  value="private"
                  checked={visibility === "private"}
                  onChange={() => setVisibility("private")}
                  disabled={submitting}
                />
                <span>Private</span>
                <span className="text-xs text-muted-foreground">(only you)</span>
              </label>
            </div>
          </fieldset>

          {error && (
            <p id="edit-project-error" className="text-sm text-red-400" role="alert">
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
          <Button onClick={handleSave} disabled={submitting} aria-busy={submitting}>
            {submitting ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
