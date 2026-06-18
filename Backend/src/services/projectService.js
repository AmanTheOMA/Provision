import pool from "../config/db.js";

export function canViewProject(project, userId) {
  return project.visibility === "public" || project.owner_id === userId;
}

export function canModifyProject(project, userId) {
  if (project.visibility === "public") return true;
  return project.owner_id === userId;
}

export async function getProjectsForUser(userId) {
  const result = await pool.query(
    `SELECT id, name, visibility, owner_id, created_at
     FROM projects
     WHERE visibility = 'public' OR owner_id = $1
     ORDER BY created_at DESC`,
    [userId],
  );
  return result.rows;
}

export async function getProjectById(id) {
  const result = await pool.query(
    `SELECT id, name, visibility, owner_id, created_at
     FROM projects
     WHERE id = $1`,
    [id],
  );
  return result.rows[0];
}

export async function createProject(name, visibility, ownerId) {
  const result = await pool.query(
    `INSERT INTO projects (name, visibility, owner_id)
     VALUES ($1, $2, $3)
     RETURNING id, name, visibility, owner_id, created_at`,
    [name, visibility, ownerId],
  );
  return result.rows[0];
}

export async function updateProject(id, name, visibility) {
  const result = await pool.query(
    `UPDATE projects
     SET name = $1, visibility = $2
     WHERE id = $3
     RETURNING id, name, visibility, owner_id, created_at`,
    [name, visibility, id],
  );
  return result.rows[0];
}

export async function deleteProject(id) {
  const result = await pool.query(
    `DELETE FROM projects WHERE id = $1 RETURNING id`,
    [id],
  );
  return result.rows[0];
}

export async function getStatsForUser(userId) {
  const result = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM projects WHERE visibility = 'public') AS total_public_projects,
       (SELECT COUNT(*) FROM projects WHERE visibility = 'private' AND owner_id = $1) AS my_private_projects,
       (SELECT COUNT(*) FROM tasks t
        JOIN columns c ON t.column_id = c.id
        JOIN projects p ON c.project_id = p.id
        WHERE p.visibility = 'public' OR p.owner_id = $1) AS total_tasks`,
    [userId],
  );
  const row = result.rows[0];
  return {
    totalPublicProjects: parseInt(row.total_public_projects, 10),
    myPrivateProjects: parseInt(row.my_private_projects, 10),
    totalTasks: parseInt(row.total_tasks, 10),
  };
}
