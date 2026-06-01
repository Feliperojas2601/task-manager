# ADR-006 — API style: REST

**Status:** Accepted
**Date:** 2026-06-01

## Context

The challenge requires a backend that exposes an API consumed by a React frontend. The domain is CRUD-centric (create/read/update/delete projects and tasks), which maps directly to HTTP verbs and resource-oriented URLs.

## Decision

The backend exposes a RESTful HTTP API using standard HTTP verbs (GET, POST, PUT/PATCH, DELETE) and resource-based URL paths (e.g., `/projects`, `/projects/:id/tasks`).

## Alternatives considered

| Alternative | Reason discarded |
|-------------|-----------------|
| GraphQL | Adds schema definition overhead and a resolver layer; the frontend's data needs are simple and predictable |
| tRPC | Tight coupling between frontend and backend TypeScript codebases; acceptable but monorepo setup adds complexity |
| WebSockets / SSE | Not needed; no real-time requirement stated |

## Consequences

**Positive**
- Universally understood; easy to test with curl or any HTTP client
- Maps cleanly onto the resource model (projects, tasks)
- Stateless; each request is self-contained

**Negative / trade-offs**
- Over-fetching or under-fetching may require multiple round-trips for complex views (acceptable at this scope)
- No built-in type contract between client and server (mitigated by shared TypeScript types if desired)
