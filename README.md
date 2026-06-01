# Task Manager

**Technical identifier:** task-manager

## General Description

A full-stack project task management application. Users can create projects, associate tasks with statuses and priority levels, and visualise work across a project.

## Role within Architecture

- **Style:** Monolith (single backend service + single frontend application)
- **Stack:** React 18 · Node.js · Express · PostgreSQL · Prisma · TypeScript · Docker Compose
- **Backend internal structure**: Clean Architecture (domain / application / infrastructure)

## Use Cases

- Create, list, and delete projects
- Create, update, and delete tasks within a project
- Filter and sort tasks by status and priority

## API / Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| POST | /projects | Create a project |
| GET | /projects | List all projects |
| GET | /projects/:id | Get project detail with tasks |
| DELETE | /projects/:id | Delete a project |
| POST | /projects/:projectId/tasks | Create a task |
| PATCH | /tasks/:id | Update a task |
| DELETE | /tasks/:id | Delete a task |
| GET | /projects/:projectId/tasks | List/filter tasks by project |

## Configuration

Copy `apps/*/.env.example` to `apps/*/.env` and fill in the values before running locally without Docker.

## Local Execution

**Start the full stack (recommended):**
```bash
docker-compose up
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Database: localhost:5432

**Run services individually:**
```bash
# Backend
cd apps/backend && npm install && npm run dev

# Frontend
cd apps/frontend && npm install && npm run dev
```

## Testing

```bash
cd apps/backend
npm install
npm test              # run tests
npm run test:coverage # run with coverage report
```

## Process documentation 

See `docs/README.md`