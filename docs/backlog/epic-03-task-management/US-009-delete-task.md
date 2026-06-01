# US-009 — Delete a task

## Story

**As a** user
**I want to** delete a task
**So that** I can remove work items that are no longer needed

### Acceptance criteria

**Given** a task exists in a project
**When** I confirm deletion
**Then** the task is permanently removed and no longer appears in the project's task list

**Given** I attempt to delete a task that does not exist
**When** the API is called
**Then** a 404 error is returned

**Priority:** Must Have
**Epic:** Task Management

---

## Spec

### Endpoint

`DELETE /tasks/:id`

### Request

| Parameter | Location | Type | Description |
|-----------|----------|------|-------------|
| `id` | path | uuid | Task identifier |

### Response

**Success `204`**

No body.

**Error cases**

| Status | Condition |
|--------|-----------|
| 400 | `id` is not a valid UUID |
| 404 | No task found with the given `id` |

### Validations

- `id` must be a valid UUID format; return 400 if not

### Clean architecture responsibilities

- **Infrastructure / Controller:** `DELETE /tasks/:id` → validates `id` → calls use case → returns 204
- **Application / Use case:** `DeleteTaskUseCase.execute(id)` → calls repository to verify existence → throws `NotFoundError` if missing → calls repository to delete
- **Infrastructure / Repository:** `PrismaTaskRepository.delete(id)` → Prisma `delete` by id

### SQL (reference)

```sql
DELETE FROM tasks WHERE id = $1;
```
