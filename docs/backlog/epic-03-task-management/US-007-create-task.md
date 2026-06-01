# US-007 — Create a task in a project

## Story

**As a** user
**I want to** create a task within a project with a title, optional description, status, and priority
**So that** I can track work items under the right project

### Acceptance criteria

**Given** I am viewing a project's detail page
**When** I submit the create task form with a valid title
**Then** the task is created with default status `PENDING` and priority `MEDIUM` and appears in the task list

**Given** I submit the form without a title
**When** the request reaches the API
**Then** a 400 error is returned and no task is created

**Given** the project does not exist
**When** the API is called
**Then** a 404 error is returned

**Priority:** Must Have
**Epic:** Task Management

---

## Spec

### Endpoint

`POST /projects/:projectId/tasks`

### Request

| Parameter | Location | Type | Description |
|-----------|----------|------|-------------|
| `projectId` | path | uuid | Parent project identifier |

```json
{
  "title": "string — required, non-empty",
  "description": "string — optional",
  "status": "PENDING | IN_PROGRESS | DONE — optional, default PENDING",
  "priority": "LOW | MEDIUM | HIGH — optional, default MEDIUM"
}
```

### Response

**Success `201`**
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string | null",
  "status": "PENDING | IN_PROGRESS | DONE",
  "priority": "LOW | MEDIUM | HIGH",
  "projectId": "uuid",
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

**Error cases**

| Status | Condition |
|--------|-----------|
| 400 | `title` is missing or empty, or `status`/`priority` is not a valid enum value |
| 404 | Project with `projectId` not found |

### Validations

- `title` is required and must be non-empty after trimming
- `status` must be one of `PENDING`, `IN_PROGRESS`, `DONE`; defaults to `PENDING`
- `priority` must be one of `LOW`, `MEDIUM`, `HIGH`; defaults to `MEDIUM`
- `projectId` must reference an existing project

### Clean architecture responsibilities

- **Infrastructure / Controller:** `POST /projects/:projectId/tasks` → validates path param and body → calls use case
- **Application / Use case:** `CreateTaskUseCase.execute({ projectId, title, description, status, priority })` → verifies project exists via project repository → calls task repository → returns task DTO
- **Domain / Entity:** `Task` entity with all fields; `TaskStatus` and `Priority` enums in `domain/value-objects/`
- **Infrastructure / Repository:** `PrismaTaskRepository.create(task)` → inserts row → returns mapped domain entity

### SQL (reference)

```sql
INSERT INTO tasks (id, title, description, status, priority, project_id, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
RETURNING *;
```
