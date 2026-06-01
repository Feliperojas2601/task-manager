# US-005 — View project detail

## Story

**As a** user
**I want to** view a project's details along with a summary of its tasks
**So that** I can understand the project's current state at a glance

### Acceptance criteria

**Given** a project exists
**When** I navigate to that project's detail page
**Then** I see the project name, description, creation date, and the full list of its tasks with their statuses and priorities

**Given** I navigate to a project ID that does not exist
**When** the API is called
**Then** a 404 error is returned and the frontend shows an appropriate message

**Priority:** Must Have
**Epic:** Project Management

---

## Spec

### Endpoint

`GET /projects/:id`

### Request

| Parameter | Location | Type | Description |
|-----------|----------|------|-------------|
| `id` | path | uuid | Project identifier |

### Response

**Success `200`**
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string | null",
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime",
  "tasks": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string | null",
      "status": "PENDING | IN_PROGRESS | DONE",
      "priority": "LOW | MEDIUM | HIGH",
      "createdAt": "ISO 8601 datetime",
      "updatedAt": "ISO 8601 datetime"
    }
  ]
}
```

**Error cases**

| Status | Condition |
|--------|-----------|
| 404 | No project found with the given `id` |

### Validations

- `id` must be a valid UUID format; return 400 if not

### Clean architecture responsibilities

- **Infrastructure / Controller:** `GET /projects/:id` → validates `id` param → calls use case → serialises response
- **Application / Use case:** `GetProjectDetailUseCase.execute(id)` → calls repository → throws `NotFoundError` if missing → returns project with tasks
- **Domain:** `NotFoundError` defined in `domain/errors/`
- **Infrastructure / Repository:** `PrismaProjectRepository.findById(id)` → queries with `include: { tasks: true }` → maps to domain entity

### SQL (reference)

```sql
SELECT p.*, t.*
FROM projects p
LEFT JOIN tasks t ON t.project_id = p.id
WHERE p.id = $1;
```
