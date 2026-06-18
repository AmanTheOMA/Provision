import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Columns3, ListTodo, LogOut, Pencil } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getErrorMessage } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import KanbanBoard from "@/components/KanbanBoard";
import CreateColumnModal from "@/components/CreateColumnModal";
import TaskModal from "@/components/TaskModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { BoardColumnSkeleton } from "@/components/Skeleton";
import { fetchProject, updateProject } from "@/services/projects";
import EditProjectModal from "@/components/EditProjectModal";
import type { ProjectVisibility } from "@/types/project";
import {
  createColumn,
  deleteColumn,
  fetchColumns,
  updateColumn,
} from "@/services/columns";
import {
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
} from "@/services/tasks";
import type { BoardColumn } from "@/types/column";
import type { Project } from "@/types/project";
import type { Task } from "@/types/task";

export default function ProjectPage() {
  const { id } = useParams();
  const projectId = Number(id);
  const { user, logout } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [columns, setColumns] = useState<BoardColumn[]>([]);
  const [tasksByColumn, setTasksByColumn] = useState<Record<number, Task[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [columnModalOpen, setColumnModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskModalMode, setTaskModalMode] = useState<"create" | "edit">("create");
  const [activeColumnId, setActiveColumnId] = useState<number | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const [editProjectOpen, setEditProjectOpen] = useState(false);

  // Column delete confirmation
  const [pendingDeleteColumn, setPendingDeleteColumn] = useState<{
    id: number;
    name: string;
    taskCount: number;
  } | null>(null);
  const [deletingColumn, setDeletingColumn] = useState(false);

  const totalTasks = useMemo(
    () => Object.values(tasksByColumn).reduce((sum, tasks) => sum + tasks.length, 0),
    [tasksByColumn],
  );

  const loadBoard = useCallback(async () => {
    if (!projectId) return;
    setError(null);
    try {
      const [projectData, columnData] = await Promise.all([
        fetchProject(projectId),
        fetchColumns(projectId),
      ]);
      setProject(projectData);
      setColumns(columnData);

      const taskEntries = await Promise.all(
        columnData.map(async (col) => {
          const tasks = await fetchTasks(col.id);
          return [col.id, tasks] as const;
        }),
      );
      setTasksByColumn(Object.fromEntries(taskEntries));
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 403) setError("You do not have permission to view this project.");
      else if (status === 404) setError("Project not found.");
      else setError("Failed to load project board. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  function updateColumnTaskCount(columnId: number, count: number) {
    setColumns((prev) =>
      prev.map((c) => (c.id === columnId ? { ...c, task_count: count } : c)),
    );
  }

  async function handleEditProject(name: string, visibility: ProjectVisibility) {
    const updated = await updateProject(projectId, { name, visibility });
    setProject(updated);
  }

  async function handleCreateColumn(name: string) {
    const col = await createColumn(projectId, name);
    setColumns((prev) => [...prev, col].sort((a, b) => a.position - b.position));
    setTasksByColumn((prev) => ({ ...prev, [col.id]: [] }));
  }

  async function handleRenameColumn(columnId: number, name: string) {
    const col = columns.find((c) => c.id === columnId);
    if (!col) return;
    const updated = await updateColumn(columnId, { name, position: col.position });
    setColumns((prev) => prev.map((c) => (c.id === columnId ? updated : c)));
  }

  function requestDeleteColumn(columnId: number) {
    const col = columns.find((c) => c.id === columnId);
    if (!col) return;
    const taskCount = tasksByColumn[columnId]?.length ?? col.task_count;
    setPendingDeleteColumn({ id: columnId, name: col.name, taskCount });
  }

  async function confirmDeleteColumn() {
    if (!pendingDeleteColumn) return;
    setDeletingColumn(true);
    try {
      await deleteColumn(pendingDeleteColumn.id);
      setColumns((prev) => prev.filter((c) => c.id !== pendingDeleteColumn.id));
      setTasksByColumn((prev) => {
        const next = { ...prev };
        delete next[pendingDeleteColumn.id];
        return next;
      });
      setPendingDeleteColumn(null);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete column."));
    } finally {
      setDeletingColumn(false);
    }
  }

  function openCreateTask(columnId: number) {
    setTaskModalMode("create");
    setActiveColumnId(columnId);
    setActiveTask(null);
    setTaskModalOpen(true);
  }

  function openEditTask(task: Task) {
    setTaskModalMode("edit");
    setActiveColumnId(task.column_id);
    setActiveTask(task);
    setTaskModalOpen(true);
  }

  async function handleSaveTask(payload: {
    title: string;
    description?: string | null;
    due_date?: string | null;
    position?: number;
  }) {
    if (taskModalMode === "create" && activeColumnId) {
      const task = await createTask(activeColumnId, payload);
      setTasksByColumn((prev) => {
        const columnTasks = [...(prev[activeColumnId] ?? []), task].sort(
          (a, b) => a.position - b.position,
        );
        updateColumnTaskCount(activeColumnId, columnTasks.length);
        return { ...prev, [activeColumnId]: columnTasks };
      });
      return;
    }

    if (taskModalMode === "edit" && activeTask) {
      const updated = await updateTask(activeTask.id, payload);
      setTasksByColumn((prev) => ({
        ...prev,
        [updated.column_id]: (prev[updated.column_id] ?? [])
          .map((t) => (t.id === updated.id ? updated : t))
          .sort((a, b) => a.position - b.position),
      }));
    }
  }

  async function handleDeleteTask() {
    if (!activeTask) return;
    await deleteTask(activeTask.id);
    setTasksByColumn((prev) => {
      const columnTasks = (prev[activeTask.column_id] ?? []).filter(
        (t) => t.id !== activeTask.id,
      );
      updateColumnTaskCount(activeTask.column_id, columnTasks.length);
      return { ...prev, [activeTask.column_id]: columnTasks };
    });
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/10 bg-black/50 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center rounded text-sm text-white/60 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="mr-1 h-4 w-4" aria-hidden="true" />
            Dashboard
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              {project?.name ?? "Project"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-white/50 sm:inline" aria-label="Logged in as">
            {user?.email}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            aria-label="Log out"
            className="border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
          >
            <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
            Logout
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col px-6 py-8">
        {/* Project info banner */}
        {project && !loading && (
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {project.name}
            </h2>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                project.visibility === "public"
                  ? "bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30"
                  : "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30"
              }`}
              aria-label={`Visibility: ${project.visibility}`}
            >
              {project.visibility}
            </span>
            <div className="flex items-center gap-4 text-sm text-white/50">
              <span className="flex items-center gap-1.5">
                <Columns3 className="h-3.5 w-3.5" aria-hidden="true" />
                {columns.length} {columns.length === 1 ? "column" : "columns"}
              </span>
              <span className="flex items-center gap-1.5">
                <ListTodo className="h-3.5 w-3.5" aria-hidden="true" />
                {totalTasks} {totalTasks === 1 ? "task" : "tasks"}
              </span>
            </div>
            {project.owner_id === user?.id && (
              <button
                type="button"
                onClick={() => setEditProjectOpen(true)}
                aria-label="Edit project settings"
                className="ml-1 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div
            className="flex items-start gap-4 overflow-x-auto pb-4"
            aria-label="Loading board…"
            aria-busy="true"
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <BoardColumnSkeleton key={i} />
            ))}
          </div>
        )}

        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        {/* Empty board */}
        {!loading && project && columns.length === 0 && (
          <div className="mx-auto max-w-lg rounded-xl border border-dashed border-white/10 bg-black/30 px-6 py-16 text-center backdrop-blur-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/40">
              <Columns3 className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="text-base font-medium text-white/80">No columns yet</p>
            <p className="mt-1 text-sm text-white/40">
              Create your first column to start organising tasks.
            </p>
            <Button
              className="mt-6"
              onClick={() => setColumnModalOpen(true)}
              aria-label="Create your first column"
            >
              Create first column
            </Button>
          </div>
        )}

        {/* Board */}
        {!loading && project && columns.length > 0 && (
          <KanbanBoard
            columns={columns}
            tasksByColumn={tasksByColumn}
            onTasksChange={setTasksByColumn}
            onColumnCountsChange={(counts) => {
              setColumns((prev) =>
                prev.map((col) =>
                  counts[col.id] !== undefined
                    ? { ...col, task_count: counts[col.id] }
                    : col,
                ),
              );
            }}
            onAddColumn={() => setColumnModalOpen(true)}
            onRenameColumn={handleRenameColumn}
            onDeleteColumn={requestDeleteColumn}
            onAddTask={openCreateTask}
            onEditTask={openEditTask}
            onMoveError={setError}
          />
        )}
      </main>

      <CreateColumnModal
        open={columnModalOpen}
        onOpenChange={setColumnModalOpen}
        onCreate={handleCreateColumn}
      />

      <TaskModal
        open={taskModalOpen}
        onOpenChange={setTaskModalOpen}
        mode={taskModalMode}
        initial={activeTask}
        onSave={handleSaveTask}
        onDelete={taskModalMode === "edit" ? handleDeleteTask : undefined}
      />

      <ConfirmDialog
        open={!!pendingDeleteColumn}
        onOpenChange={(open) => { if (!open) setPendingDeleteColumn(null); }}
        title={`Delete "${pendingDeleteColumn?.name}"?`}
        description={
          pendingDeleteColumn && pendingDeleteColumn.taskCount > 0
            ? `This will permanently delete the column and its ${pendingDeleteColumn.taskCount} task(s). This cannot be undone.`
            : "This column will be permanently deleted. This cannot be undone."
        }
        confirmLabel="Delete"
        destructive
        loading={deletingColumn}
        onConfirm={confirmDeleteColumn}
      />

      {project && (
        <EditProjectModal
          open={editProjectOpen}
          onOpenChange={setEditProjectOpen}
          project={project}
          onSave={handleEditProject}
        />
      )}
    </div>
  );
}
