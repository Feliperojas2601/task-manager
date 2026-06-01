# US-008 — Update a task

## Story

**As a** user
**I want to** update a task's title, description, status, or priority
**So that** I can reflect the current state and details of the work item

### Acceptance criteria

**Given** a task exists in a project
**When** I change its status to `IN_PROGRESS` and save
**Then** the task is updated and the new status is reflected immediately in the UI

**Given** I submit an update with an invalid status value
**When** the request reaches the API
**Then** a 400 error is returned and the task is not modified

**Given** the task does not exist
**When** the API is called
**Then** a 404 error is returned

**Priority:** Must Have
**Epic:** Task Management

---

## Spec

### Endpoint

`PATCH /tasks/:id`

### Request

| Parameter | Location | Type | Description |
|-----------|----------|------|-------------|
| `id` | path | uuid | Task identifier |

All fields are optional. Only provided fields are updated.

```json
{
  "title": "string — optional, non-empty",
  "description": "string | null — optional",
  "status": "PENDING | IN_PROGRESS | DONE — optional",
  "priority": "LOW | MEDIUM | HIGH — optional"
}
```

### Response

**Success `200`**
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
| 400 | `title` is provided but empty, or `status`/`priority` is not a valid enum value |
| 404 | No task found with the given `id` |

### Validations

- At least one field must be provided in the body; return 400 if body is empty
- `title`, if provided, must be non-empty after trimming
- `status`, if provided, must be one of `PENDING`, `IN_PROGRESS`, `DONE`
- `priority`, if provided, must be one of `LOW`, `MEDIUM`, `HIGH`

### Clean architecture responsibilities

- **Infrastructure / Controller:** `PATCH /tasks/:id` → validates `id` and body → calls use case
- **Application / Use case:** `UpdateTaskUseCase.execute(id, partialData)` → calls repository to find existing task → throws `NotFoundError` if missing → applies partial update → calls repository to persist
- **Domain:** Validation of enum values happens in the domain entity or value objects; the controller only checks shape
- **Infrastructure / Repository:** `PrismaTaskRepository.update(id, data)` → Prisma `update` with only provided fields

### SQL (reference)

```sql
UPDATE tasks
SET
  title       = COALESCE($2, title),
  description = COALESCE($3, description),
  status      = COALESCE($4, status),
  priority    = COALESCE($5, priority),
  updated_at  = NOW()
WHERE id = $1
RETURNING *;
```
