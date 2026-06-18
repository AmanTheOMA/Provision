import pool from "../config/db.js";

export async function getTasksByColumnId(columnId) {
  const result = await pool.query(
    `SELECT id, column_id, title, description, due_date, position, created_at
     FROM tasks
     WHERE column_id = $1
     ORDER BY position ASC`,
    [columnId],
  );
  return result.rows;
}

export async function getTaskById(id) {
  const result = await pool.query(
    `SELECT id, column_id, title, description, due_date, position, created_at
     FROM tasks
     WHERE id = $1`,
    [id],
  );
  return result.rows[0];
}

export async function getNextTaskPosition(columnId) {
  const result = await pool.query(
    `SELECT COALESCE(MAX(position), -1) + 1 AS next_position
     FROM tasks
     WHERE column_id = $1`,
    [columnId],
  );
  return result.rows[0].next_position;
}

export async function createTask(columnId, { title, description, due_date }) {
  const position = await getNextTaskPosition(columnId);
  const result = await pool.query(
    `INSERT INTO tasks (column_id, title, description, due_date, position)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, column_id, title, description, due_date, position, created_at`,
    [columnId, title, description ?? null, due_date ?? null, position],
  );
  return result.rows[0];
}

export async function updateTask(id, { title, description, due_date, position }) {
  const result = await pool.query(
    `UPDATE tasks
     SET title = $1,
         description = $2,
         due_date = $3,
         position = $4
     WHERE id = $5
     RETURNING id, column_id, title, description, due_date, position, created_at`,
    [title, description ?? null, due_date ?? null, position, id],
  );
  return result.rows[0];
}

export async function deleteTask(id) {
  const result = await pool.query(
    `DELETE FROM tasks WHERE id = $1 RETURNING id, column_id`,
    [id],
  );
  return result.rows[0];
}

async function renumberColumnTasks(client, columnId, orderedIds) {
  for (let i = 0; i < orderedIds.length; i++) {
    await client.query(
      `UPDATE tasks SET column_id = $1, position = $2 WHERE id = $3`,
      [columnId, i, orderedIds[i]],
    );
  }
}

export async function moveTask(taskId, targetColumnId, targetPosition) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const taskResult = await client.query(
      `SELECT id, column_id FROM tasks WHERE id = $1 FOR UPDATE`,
      [taskId],
    );
    const task = taskResult.rows[0];
    if (!task) {
      await client.query("ROLLBACK");
      return null;
    }

    const sourceColumnId = task.column_id;

    const sourceResult = await client.query(
      `SELECT id FROM tasks WHERE column_id = $1 ORDER BY position ASC, id ASC`,
      [sourceColumnId],
    );
    let sourceIds = sourceResult.rows.map((row) => row.id);

    const targetResult = await client.query(
      `SELECT id FROM tasks WHERE column_id = $1 ORDER BY position ASC, id ASC`,
      [targetColumnId],
    );
    let targetIds =
      sourceColumnId === targetColumnId
        ? [...sourceIds]
        : targetResult.rows.map((row) => row.id);

    if (sourceColumnId === targetColumnId) {
      const currentIndex = targetIds.indexOf(taskId);
      if (currentIndex === -1) {
        await client.query("ROLLBACK");
        return null;
      }
      targetIds.splice(currentIndex, 1);
    } else {
      sourceIds = sourceIds.filter((id) => id !== taskId);
    }

    const clampedPosition = Math.min(
      Math.max(0, targetPosition),
      targetIds.filter((id) => id !== taskId).length,
    );

    const insertIds =
      sourceColumnId === targetColumnId
        ? targetIds
        : targetIds.filter((id) => id !== taskId);
    insertIds.splice(clampedPosition, 0, taskId);

    await renumberColumnTasks(client, targetColumnId, insertIds);

    if (sourceColumnId !== targetColumnId) {
      await renumberColumnTasks(client, sourceColumnId, sourceIds);
    }

    await client.query("COMMIT");

    const movedTask = await getTaskById(taskId);
    const affectedColumnIds =
      sourceColumnId === targetColumnId
        ? [targetColumnId]
        : [sourceColumnId, targetColumnId];

    const affectedColumns = {};
    for (const columnId of affectedColumnIds) {
      affectedColumns[columnId] = await getTasksByColumnId(columnId);
    }

    return { task: movedTask, affectedColumns };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
