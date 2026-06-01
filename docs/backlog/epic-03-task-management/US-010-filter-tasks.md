# US-010 — Filter and sort tasks by status and priority

## Story

**As a** user
**I want to** filter and sort tasks within a project by status and/or priority
**So that** I can focus on the most relevant work items and visualise the project's progress

### Acceptance criteria

**Given** a project has tasks with different statuses and priorities
**When** I filter by status `IN_PROGRESS`
**Then** only tasks with status `IN_PROGRESS` are shown

**Given** I apply a priority filter of `HIGH`
**When** the filtered list is displayed
**Then** only tasks with priority `HIGH` appear, regardless of status

**Given** I combine a status filter and a priority filter
**When** the list is rendered
**Then** only tasks matching both criteria are shown

**Given** no tasks match the applied filters
**When** the list is rendered
**Then** an empty state is shown

**Priority:** Must Have
**Epic:** Task Management

---

## Spec

### Endpoint

`GET /projects/:projectId/tasks`

### Request

| Parameter | Location | Type | Description |
|-----------|----------|------|-------------|
| `projectId` | path | uuid | Parent project identifier |
| `status` | query | string | Optional — filter by `PENDING`, `IN_PROGRESS`, or `DONE` |
| `priority` | query | string | Optional — filter by `LOW`, `MEDIUM`, or `HIGH` |
| `sortBy` | query | string | Optional — `createdAt` (default) or `priority` |
| `order` | query | string | Optional — `asc` or `desc` (default `desc`) |

### Response

**Success `200`**
```json
[
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
]
```

Returns an empty array `[]` when no tasks match the filters.

**Error cases**

| Status | Condition |
|--------|-----------|
| 400 | `status` or `priority` is not a valid enum value |
| 404 | Project with `projectId` not found |

### Validations

- `projectId` must reference an existing project
- `status`, if provided, must be one of `PENDING`, `IN_PROGRESS`, `DONE`
- `priority`, if provided, must be one of `LOW`, `MEDIUM`, `HIGH`
- `sortBy`, if provided, must be `createdAt` or `priority`
- `order`, if provided, must be `asc` or `desc`

### Clean architecture responsibilities

- **Infrastructure / Controller:** `GET /projects/:projectId/tasks` → parses and validates query params → calls use case
- **Application / Use case:** `ListTasksUseCase.execute({ projectId, filters })` → verifies project exists → calls repository with filter/sort options → returns task DTOs
- **Domain:** `TaskFilter` value object in `domain/value-objects/` encapsulates valid filter combinations
- **Infrastructure / Repository:** `PrismaTaskRepository.findByProject(projectId, filters)` → builds dynamic Prisma `where` clause from filters → applies `orderBy`

### SQL (reference)

```sql
SELECT * FROM tasks
WHERE project_id = $1
  AND ($2::task_status IS NULL OR status = $2)
  AND ($3::priority IS NULL OR priority = $3)
ORDER BY
  CASE WHEN $4 = 'priority' THEN priority END ASC,
  created_at DESC;
```
