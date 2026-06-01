# US-011 — Logging

## Story

**As a** developer
**I want to** have a logging system that correlate and track across layers
**So that** I can observe in a better way logs

### Acceptance criteria

**Given** a backend class file
**When** I look at a class file
**Then** an start, end and error log can fe found

**Given** a backend project
**When** I look at handlers
**Then** a centralyzed log handler who correlates is found

**Priority:** Must Have
**Epic:** Refactor

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