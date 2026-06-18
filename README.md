# Provision

A FREE full-stack CMS Kanban board app for managing projects and tasks. Users sign up, create projects, build custom columns, and drag tasks between them. The theme is dark and minimal — clean typography, subtle animations, no payment al all unlike Jira/Trello.

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, Framer Motion, dnd-kit
- Backend: Node.js, Express
- Database: PostgreSQL (hosted on Railway)
- Auth: JWT (stored in localStorage)
- Deployment: Netlify (frontend), Railway (backend)

## Running Locally

### Prerequisites

- Node.js 18+
- A PostgreSQL database (or use the Railway one)

### Clone the repo

### Create a `.env` file

Create a `.env` file at the project root using `.env.example` as a template. Fill in:

- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_URL`

### Run the database schema

```bash
cd Backend
node scripts/apply-schema.js
```

### Start the backend

```bash
cd Backend
npm install
npm start
```

### Start the frontend

```bash
cd Frontend
npm install
npm run dev
```

Open:

```
http://localhost:5173
```

## Available Features

- Full-Stack CRUD for Projects, Columns, and Tasks
- Kanban Board with Drag-and-Drop Task Movement
- User Authentication (JWT)
- Public vs Private Project Visibility
- Custom Project Creation
- Custom Column Creation
- Task Assignment to Columns
- Task Status Management Through Column Movement
- Responsive UI & Dark Minimalist Design
- Protected Routes
- PostgreSQL Database Persistence
- Multi-Project Management
- User-Specific Project Ownership
- Form Validation

## Known Limitations

- No user profile or password reset flow
- Columns can't be reordered (only tasks can be dragged)
- Changes from another session require a refresh

## Will Add

- Column drag-and-drop reordering
- Activity log per project
- Optimistic UI updates so the board feels instant
- Proper refresh token flow instead of expiring JWTs
- Add attachments and assignee's section for each tasks
- Other than Kanban board, make a calander-like option for task management





