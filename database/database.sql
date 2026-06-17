-- KanbanFlow / Provision — Phase 2 schema
-- PostgreSQL

BEGIN;

-- ---------------------------------------------------------------------------
-- Enum
-- ---------------------------------------------------------------------------

CREATE TYPE visibility_enum AS ENUM ('public', 'private');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE projects (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  visibility visibility_enum NOT NULL,
  owner_id   INTEGER NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE board_columns (
  id         SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  name       VARCHAR(255) NOT NULL,
  position   INTEGER NOT NULL
);

CREATE TABLE tasks (
  id          SERIAL PRIMARY KEY,
  column_id   INTEGER NOT NULL REFERENCES board_columns (id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  due_date    DATE,
  position    INTEGER NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX idx_projects_owner_id ON projects (owner_id);
CREATE INDEX idx_projects_visibility ON projects (visibility);
CREATE INDEX idx_board_columns_project_id ON board_columns (project_id);
CREATE INDEX idx_tasks_column_id ON tasks (column_id);

COMMIT;
