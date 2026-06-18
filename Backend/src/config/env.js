import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

export const config = {
  port: Number(process.env.PORT) || 5000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET?.trim(),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
};

if (!config.databaseUrl) {
  console.warn("Warning: DATABASE_URL is not set");
}

if (!config.jwtSecret) {
  console.warn("Warning: JWT_SECRET is not set");
}
