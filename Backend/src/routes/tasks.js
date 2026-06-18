import { Router } from "express";
import { body } from "express-validator";
import {
  createTaskHandler,
  deleteTaskHandler,
  listTasks,
  moveTaskHandler,
  updateTaskHandler,
} from "../controllers/taskController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

const createTaskRules = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Task title is required")
    .isLength({ max: 255 })
    .withMessage("Task title must be at most 255 characters"),
  body("description")
    .optional({ nullable: true })
    .isString()
    .withMessage("Description must be a string"),
  body("due_date")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("Due date must be a valid date (YYYY-MM-DD)"),
];

const updateTaskRules = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Task title cannot be empty")
    .isLength({ max: 255 })
    .withMessage("Task title must be at most 255 characters"),
  body("description")
    .optional({ nullable: true })
    .isString()
    .withMessage("Description must be a string"),
  body("due_date")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("Due date must be a valid date (YYYY-MM-DD)"),
  body("position")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Position must be a non-negative integer"),
];

router.get("/columns/:columnId/tasks", authenticate, listTasks);
router.post(
  "/columns/:columnId/tasks",
  authenticate,
  createTaskRules,
  createTaskHandler,
);
router.put("/tasks/:id", authenticate, updateTaskRules, updateTaskHandler);
router.put(
  "/tasks/:id/move",
  authenticate,
  [
    body("targetColumnId")
      .isInt({ min: 1 })
      .withMessage("targetColumnId must be a positive integer"),
    body("position")
      .isInt({ min: 0 })
      .withMessage("position must be a non-negative integer"),
  ],
  moveTaskHandler,
);
router.delete("/tasks/:id", authenticate, deleteTaskHandler);

export default router;
