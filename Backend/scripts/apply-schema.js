import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../src/config/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbDir = path.resolve(__dirname, "../../database");

async function runFile(filename) {
  const sql = fs.readFileSync(path.join(dbDir, filename), "utf8");
  await pool.query(sql);
  console.log(`Applied ${filename}`);
}

async function main() {
  await pool.query(`
    DROP TABLE IF EXISTS tasks CASCADE;
    DROP TABLE IF EXISTS board_columns CASCADE;
    DROP TABLE IF EXISTS projects CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    DROP TYPE IF EXISTS visibility_enum CASCADE;
  `);

  await runFile("database.sql");
  await runFile("seed.sql");

  const { rows } = await pool.query(`
    SELECT
      (SELECT COUNT(*)::int FROM users) AS users,
      (SELECT COUNT(*)::int FROM projects) AS projects,
      (SELECT COUNT(*)::int FROM board_columns) AS board_columns,
      (SELECT COUNT(*)::int FROM tasks) AS tasks
  `);

  console.log("Row counts:", rows[0]);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
