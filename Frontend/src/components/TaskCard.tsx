import { Calendar } from "lucide-react";
import type { Task } from "@/types/task";

function formatDueDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isOverdue(date: string): boolean {
  const due = new Date(date);
  due.setHours(23, 59, 59, 999);
  return due < new Date();
}

function isDueSoon(date: string): boolean {
  const due = new Date(date);
  const today = new Date();
  const diffMs = due.getTime() - today.getTime();
  return diffMs >= 0 && diffMs <= 2 * 24 * 60 * 60 * 1000;
}

export default function TaskCard({
  task,
  onClick,
  isDragging = false,
  isOverlay = false,
}: {
  task: Task;
  onClick?: () => void;
  isDragging?: boolean;
  isOverlay?: boolean;
}) {
  const overdue = task.due_date ? isOverdue(task.due_date) : false;
  const dueSoon = task.due_date && !overdue ? isDueSoon(task.due_date) : false;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Edit task: ${task.title}${task.due_date ? `, due ${formatDueDate(task.due_date)}` : ""}`}
      className={`w-full rounded-lg border border-white/10 bg-white/5 p-3 text-left shadow-sm backdrop-blur-sm transition-all ${
        isOverlay
          ? "rotate-2 scale-105 shadow-xl ring-2 ring-primary/40"
          : "hover:border-white/20 hover:bg-white/10"
      } ${isDragging ? "cursor-grabbing" : "cursor-grab"} focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70`}
    >
      <p className="text-sm font-medium leading-snug text-white/90">
        {task.title}
      </p>
      {task.due_date && (
        <div
          className={`mt-2 flex items-center gap-1.5 text-xs ${
            overdue ? "text-red-400" : dueSoon ? "text-amber-400" : "text-white/40"
          }`}
        >
          <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
          <span>
            {overdue && <span className="sr-only">Overdue: </span>}
            {dueSoon && !overdue && <span className="sr-only">Due soon: </span>}
            {formatDueDate(task.due_date)}
          </span>
        </div>
      )}
    </button>
  );
}
