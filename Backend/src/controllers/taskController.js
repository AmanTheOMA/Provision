import { validationResult } from "express-validator";
import { getColumnById } from "../services/columnService.js";
import {
  canModifyProject,
  canViewProject,
  getProjectById,
} from "../services/projectService.js";
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasksByColumnId,
  moveTask,
  updateTask,
} from "../services/taskService.js";

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return true;
  }
  return false;
}

async function getAuthorizedProject(projectId, userId, res, requireModify = false) {
  const project = await getProjectById(projectId);

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return null;
  }

  const allowed = requireModify
    ? canModifyProject(project, userId)
    : canViewProject(project, userId);

  if (!allowed) {
    res.status(403).json({ error: "Forbidden" });
    return null;
  }

  return project;
}

async function getAuthorizedColumn(columnId, userId, res, requireModify = false) {
  const column = await getColumnById(columnId);

  if (!column) {
    res.status(404).json({ error: "Column not found" });
    return null;
  }

  const project = await getAuthorizedProject(
    column.project_id,
    userId,
    res,
    requireModify,
  );

  if (!project) return null;

  return column;
}

async function getAuthorizedTask(taskId, userId, res, requireModify = false) {
  const task = await getTaskById(taskId);

  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return null;
  }

  const column = await getAuthorizedColumn(
    task.column_id,
    userId,
    res,
    requireModify,
  );

  if (!column) return null;

  return task;
}

export async function listTasks(req, res, next) {
  try {
    const column = await getAuthorizedColumn(
      req.params.columnId,
      req.user.id,
      res,
    );
    if (!column) return;

    const tasks = await getTasksByColumnId(column.id);
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
}

export async function createTaskHandler(req, res, next) {
  try {
    if (handleValidation(req, res)) return;

    const column = await getAuthorizedColumn(
      req.params.columnId,
      req.user.id,
      res,
      true,
    );
    if (!column) return;

    const { title, description, due_date } = req.body;
    const task = await createTask(column.id, { title, description, due_date });
    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
}

export async function updateTaskHandler(req, res, next) {
  try {
    if (handleValidation(req, res)) return;

    const existing = await getAuthorizedTask(
      req.params.id,
      req.user.id,
      res,
      true,
    );
    if (!existing) return;

    const title = req.body.title ?? existing.title;
    const description =
      req.body.description !== undefined
        ? req.body.description
        : existing.description;
    const due_date =
      req.body.due_date !== undefined ? req.body.due_date : existing.due_date;
    const position =
      req.body.position !== undefined ? req.body.position : existing.position;

    const task = await updateTask(existing.id, {
      title,
      description,
      due_date,
      position,
    });
    res.json({ task });
  } catch (err) {
    next(err);
  }
}

export async function deleteTaskHandler(req, res, next) {
  try {
    const existing = await getAuthorizedTask(
      req.params.id,
      req.user.id,
      res,
      true,
    );
    if (!existing) return;

    await deleteTask(existing.id);
    res.json({ message: "Task deleted" });
  } catch (err) {
    next(err);
  }
}

export async function moveTaskHandler(req, res, next) {
  try {
    if (handleValidation(req, res)) return;

    const existing = await getAuthorizedTask(
      req.params.id,
      req.user.id,
      res,
      true,
    );
    if (!existing) return;

    const { targetColumnId, position } = req.body;

    const targetColumn = await getAuthorizedColumn(
      targetColumnId,
      req.user.id,
      res,
      true,
    );
    if (!targetColumn) return;

    const sourceColumn = await getColumnById(existing.column_id);
    if (sourceColumn.project_id !== targetColumn.project_id) {
      return res.status(400).json({ error: "Columns must belong to the same project" });
    }

    const result = await moveTask(existing.id, targetColumnId, position);
    if (!result) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
}
