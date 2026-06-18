import { useEffect, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ClipboardList, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SortableTaskCard from "@/components/SortableTaskCard";
import type { BoardColumn } from "@/types/column";
import type { Task } from "@/types/task";

export const columnDroppableId = (columnId: number) => `column-${columnId}`;

interface BoardColumnCardProps {
  column: BoardColumn;
  tasks: Task[];
  onRename: (id: number, name: string) => Promise<void>;
  onDelete: (id: number) => void;
  onAddTask: (columnId: number) => void;
  onEditTask: (task: Task) => void;
}

export default function BoardColumnCard({
  column,
  tasks,
  onRename,
  onDelete,
  onAddTask,
  onEditTask,
}: BoardColumnCardProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(column.name);
  const [saving, setSaving] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);

  const { setNodeRef, isOver } = useDroppable({
    id: columnDroppableId(column.id),
  });

  useEffect(() => {
    setName(column.name);
  }, [column.name]);

  async function saveName() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === column.name) {
      setName(column.name);
      setEditing(false);
      return;
    }

    setSaving(true);
    setRenameError(null);
    try {
      await onRename(column.id, trimmed);
      setEditing(false);
    } catch {
      setRenameError("Failed to rename. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const headingId = `column-heading-${column.id}`;

  return (
    <div
      role="region"
      aria-labelledby={headingId}
      className={`flex w-72 shrink-0 flex-col rounded-xl border bg-black/40 backdrop-blur-sm transition-colors ${
        isOver
          ? "border-primary/60 bg-primary/10 ring-2 ring-primary/20"
          : "border-white/10"
      }`}
    >
      {/* Column header */}
      <div className="flex items-start justify-between gap-2 border-b border-white/10 p-4">
        {editing ? (
          <div className="flex flex-1 flex-col gap-1">
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                saveName();
              }}
              aria-label={`Rename column ${column.name}`}
            >
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                className="h-8 border-white/10 bg-white/5 text-white"
                aria-label="New column name"
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setName(column.name);
                    setEditing(false);
                    setRenameError(null);
                  }
                }}
              />
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? "…" : "Save"}
              </Button>
            </form>
            {renameError && (
              <p className="text-xs text-red-400">{renameError}</p>
            )}
          </div>
        ) : (
          <>
            <div>
              <h3 id={headingId} className="font-semibold leading-tight text-white/90">
                {column.name}
              </h3>
              <p className="mt-1 text-xs text-white/40">
                {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
              </p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white/50 hover:bg-white/10 hover:text-white"
                onClick={() => setEditing(true)}
                aria-label={`Rename column ${column.name}`}
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-400/60 hover:bg-red-950/30 hover:text-red-400"
                onClick={() => onDelete(column.id)}
                aria-label={`Delete column ${column.name}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Task list */}
      <div
        ref={setNodeRef}
        className="flex flex-col gap-2 overflow-y-auto p-3"
        style={{ minHeight: 120, maxHeight: "calc(100vh - 22rem)" }}
        aria-label={`Tasks in ${column.name}`}
      >
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <span className="rounded-full border border-white/10 bg-white/5 p-2 text-white/30">
                <ClipboardList className="h-4 w-4" aria-hidden="true" />
              </span>
              <p className="text-xs text-white/30">No tasks yet</p>
            </div>
          ) : (
            tasks.map((task) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                onEdit={onEditTask}
              />
            ))
          )}
        </SortableContext>
      </div>

      {/* Add task */}
      <div className="border-t border-white/10 p-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-white/50 hover:bg-white/10 hover:text-white"
          onClick={() => onAddTask(column.id)}
          aria-label={`Add task to ${column.name}`}
        >
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Add task
        </Button>
      </div>
    </div>
  );
}
