# ADR-001 — Architecture style: Monolith

**Status:** Accepted
**Date:** 2026-06-01

## Context

The challenge requires a project task management application with a React frontend, a Node.js/Express backend, and a PostgreSQL database. The scope is a single bounded context (projects and tasks), with a small surface area and no stated need for independent scaling of subsystems. The evaluation criteria emphasise code organisation, design decisions, and a working, demonstrable solution.

## Decision

We will build a single deployable backend service (monolith) paired with a single frontend application. No service decomposition is applied.

## Alternatives considered

| Alternative | Reason discarded |
|-------------|-----------------|
| Microservices | Over-engineered for a two-entity domain; adds operational complexity with no benefit at this scale |
| Backend-for-Frontend (BFF) pattern | Unnecessary indirection for a single frontend consumer |

## Consequences

**Positive**
- Simple to develop, run, and demonstrate locally
- Single deployment unit reduces operational overhead
- Easier to reason about data consistency with one database

**Negative / trade-offs**
- All components scale together; cannot scale backend and frontend independently
- As the domain grows, a monolith requires discipline to avoid coupling (mitigated by Clean Architecture internally — see ADR-002)
