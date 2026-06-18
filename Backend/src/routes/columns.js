import { Router } from "express";
import { body } from "express-validator";
import {
  createColumnHandler,
  deleteColumnHandler,
  listColumns,
  updateColumnHandler,
} from "../controllers/columnController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

const createColumnRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Column name is required")
    .isLength({ max: 255 })
    .withMessage("Column name must be at most 255 characters"),
];

const updateColumnRules = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Column name cannot be empty")
    .isLength({ max: 255 })
    .withMessage("Column name must be at most 255 characters"),
  body("position")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Position must be a non-negative integer"),
];

router.get(
  "/projects/:projectId/columns",
  authenticate,
  listColumns,
);
router.post(
  "/projects/:projectId/columns",
  authenticate,
  createColumnRules,
  createColumnHandler,
);
router.put(
  "/columns/:id",
  authenticate,
  updateColumnRules,
  updateColumnHandler,
);
router.delete("/columns/:id", authenticate, deleteColumnHandler);

export default router;
