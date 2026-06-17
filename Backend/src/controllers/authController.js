import { validationResult } from "express-validator";
import {
  createUser,
  findUserByEmail,
  sanitizeUser,
  signToken,
  verifyPassword,
} from "../services/authService.js";

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return true;
  }
  return false;
}

export async function signup(req, res, next) {
  try {
    if (handleValidation(req, res)) return;

    const { email, password } = req.body;
    const existing = await findUserByEmail(email);

    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const user = await createUser(email, password);
    const token = signToken(user);

    res.status(201).json({
      user: sanitizeUser(user),
      token,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    if (handleValidation(req, res)) return;

    const { email, password } = req.body;
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await verifyPassword(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken(user);

    res.json({
      user: sanitizeUser(user),
      token,
    });
  } catch (err) {
    next(err);
  }
}

export function me(req, res) {
  res.json({ user: sanitizeUser(req.user) });
}
