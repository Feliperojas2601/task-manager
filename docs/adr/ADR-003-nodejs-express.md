# ADR-003 — Runtime & framework: Node.js with Express

**Status:** Accepted
**Date:** 2026-06-01

## Context

The challenge specifies Node.js for the backend. A minimal HTTP framework is needed to expose REST endpoints. The evaluation does not require a complex framework — clarity and structure are more important than framework features.

## Decision

We use Node.js as the runtime and Express as the HTTP framework for routing and middleware.

## Alternatives considered

| Alternative | Reason discarded |
|-------------|-----------------|
| Fastify | Faster than Express but less familiar to most reviewers; no material benefit for this scope |
| NestJS | Opinionated and adds significant scaffolding; Clean Architecture is implemented explicitly rather than through a framework |
| Hono | Lightweight and modern but less ecosystem maturity for this evaluation context |

## Consequences

**Positive**
- Directly satisfies the stated requirement
- Minimal framework overhead; architecture decisions are explicit, not framework-imposed
- Large ecosystem and broad familiarity

**Negative / trade-offs**
- Express is unopinionated; structure must be enforced by convention (handled by ADR-002)
- No built-in TypeScript support; requires tsconfig and build step
