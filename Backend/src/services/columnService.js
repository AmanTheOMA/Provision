import pool from "../config/db.js";

export async function getColumnsByProjectId(projectId) {
  const result = await pool.query(
    `SELECT
       bc.id,
       bc.project_id,
       bc.name,
       bc.position,
       (SELECT COUNT(*)::int FROM tasks t WHERE t.column_id = bc.id) AS task_count
     FROM board_columns bc
     WHERE bc.project_id = $1
     ORDER BY bc.position ASC`,
    [projectId],
  );
  return result.rows;
}

export async function getColumnById(id) {
  const result = await pool.query(
    `SELECT
       bc.id,
       bc.project_id,
       bc.name,
       bc.position,
       (SELECT COUNT(*)::int FROM tasks t WHERE t.column_id = bc.id) AS task_count
     FROM board_columns bc
     WHERE bc.id = $1`,
    [id],
  );
  return result.rows[0];
}

export async function getNextPosition(projectId) {
  const result = await pool.query(
    `SELECT COALESCE(MAX(position), -1) + 1 AS next_position
     FROM board_columns
     WHERE project_id = $1`,
    [projectId],
  );
  return result.rows[0].next_position;
}

export async function createColumn(projectId, name) {
  const position = await getNextPosition(projectId);
  const result = await pool.query(
    `INSERT INTO board_columns (project_id, name, position)
     VALUES ($1, $2, $3)
     RETURNING id, project_id, name, position`,
    [projectId, name, position],
  );
  const column = result.rows[0];
  return { ...column, task_count: 0 };
}

export async function updateColumn(id, name, position) {
  const result = await pool.query(
    `UPDATE board_columns
     SET name = $1, position = $2
     WHERE id = $3
     RETURNING id, project_id, name, position`,
    [name, position, id],
  );
  const column = result.rows[0];
  if (!column) return null;

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS task_count FROM tasks WHERE column_id = $1`,
    [id],
  );

  return { ...column, task_count: countResult.rows[0].task_count };
}

export async function deleteColumn(id) {
  const result = await pool.query(
    `DELETE FROM board_columns WHERE id = $1 RETURNING id`,
    [id],
  );
  return result.rows[0];
}

export async function countTasksInColumn(columnId) {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS count FROM tasks WHERE column_id = $1`,
    [columnId],
  );
  return result.rows[0].count;
}
