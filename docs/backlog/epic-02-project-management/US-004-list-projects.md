# US-004 — List all projects

## Story

**As a** user
**I want to** see a list of all my projects
**So that** I can navigate to a specific project and manage its tasks

### Acceptance criteria

**Given** there are existing projects in the database
**When** I open the application
**Then** all projects are displayed with their name, description, and creation date

**Given** there are no projects
**When** I open the application
**Then** an empty state message is shown prompting me to create the first project

**Priority:** Must Have
**Epic:** Project Management

---

## Spec

### Endpoint

`GET /projects`

### Request

No body. No query parameters required.

### Response

**Success `200`**
```json
[
  {
    "id": "uuid",
    "name": "string",
    "description": "string | null",
    "taskCount": "number — total tasks in this project",
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime"
  }
]
```

Returns an empty array `[]` when no projects exist.

**Error cases**

| Status | Condition |
|--------|-----------|
| 500 | Unexpected server error |

### Validations

- No input validation required for this endpoint

### Clean architecture responsibilities

- **Infrastructure / Controller:** `GET /projects` → calls use case → serialises response
- **Application / Use case:** `ListProjectsUseCase.execute()` → calls repository → returns list of project DTOs including `taskCount`
- **Infrastructure / Repository:** `PrismaProjectRepository.findAll()` → queries all projects with `_count: { tasks: true }` → maps to domain DTOs

### SQL (reference)

```sql
SELECT
  p.id,
  p.name,
  p.description,
  COUNT(t.id) AS task_count,
  p.created_at,
  p.updated_at
FROM projects p
LEFT JOIN tasks t ON t.project_id = p.id
GROUP BY p.id
ORDER BY p.created_at DESC;
```
