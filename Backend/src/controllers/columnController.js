import { validationResult } from "express-validator";
import {
  createColumn,
  deleteColumn,
  getColumnById,
  getColumnsByProjectId,
  updateColumn,
} from "../services/columnService.js";
import {
  canModifyProject,
  canViewProject,
  getProjectById,
} from "../services/projectService.js";

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

export async function listColumns(req, res, next) {
  try {
    const project = await getAuthorizedProject(
      req.params.projectId,
      req.user.id,
      res,
    );
    if (!project) return;

    const columns = await getColumnsByProjectId(project.id);
    res.json({ columns });
  } catch (err) {
    next(err);
  }
}

export async function createColumnHandler(req, res, next) {
  try {
    if (handleValidation(req, res)) return;

    const project = await getAuthorizedProject(
      req.params.projectId,
      req.user.id,
      res,
      true,
    );
    if (!project) return;

    const column = await createColumn(project.id, req.body.name);
    res.status(201).json({ column });
  } catch (err) {
    next(err);
  }
}

export async function updateColumnHandler(req, res, next) {
  try {
    if (handleValidation(req, res)) return;

    const existing = await getAuthorizedColumn(
      req.params.id,
      req.user.id,
      res,
      true,
    );
    if (!existing) return;

    const name = req.body.name ?? existing.name;
    const position =
      req.body.position !== undefined ? req.body.position : existing.position;

    const column = await updateColumn(existing.id, name, position);
    res.json({ column });
  } catch (err) {
    next(err);
  }
}

export async function deleteColumnHandler(req, res, next) {
  try {
    const existing = await getAuthorizedColumn(
      req.params.id,
      req.user.id,
      res,
      true,
    );
    if (!existing) return;

    await deleteColumn(existing.id);
    res.json({ message: "Column deleted" });
  } catch (err) {
    next(err);
  }
}
