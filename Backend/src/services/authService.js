import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { config } from "../config/env.js";

const SALT_ROUNDS = 10;

export function signToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email },
    config.jwtSecret,
    { expiresIn: "7d" },
  );
}

export function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    created_at: user.created_at,
  };
}

export async function createUser(email, password) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await pool.query(
    `INSERT INTO users (email, password_hash)
     VALUES ($1, $2)
     RETURNING id, email, created_at`,
    [email, passwordHash],
  );
  return result.rows[0];
}

export async function findUserByEmail(email) {
  const result = await pool.query(
    `SELECT id, email, password_hash, created_at
     FROM users
     WHERE email = $1`,
    [email],
  );
  return result.rows[0];
}

export async function findUserById(id) {
  const result = await pool.query(
    `SELECT id, email, created_at
     FROM users
     WHERE id = $1`,
    [id],
  );
  return result.rows[0];
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
