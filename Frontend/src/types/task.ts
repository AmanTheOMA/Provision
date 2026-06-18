export type Task = {
  id: number;
  column_id: number;
  title: string;
  description: string | null;
  due_date: string | null;
  position: number;
  created_at: string;
};

export type TaskPayload = {
  title: string;
  description?: string | null;
  due_date?: string | null;
  position?: number;
};
