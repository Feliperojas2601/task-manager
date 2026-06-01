# US-006 — Delete a project

## Story

**As a** user
**I want to** delete a project
**So that** I can remove projects that are no longer relevant, along with all their tasks

### Acceptance criteria

**Given** a project exists
**When** I confirm deletion
**Then** the project and all its associated tasks are permanently removed and the project no longer appears in the list

**Given** I attempt to delete a project that does not exist
**When** the API is called
**Then** a 404 error is returned

**Priority:** Must Have
**Epic:** Project Management

---

## Spec

### Endpoint

`DELETE /projects/:id`

### Request

| Parameter | Location | Type | Description |
|-----------|----------|------|-------------|
| `id` | path | uuid | Project identifier |

### Response

**Success `204`**

No body.

**Error cases**

| Status | Condition |
|--------|-----------|
| 404 | No project found with the given `id` |

### Validations

- `id` must be a valid UUID format; return 400 if not
- Deletion cascades to all tasks belonging to the project (enforced at DB level via `ON DELETE CASCADE` — see US-002)

### Clean architecture responsibilities

- **Infrastructure / Controller:** `DELETE /projects/:id` → validates `id` param → calls use case → returns 204
- **Application / Use case:** `DeleteProjectUseCase.execute(id)` → calls repository → throws `NotFoundError` if not found
- **Infrastructure / Repository:** `PrismaProjectRepository.delete(id)` → issues Prisma `delete` → cascade handled by DB

### SQL (reference)

```sql
DELETE FROM projects WHERE id = $1;
-- Tasks are removed automatically via ON DELETE CASCADE on tasks.project_id
```
