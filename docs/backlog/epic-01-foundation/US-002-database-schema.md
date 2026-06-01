# US-002 — Database schema and migrations

## Story

**As a** developer
**I want to** have the Prisma schema defined with Project and Task entities and migrations applied automatically on startup
**So that** all subsequent stories can persist and query data without manual DB setup

### Acceptance criteria

**Given** Docker Compose is running
**When** the backend container starts
**Then** `prisma migrate deploy` runs automatically and the `projects` and `tasks` tables exist in PostgreSQL

**Given** the Prisma schema is defined
**When** I run `npx prisma generate`
**Then** fully typed Prisma Client is available for use in the infrastructure layer

**Priority:** Must Have
**Epic:** Foundation

---

## Spec

### Prisma schema (`apps/backend/prisma/schema.prisma`)

```prisma
model Project {
  id          String   @id @default(uuid())
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  tasks       Task[]
}

model Task {
  id          String     @id @default(uuid())
  title       String
  description String?
  status      TaskStatus @default(PENDING)
  priority    Priority   @default(MEDIUM)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  projectId   String
  project     Project    @relation(fields: [projectId], references: [id], onDelete: Cascade)
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  DONE
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}
```

### Validations

- `Project.name` is required and non-empty
- `Task.title` is required and non-empty
- `Task.projectId` must reference an existing project (enforced by FK)
- Deleting a project cascades deletion of its tasks

### Clean architecture responsibilities

- **Infrastructure:** `PrismaClient` instantiation in `infrastructure/database/prisma.ts` (singleton)
- **Infrastructure:** Migration applied via `prisma migrate deploy` in Docker entrypoint or startup script
- **Domain:** Enums `TaskStatus` and `Priority` are mirrored as TypeScript types in `domain/` so domain logic never imports from Prisma

### SQL (reference)

```sql
CREATE TABLE projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE task_status AS ENUM ('PENDING', 'IN_PROGRESS', 'DONE');
CREATE TYPE priority AS ENUM ('LOW', 'MEDIUM', 'HIGH');

CREATE TABLE tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR NOT NULL,
  description TEXT,
  status      task_status DEFAULT 'PENDING',
  priority    priority DEFAULT 'MEDIUM',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE
);
```
