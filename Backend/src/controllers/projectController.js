import { validationResult } from "express-validator";
import {
  canModifyProject,
  canViewProject,
  createProject,
  deleteProject,
  getProjectById,
  getProjectsForUser,
  getStatsForUser,
  updateProject,
} from "../services/projectService.js";

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return true;
  }
  return false;
}

function splitProjects(projects, userId) {
  const publicProjects = projects.filter((p) => p.visibility === "public");
  const privateProjects = projects.filter(
    (p) => p.visibility === "private" && p.owner_id === userId,
  );
  return { publicProjects, privateProjects };
}

export async function listProjects(req, res, next) {
  try {
    const projects = await getProjectsForUser(req.user.id);
    const { publicProjects, privateProjects } = splitProjects(
      projects,
      req.user.id,
    );

    res.json({ publicProjects, privateProjects });
  } catch (err) {
    next(err);
  }
}

export async function getProject(req, res, next) {
  try {
    const project = await getProjectById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (!canViewProject(project, req.user.id)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json({ project });
  } catch (err) {
    next(err);
  }
}

export async function createProjectHandler(req, res, next) {
  try {
    if (handleValidation(req, res)) return;

    const { name, visibility } = req.body;
    const project = await createProject(name, visibility, req.user.id);

    res.status(201).json({ project });
  } catch (err) {
    next(err);
  }
}

export async function updateProjectHandler(req, res, next) {
  try {
    if (handleValidation(req, res)) return;

    const project = await getProjectById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (!canModifyProject(project, req.user.id)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { name, visibility } = req.body;
    const updated = await updateProject(req.params.id, name, visibility);

    res.json({ project: updated });
  } catch (err) {
    next(err);
  }
}

export async function getProjectStats(req, res, next) {
  try {
    const stats = await getStatsForUser(req.user.id);
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

export async function deleteProjectHandler(req, res, next) {
  try {
    const project = await getProjectById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (!canModifyProject(project, req.user.id)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await deleteProject(req.params.id);

    res.json({ message: "Project deleted" });
  } catch (err) {
    next(err);
  }
}
