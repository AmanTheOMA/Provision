import express from "express";
import cors from "cors";
import { testConnection } from "../config/db.js";

const router = express.Router();

router.get("/health", async (_req, res) => {
  let database = "disconnected";

  try {
    await testConnection();
    database = "connected";
  } catch {
    database = "disconnected";
  }

  res.json({
    status: "ok",
    database,
    timestamp: new Date().toISOString(),
  });
});

export default router;
