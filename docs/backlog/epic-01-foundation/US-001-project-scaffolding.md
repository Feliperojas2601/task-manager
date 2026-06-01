# US-001 — Project scaffolding and environment setup

## Story

**As a** developer
**I want to** have a fully configured monorepo with Docker Compose, TypeScript, and a running local environment
**So that** I can start implementing features without configuration friction

### Acceptance criteria

**Given** the repository has been cloned
**When** I run `docker-compose up`
**Then** the backend API is reachable at `http://localhost:3000/api/v1/health`, the frontend is served at `http://localhost:5173`, and the PostgreSQL database is accessible

**Given** the monorepo structure exists
**When** I navigate to `apps/backend` or `apps/frontend`
**Then** each app has its own `package.json`, `tsconfig.json`, and can be run independently

**Priority:** Must Have
**Epic:** Foundation

---

## Spec

### Structure

```
task-manager/
  apps/
    backend/
      src/
        domain/
        application/
        infrastructure/
      package.json
      tsconfig.json
      Dockerfile
    frontend/
      src/
      package.json
      tsconfig.json
      Dockerfile
  docker-compose.yml
  .env.example
  README.md
  .gitignore
```

### docker-compose.yml services

| Service | Port | Description |
|---------|------|-------------|
| `db` | 5432 | PostgreSQL 16 |
| `backend` | 3000 | Node.js / Express API |
| `frontend` | 5173 | React dev server (Vite) |

### Backend health check

`GET /health`

**Response `200`**
```json
{ "message": "ok" }
```

### Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `PORT` | No | 3000 | API port |
| `NODE_ENV` | No | development | Runtime environment |

### Clean architecture responsibilities

- **No domain/application logic in this story** — scaffolding only
- `infrastructure/` contains Express app bootstrap (`app.ts`), router mount, and the health endpoint controller
- `application/` and `domain/` are empty directories with `.gitkeep` to establish the layer structure

### SQL (reference)

```sql
-- No migrations in this story;
```

### Notes 
- Write a basic README.md with the project description and running command using docker. 
- Write a basic AGENTS.md with conventions, error handling, testing, etc.