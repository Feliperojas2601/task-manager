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
- **Classes** use-cases, controllers, repositories should be classes and initialized in constructors.

## 3. Error Handling & Logging

- Domain errors live in `apps/backend/src/domain/errors/` (e.g., `NotFoundError`, `ValidationError`)
- Controllers catch all errors, log them, and delegate to `next(error)`; `globalErrorHandler` handles the HTTP response
- Unhandled errors return `500` with `{ status: 500, message: "Internal server error" }`
- `console.log` and `console.error` are forbidden in production paths — use the logger exclusively

**Logging conventions:**

- **Interface:** `ILogger` in `src/application/logger/logger.interface.ts` — two methods only: `info` and `error`
- **Factory:** `createLogger(layer)` in `src/infrastructure/logging/pino-logger.ts`; each file creates a module-level logger once: `const logger = createLogger('controller' | 'use-case' | 'repository' | 'http' | 'error-handler')`
- **Correlation ID:** provided by the `correlation-id` package; `getId()` is called inside the logger on every invocation — no passing around required; `correlationIdMiddleware` binds a UUID per request via `AsyncLocalStorage`
- **Message pattern:** `ClassName.methodName - start | end | error` — consistent across all layers
- **Every method** in controllers, use cases, and repositories must log `start` at entry and `end` on success
- **Every `catch` block** must call `logger.error('ClassName.methodName - error', { message: (error as Error).message })` before rethrowing or calling `next(error)`
- **Error context:** always include `{ message }` at minimum; include `stack` only at the `error-handler` layer
- **Use cases** receive `ILogger` via constructor injection (injected by the controller, which is the composition root)
- **Repositories** import `createLogger` directly (they are already in infrastructure)

## 4. Testing Practices

- **Framework:** Jest + ts-jest (backend); no frontend tests in scope for this challenge
- **File location:** co-located with source — `foo.controller.test.ts` next to `foo.controller.ts`
- **Naming:** `describe('unit under test')` + `it('does X when Y')`
- **Coverage:** 100% line coverage required on all backend source files (except `server.ts`)
- **Mocking strategy by layer:**
  - Use-case tests: inject a mock `IRepository` directly via constructor — no jest.mock needed
  - Controller tests: `jest.mock` the use-case and repository modules; set `MockUseCase.prototype.method` before calling `buildApp()`; include `globalErrorHandler` in the test app to assert error response shapes
  - Repository tests: `jest.mock('../database/prisma', () => ({ prisma: { model: { method: jest.fn() } } }))`
  - Validator tests: no mocking needed — pure functions
- **No real DB in unit tests**

## 5. Architecture & Patterns

Backend follows **Clean Architecture** with three layers:

| Layer | Directory | Rule |
|-------|-----------|------|
| Domain | `src/domain/` | No dependencies on other layers or frameworks |
| Application | `src/application/` | Depends only on domain; defines repository interfaces and validators |
| Infrastructure | `src/infrastructure/` | Depends on application; implements Express, Prisma |

**Composition root:** Controllers are the composition root for their feature slice. The controller constructor instantiates the validator, repository, and use case. The route file only calls `new Controller()`. Use cases receive the repository interface via constructor (DI preserved at that level).

**Routes:** one file per resource in `src/infrastructure/routes/` (e.g., `project.route.ts`). Each file creates the controller and registers its routes. `router.ts` only imports and mounts route files.

**Error handling:** All domain errors extend `HttpError(statusCode, message)` from `src/domain/errors/http.error.ts`. Controllers call `next(error)` — never build the response themselves on error. `globalErrorHandler` middleware (registered last in `app.ts`) reads `err.statusCode` and responds: `{ status: number, message: string }`. Unexpected errors respond with `{ status: 500, message: "Internal server error" }`.

**Validation:** Each resource has a `XxxValidator` class in `src/application/validators/`. The controller calls `this.validator.validateXxx(req.body)` before the use case. The validator trims/coerces input and throws `ValidationError` on failure. Use cases may call the same validator for complex business-rule validation.

**Responses:** Controllers never call `res.status().json()` directly. Use `ResponseHandler.ok(res, data)` or `ResponseHandler.created(res, data)` from `src/infrastructure/http/response-handler.ts`.

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