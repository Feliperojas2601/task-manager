# ADR-002 — Backend internal structure: Clean Architecture

**Status:** Accepted
**Date:** 2026-06-01

## Context

The challenge explicitly values code organisation and design decisions as part of the evaluation. The backend must expose a REST API, contain business logic (task states, priorities, project associations), and persist data to PostgreSQL. A flat structure (routes → DB) would make this logic hard to test and evolve. A disciplined layering model is warranted.

## Decision

The backend is organised into three concentric layers: `domain` (entities and business rules), `application` (use cases and interfaces), and `infrastructure` (Express controllers, Prisma repositories, external adapters). Dependencies flow strictly inward — infrastructure depends on application, application depends on domain, never the reverse.

## Alternatives considered

| Alternative | Reason discarded |
|-------------|-----------------|
| 3-layer (routes / services / repositories) | Simpler but lacks explicit domain isolation; business logic tends to leak into services without a domain boundary |
| No layering (flat MVC) | Fast to scaffold but produces tightly coupled code that is hard to test and maintain |

## Consequences

**Positive**
- Domain logic is framework-agnostic and fully unit-testable
- Use cases are explicit and independently testable without HTTP or DB
- Infrastructure can be swapped (e.g., replace Prisma with raw SQL) without touching business logic

**Negative / trade-offs**
- More boilerplate and indirection than a flat structure
- Requires discipline to keep dependencies flowing inward
