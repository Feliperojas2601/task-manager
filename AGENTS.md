# AGENTS.md

## 1. Project Overview

Full-stack task management application. Users manage projects and tasks (with statuses and priorities).

**Key technologies:** React 18, Node.js, Express 4, PostgreSQL 16, Prisma 5, TypeScript 5, Docker Compose, Jest, Vite.

**Structure:**
```
apps/
  backend/   → Node.js / Express REST API (Clean Architecture)
  frontend/  → React 18 SPA (Vite)
docs/
  adr/       → Architecture Decision Records
  backlog/   → SDD user stories
```

## 2. Coding Standards & Conventions

- **Indentation:** 4 spaces everywhere (TS, TSX, JSON, YAML)
- **Naming:** camelCase for variables/functions, PascalCase for classes/types/interfaces, kebab-case for file names
- **Imports:** external packages first, then internal modules; no barrel re-exports unless necessary
- **Functions:** prefer named function declarations over arrow function assignments at module level
- **No comments** unless the why is non-obvious

## 3. Error Handling & Logging

- Domain errors live in `apps/backend/src/domain/errors/` (e.g., `NotFoundError`, `ValidationError`)
- Controllers catch domain errors and map them to HTTP status codes
- Unhandled errors return `500` with `{ "error": "Internal server error" }`
- No `console.log` in production paths; use `console.error` for unexpected errors only

## 4. Testing Practices

- **Framework:** Jest + ts-jest (backend); no frontend tests in scope for this challenge
- **File location:** co-located with source — `foo.controller.test.ts` next to `foo.controller.ts`
- **Naming:** `describe('unit under test')` + `it('does X when Y')`
- **Coverage:** 100% line coverage required on all backend source files (except `server.ts`)
- **Mocking:** mock only at infrastructure boundaries (repositories); never mock domain or use-case logic
- **No real DB in unit tests** — repository interfaces are injected and mocked in use-case tests

## 5. Architecture & Patterns

Backend follows **Clean Architecture** with three layers:

| Layer | Directory | Rule |
|-------|-----------|------|
| Domain | `src/domain/` | No dependencies on other layers or frameworks |
| Application | `src/application/` | Depends only on domain; defines repository interfaces |
| Infrastructure | `src/infrastructure/` | Depends on application; implements Express, Prisma |

- Dependency injection: use-cases receive repository interfaces via constructor
- Controllers are thin: validate input → call use case → serialise response
- No business logic in controllers or repositories

## 6. Security Practices

- Validate all incoming request bodies in the controller before passing to use cases
- Never expose raw Prisma errors to HTTP responses
- No secrets in source code; use `.env` (gitignored)

## 7. Documentation Requirements

- No JSDoc or multi-line comment blocks
- Single-line comments only when the why is non-obvious
- Each user story in `docs/backlog/` is the source of truth for its feature spec

## 8. Development Workflow
- Run `npm test` to validate code after completing the development of a user story.