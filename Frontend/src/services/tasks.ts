import api from "@/services/api";
import type { Task, TaskPayload } from "@/types/task";

export async function fetchTasks(columnId: number) {
  const res = await api.get<{ tasks: Task[] }>(`/columns/${columnId}/tasks`);
  return res.data.tasks;
}

export async function createTask(columnId: number, payload: TaskPayload) {
  const res = await api.post<{ task: Task }>(
    `/columns/${columnId}/tasks`,
    payload,
  );
  return res.data.task;
}

export async function updateTask(id: number, payload: TaskPayload) {
  const res = await api.put<{ task: Task }>(`/tasks/${id}`, payload);
  return res.data.task;
}

export async function deleteTask(id: number) {
  await api.delete(`/tasks/${id}`);
}

export type MoveTaskPayload = {
  targetColumnId: number;
  position: number;
};

export type MoveTaskResponse = {
  task: Task;
  affectedColumns: Record<string, Task[]>;
};

export async function moveTask(id: number, payload: MoveTaskPayload) {
  const res = await api.put<MoveTaskResponse>(`/tasks/${id}/move`, payload);
  return res.data;
}
