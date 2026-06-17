import { Router } from "express";
import { body } from "express-validator";
import { login, me, signup } from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

const authFields = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("A valid email address is required")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];

router.post("/auth/signup", authFields, signup);
router.post("/auth/login", authFields, login);
router.get("/auth/me", authenticate, me);

export default router;
