import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useRef, useState } from "react";
import BoardColumnCard from "@/components/BoardColumnCard";
import AddColumnCard from "@/components/AddColumnCard";
import TaskCard from "@/components/TaskCard";
import { moveTask } from "@/services/tasks";
import type { BoardColumn } from "@/types/column";
import type { Task } from "@/types/task";

function findColumnForTask(
  taskId: number,
  tasksByColumn: Record<number, Task[]>,
) {
  for (const [columnId, tasks] of Object.entries(tasksByColumn)) {
    if (tasks.some((task) => task.id === taskId)) {
      return Number(columnId);
    }
  }
  return null;
}

function parseColumnId(id: string | number) {
  if (typeof id === "string" && id.startsWith("column-")) {
    return Number(id.replace("column-", ""));
  }
  return null;
}

interface KanbanBoardProps {
  columns: BoardColumn[];
  tasksByColumn: Record<number, Task[]>;
  onTasksChange: (next: Record<number, Task[]>) => void;
  onColumnCountsChange: (counts: Record<number, number>) => void;
  onAddColumn: () => void;
  onRenameColumn: (id: number, name: string) => Promise<void>;
  onDeleteColumn: (id: number) => void;
  onAddTask: (columnId: number) => void;
  onEditTask: (task: Task) => void;
  onMoveError: (message: string) => void;
}

export default function KanbanBoard({
  columns,
  tasksByColumn,
  onTasksChange,
  onColumnCountsChange,
  onAddColumn,
  onRenameColumn,
  onDeleteColumn,
  onAddTask,
  onEditTask,
  onMoveError,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Always-fresh ref so drag callbacks don't capture stale closures
  const latestTasks = useRef(tasksByColumn);
  latestTasks.current = tasksByColumn;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    const taskId = Number(event.active.id);
    const columnId = findColumnForTask(taskId, latestTasks.current);
    if (!columnId) return;
    const task = latestTasks.current[columnId]?.find((t) => t.id === taskId);
    if (task) setActiveTask(task);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const current = latestTasks.current;
    const activeId = Number(active.id);
    const activeColumnId = findColumnForTask(activeId, current);
    if (!activeColumnId) return;

    const overColumnId =
      parseColumnId(over.id) ?? findColumnForTask(Number(over.id), current);
    if (!overColumnId || activeColumnId === overColumnId) return;

    onTasksChange(
      moveTaskBetweenColumns(current, activeId, activeColumnId, overColumnId, over.id),
    );
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const current = latestTasks.current;
    const taskId = Number(active.id);

    // Determine where the task currently is (after any dragOver moves)
    const currentColumnId = findColumnForTask(taskId, current);
    if (!currentColumnId) return;

    // Determine target column from the drop target
    const overColumnId =
      parseColumnId(over.id) ??
      findColumnForTask(Number(over.id), current) ??
      currentColumnId;

    // Same-column reorder
    if (currentColumnId === overColumnId && active.id !== over.id) {
      const columnTasks = [...(current[currentColumnId] ?? [])];
      const oldIndex = columnTasks.findIndex((t) => t.id === taskId);
      const newIndex = columnTasks.findIndex((t) => t.id === Number(over.id));

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reordered = arrayMove(columnTasks, oldIndex, newIndex);
        onTasksChange({ ...current, [currentColumnId]: reordered });
      }
    }

    // Always sync to server using the latest state after any local moves
    const finalTasks = latestTasks.current;
    const targetColumnId = findColumnForTask(taskId, finalTasks) ?? overColumnId;
    const position = (finalTasks[targetColumnId] ?? []).findIndex(
      (t) => t.id === taskId,
    );
    if (position === -1) return;

    try {
      const result = await moveTask(taskId, { targetColumnId, position });

      // Replace with server-authoritative positions
      onTasksChange({
        ...latestTasks.current,
        ...Object.fromEntries(
          Object.entries(result.affectedColumns).map(([col, tasks]) => [
            Number(col),
            tasks,
          ]),
        ),
      });

      const counts: Record<number, number> = {};
      for (const [col, tasks] of Object.entries(result.affectedColumns)) {
        counts[Number(col)] = tasks.length;
      }
      onColumnCountsChange(counts);
    } catch {
      onMoveError("Failed to move task. Reloading board…");
      // Reload the page to restore server state
      window.location.reload();
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {/* items-start prevents columns stretching to match the tallest column */}
      <div
        className="flex items-start gap-4 overflow-x-auto pb-6"
        role="region"
        aria-label="Kanban board"
      >
        {columns.map((column) => (
          <BoardColumnCard
            key={column.id}
            column={column}
            tasks={tasksByColumn[column.id] ?? []}
            onRename={onRenameColumn}
            onDelete={onDeleteColumn}
            onAddTask={onAddTask}
            onEditTask={onEditTask}
          />
        ))}
        <AddColumnCard onClick={onAddColumn} />
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function moveTaskBetweenColumns(
  tasksByColumn: Record<number, Task[]>,
  activeId: number,
  activeColumnId: number,
  overColumnId: number,
  overId: string | number,
) {
  const activeTasks = [...(tasksByColumn[activeColumnId] ?? [])];
  const overTasks = [...(tasksByColumn[overColumnId] ?? [])];
  const activeIndex = activeTasks.findIndex((task) => task.id === activeId);
  if (activeIndex === -1) return tasksByColumn;

  const [movedTask] = activeTasks.splice(activeIndex, 1);
  const overIndex =
    typeof overId === "number"
      ? overTasks.findIndex((task) => task.id === overId)
      : overTasks.length;

  overTasks.splice(
    overIndex >= 0 ? overIndex : overTasks.length,
    0,
    { ...movedTask, column_id: overColumnId },
  );

  return {
    ...tasksByColumn,
    [activeColumnId]: activeTasks,
    [overColumnId]: overTasks,
  };
}
