import { Router } from "express";
import { body } from "express-validator";
import {
  createProjectHandler,
  deleteProjectHandler,
  getProject,
  getProjectStats,
  listProjects,
  updateProjectHandler,
} from "../controllers/projectController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

const projectBodyRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Project name is required")
    .isLength({ max: 255 })
    .withMessage("Project name must be at most 255 characters"),
  body("visibility")
    .notEmpty()
    .withMessage("Visibility is required")
    .isIn(["public", "private"])
    .withMessage("Visibility must be public or private"),
];

router.get("/projects/stats", authenticate, getProjectStats);
router.get("/projects", authenticate, listProjects);
router.get("/projects/:id", authenticate, getProject);
router.post("/projects", authenticate, projectBodyRules, createProjectHandler);
router.put(
  "/projects/:id",
  authenticate,
  projectBodyRules,
  updateProjectHandler,
);
router.delete("/projects/:id", authenticate, deleteProjectHandler);

export default router;
