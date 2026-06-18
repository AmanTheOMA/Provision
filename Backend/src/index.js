import express from "express";
import cors from "cors";
import { config } from "./config/env.js";
import authRoutes from "./routes/auth.js";
import healthRoutes from "./routes/health.js";
import projectRoutes from "./routes/projects.js";
import columnRoutes from "./routes/columns.js";
import taskRoutes from "./routes/tasks.js";

const app = express();

app.use(
  cors({
    origin: [config.frontendUrl, "http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  }),
);
app.use(express.json());

app.use(healthRoutes);
app.use(authRoutes);
app.use(projectRoutes);
app.use(columnRoutes);
app.use(taskRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
