import api from "@/services/api";
import type { BoardColumn } from "@/types/column";

export async function fetchColumns(projectId: number) {
  const res = await api.get<{ columns: BoardColumn[] }>(
    `/projects/${projectId}/columns`,
  );
  return res.data.columns;
}

export async function createColumn(projectId: number, name: string) {
  const res = await api.post<{ column: BoardColumn }>(
    `/projects/${projectId}/columns`,
    { name },
  );
  return res.data.column;
}

export async function updateColumn(
  id: number,
  payload: { name?: string; position?: number },
) {
  const res = await api.put<{ column: BoardColumn }>(`/columns/${id}`, payload);
  return res.data.column;
}

export async function deleteColumn(id: number) {
  await api.delete(`/columns/${id}`);
}
