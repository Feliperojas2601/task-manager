# US-NNN — <Story title>

## Story

**As a** <role>
**I want to** <action>
**So that** <outcome>

### Acceptance criteria

**Given** <precondition>
**When** <action>
**Then** <expected result>

*(Add additional Given/When/Then blocks if needed)*

**Priority:** Must Have | Should Have | Could Have | Won't Have
**Epic:** <epic name>

---

## Spec

### Endpoint

`METHOD /path`

### Request

```json
{
  "field": "type — description"
}
```

### Response

**Success `2XX`**
```json
{
  "field": "type — description"
}
```

**Error cases**

| Status | Condition |
|--------|-----------|
| 400 | Missing or invalid required field |
| 404 | Resource not found |
| 409 | Conflict (e.g., duplicate name) |

### Validations

- List each validation rule

### Clean architecture responsibilities

### SQL (reference)

```sql
-- Expected query or migration
```