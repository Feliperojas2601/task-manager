# US-003 — Create a project

## Story

**As a** user
**I want to** create a new project with a name and optional description
**So that** I can organise tasks under it

### Acceptance criteria

**Given** I am on the projects page
**When** I submit the create project form with a valid name
**Then** the project is saved and appears in the project list

**Given** I submit the form with an empty name
**When** the request reaches the API
**Then** a 400 error is returned and no project is created

**Priority:** Must Have
**Epic:** Project Management

---

## Spec

### Endpoint

`POST /projects`

### Request

```json
{
  "name": "string — required, non-empty",
  "description": "string — optional"
}
```

### Response

**Success `201`**
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string | null",
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

**Error cases**

| Status | Condition |
|--------|-----------|
| 400 | `name` is missing or empty |

### Validations

- `name` is required and must be a non-empty string after trimming
- `description` is optional; store `null` if not provided

### Clean architecture responsibilities

- **Infrastructure / Controller:** `POST /projects` → validates request body → calls use case
- **Application / Use case:** `CreateProjectUseCase.execute({ name, description })` → calls repository → returns created project DTO
- **Domain / Entity:** `Project` entity with `id`, `name`, `description`, `createdAt`, `updatedAt`
- **Infrastructure / Repository:** `PrismaProjectRepository.create(project)` → inserts row → returns mapped domain entity

### SQL (reference)

```sql
INSERT INTO projects (id, name, description, created_at, updated_at)
VALUES ($1, $2, $3, NOW(), NOW())
RETURNING *;
```
