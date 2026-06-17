-- KanbanFlow / Provision — sample data
-- Password for all seed users: password123
-- Run after database.sql on an empty database.

BEGIN;

INSERT INTO users (email, password_hash) VALUES
  ('alice@example.com', '$2b$10$kKew2H8YajBC7bOR6FFp4e2iAmUx4cirBkMz1xymUWTPs0Ss6n9W2'),
  ('bob@example.com',   '$2b$10$kKew2H8YajBC7bOR6FFp4e2iAmUx4cirBkMz1xymUWTPs0Ss6n9W2');

INSERT INTO projects (name, visibility, owner_id)
SELECT 'Product Roadmap', 'public'::visibility_enum, id FROM users WHERE email = 'alice@example.com'
UNION ALL
SELECT 'Marketing Launch', 'public'::visibility_enum, id FROM users WHERE email = 'bob@example.com'
UNION ALL
SELECT 'Personal Notes', 'private'::visibility_enum, id FROM users WHERE email = 'alice@example.com';

-- Product Roadmap board_columns
INSERT INTO board_columns (project_id, name, position)
SELECT p.id, v.name, v.position
FROM projects p
CROSS JOIN (VALUES
  ('Backlog',    0),
  ('Need To Do', 1),
  ('Doing',      2),
  ('Review',     3),
  ('Done',       4)
) AS v(name, position)
WHERE p.name = 'Product Roadmap';

-- Marketing Launch board_columns
INSERT INTO board_columns (project_id, name, position)
SELECT p.id, v.name, v.position
FROM projects p
CROSS JOIN (VALUES
  ('Backlog',    0),
  ('Need To Do', 1),
  ('Doing',      2),
  ('Done',       3)
) AS v(name, position)
WHERE p.name = 'Marketing Launch';

-- Personal Notes board_columns
INSERT INTO board_columns (project_id, name, position)
SELECT p.id, v.name, v.position
FROM projects p
CROSS JOIN (VALUES
  ('Ideas', 0),
  ('Later', 1)
) AS v(name, position)
WHERE p.name = 'Personal Notes';

-- Product Roadmap tasks
INSERT INTO tasks (column_id, title, description, due_date, position)
SELECT c.id, v.title, v.description, v.due_date::date, v.position
FROM board_columns c
JOIN projects p ON p.id = c.project_id
CROSS JOIN (VALUES
  ('Backlog',    'Research competitor boards', 'Survey Trello, Linear, and Notion kanban UX', '2026-07-01', 0),
  ('Backlog',    'Draft API contract',         NULL,                                          '2026-07-05', 1),
  ('Need To Do', 'Implement auth endpoints',   'Signup and login with JWT',                   '2026-06-25', 0),
  ('Doing',      'Build dashboard layout',     'Pixel cards and search bar',                  '2026-06-20', 0),
  ('Done',       'Initialize monorepo',      'Phase 1 project setup complete',              NULL,         0)
) AS v(column_name, title, description, due_date, position)
WHERE p.name = 'Product Roadmap' AND c.name = v.column_name;

-- Marketing Launch tasks
INSERT INTO tasks (column_id, title, description, due_date, position)
SELECT c.id, v.title, v.description, v.due_date::date, v.position
FROM board_columns c
JOIN projects p ON p.id = c.project_id
CROSS JOIN (VALUES
  ('Backlog',    'Write launch blog post', NULL,                   '2026-06-30', 0),
  ('Need To Do', 'Design social assets',   'Twitter and LinkedIn', '2026-06-22', 0),
  ('Doing',      'Set up email campaign',  NULL,                   '2026-06-18', 0),
  ('Done',       'Reserve product name',   'Provision confirmed',  NULL,         0)
) AS v(column_name, title, description, due_date, position)
WHERE p.name = 'Marketing Launch' AND c.name = v.column_name;

-- Personal Notes tasks
INSERT INTO tasks (column_id, title, description, due_date, position)
SELECT c.id, v.title, v.description, v.due_date::date, v.position
FROM board_columns c
JOIN projects p ON p.id = c.project_id
CROSS JOIN (VALUES
  ('Ideas', 'Book dentist appointment', NULL,                '2026-06-28', 0),
  ('Ideas', 'Grocery list',             'Milk, eggs, bread', NULL,         1),
  ('Later', 'Learn Rust',               NULL,                NULL,         0)
) AS v(column_name, title, description, due_date, position)
WHERE p.name = 'Personal Notes' AND c.name = v.column_name;

COMMIT;
