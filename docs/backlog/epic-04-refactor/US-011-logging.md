# US-011 — Structured Logging with Correlation ID

## Story

**As a** developer
**I want to** have a structured logging system that correlates log entries across layers
**So that** I can trace a full request lifecycle — from HTTP handler through use case — using a single identifier

### Acceptance criteria

**Given** any backend controller method is called
**When** the method executes
**Then** a `started` log and a `completed` log (or `failed` log on error) appear, both carrying the same `correlationId`

**Given** an unexpected error reaches the global error handler
**When** the error is handled
**Then** the full error message and stack trace are logged at `error` level with the `correlationId`

**Given** an HTTP request arrives
**When** it is processed
**Then** a single middleware logs the method, path, status code, and duration in milliseconds before the response is sent

**Given** a `correlationId` is present in the incoming `X-Request-Id` header
**When** the middleware processes it
**Then** that value is reused as the correlation ID for the entire request lifecycle

**Priority:** Must Have
**Epic:** Refactor

---

## Spec

### Overview

This story introduces **structured JSON logging** backed by [Pino](https://getpino.io) and **per-request correlation** via the [`correlation-id`](https://www.npmjs.com/package/correlation-id) package.

`correlation-id` wraps Node's `AsyncLocalStorage` and exposes a `getId()` function that returns the current request's correlation ID from anywhere in the call stack — no parameter passing, no child loggers, no changes to existing use case or controller signatures.

No new endpoints are added. No domain or application business logic changes.

---

### How `correlation-id` works

```
Request → CorrelationIdMiddleware
            correlator.withId(req.headers['x-request-id'] || undefined, next)
            └─ AsyncLocalStorage binds a UUID (or the provided header value)
               to the current async context

Anywhere in the same async chain:
            correlator.getId()  →  returns that UUID

logger.info('...')
  └─ internally calls correlator.getId()
  └─ includes correlationId in every log entry automatically
```

The logger never needs to be configured per-request. Because `AsyncLocalStorage` propagates through `await`, `Promise` chains, and callbacks, every log call made during a request automatically carries the correct ID — including calls inside use cases and repositories.

---

### Log entry format

Every log line is a JSON object written to stdout:

```json
{
  "level": "info",
  "time": 1749000000000,
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "layer": "http | controller | use-case | error-handler",
  "message": "human-readable description",
  "...": "additional context fields"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `level` | string | `debug`, `info`, `warn`, `error` |
| `time` | number | Unix epoch milliseconds (Pino default) |
| `correlationId` | string | Read from `correlator.getId()` on every call |
| `layer` | string | Set at logger instantiation per-file, e.g. `'controller'` |
| `message` | string | Short human-readable description |

---

### `ILogger` interface

Defined in `src/application/logger/logger.interface.ts`. No `child()` method — correlation ID is handled transparently by the library:

```typescript
export interface ILogger {
    info(message: string, context?: Record<string, unknown>): void;
    warn(message: string, context?: Record<string, unknown>): void;
    error(message: string, context?: Record<string, unknown>): void;
    debug(message: string, context?: Record<string, unknown>): void;
}
```

The concrete `PinoLogger` implementation reads `correlator.getId()` on every method call and merges it into the Pino log entry as `correlationId`.

---

### Log events by location

#### Correlation ID middleware (`correlation-id.middleware.ts`)

Wraps each request in `correlator.withId()` and sets the `X-Request-Id` response header:

```
correlator.withId(req.headers['x-request-id'] || undefined, () => {
    res.setHeader('X-Request-Id', correlator.getId());
    next();
})
```

#### HTTP logging middleware (`http-logger.middleware.ts`)

Registered immediately after the correlation ID middleware:

| Event | Level | Fields |
|-------|-------|--------|
| Request received | `info` | `method`, `url` |
| Response sent | `info` | `method`, `url`, `statusCode`, `durationMs` |

#### Controllers (every handler method)

Each file creates a module-level logger with `layer: 'controller'` bound. No per-request setup needed:

| Event | Level | Fields |
|-------|-------|--------|
| Handler started | `info` | `handler` (e.g. `"ProjectController.create"`) |
| Handler completed | `info` | `handler`, `statusCode` |
| Handler failed | — | Delegated to `next(error)`; the error handler logs it |

#### Global error handler (`error-handler.ts`)

| Event | Level | Fields |
|-------|-------|--------|
| `HttpError` (expected) | `warn` | `statusCode`, `message` |
| Unexpected error | `error` | `message`, `stack` |

#### Use cases (optional, for business traceability)

| Event | Level | Fields |
|-------|-------|--------|
| Use case started | `debug` | `useCase` (class name) |
| Use case completed | `debug` | `useCase` |
| Use case error | `error` | `useCase`, `message` |

---

### New files

| File | Purpose |
|------|---------|
| `src/application/logger/logger.interface.ts` | `ILogger` interface |
| `src/infrastructure/logging/pino-logger.ts` | Pino implementation; calls `correlator.getId()` on every log method; exports a factory `createLogger(layer)` |
| `src/infrastructure/middleware/correlation-id.middleware.ts` | Wraps request in `correlator.withId()`; sets `X-Request-Id` response header |
| `src/infrastructure/middleware/http-logger.middleware.ts` | Logs HTTP request received and response sent |

### Modified files

| File | Change |
|------|--------|
| `src/infrastructure/app.ts` | Mount `correlationIdMiddleware` and `httpLoggerMiddleware` before router |
| `src/infrastructure/middleware/error-handler.ts` | Replace `console.error` with `logger.error`; log `HttpError` at `warn` |
| `src/infrastructure/controllers/*.controller.ts` | Add `started` / `completed` logs using a module-level `createLogger('controller')` |

---

### Dependencies

```
npm install correlation-id pino
npm install --save-dev @types/pino   # if needed
```

---

### Testing

- `ILogger` is mocked as a plain object — no Pino or `correlation-id` dependency in unit tests
- Middleware tests wrap execution in `correlator.withId('test-id', callback)` so `getId()` resolves correctly; assert that `X-Request-Id` header is present in the response
- Error handler test replaces `console.error` (now replaced by `logger.error`) with a mock and asserts it is called for unexpected errors
- Controller tests pass a mock logger and assert `info` is called with `started` and `completed` messages

---

### Notes

- `console.log` and `console.error` must not appear in production paths after this story; only the logger is permitted
- Do not log sensitive data: no passwords, tokens, or full request bodies containing user PII
- The `stack` field is logged only at `error` level and never returned to the client
- Pino is chosen over Winston for its significantly lower serialization overhead (~5× faster at high throughput)
- `correlator.getId()` returns `undefined` outside a `correlator.withId()` context (e.g. app startup logs); the logger should handle this gracefully by omitting the field rather than crashing
