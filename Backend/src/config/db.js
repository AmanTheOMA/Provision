import pg from "pg";
import { config } from "./env.js";

const { Pool } = pg;

const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl:
    config.databaseUrl?.includes("localhost") ||
    config.databaseUrl?.includes("127.0.0.1")
      ? false
      : { rejectUnauthorized: false },
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL pool error:", err);
});

export async function testConnection() {
  const client = await pool.connect();
  try {
    await client.query("SELECT 1");
    return true;
  } finally {
    client.release();
  }
}

export default pool;
