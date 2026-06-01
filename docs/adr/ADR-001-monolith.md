# ADR-001 — Architecture style: Monolith - 3 Tier

**Status:** Accepted

**Date:** 2026-06-01

## Context

The challenge requires a project task management application with a React frontend, a Node.js/Express backend, and a PostgreSQL database. The scope is a single bounded context (projects and tasks). The evaluation criteria emphasise code organisation, design decisions, and a working, demonstrable solution.

## Decision

We will build a single deployable backend service (monolith) paired with a single frontend application. No service decomposition is applied.

## Alternatives considered

| Alternative | Reason discarded |
|-------------|-----------------|
| Microservices or service-based | Over-engineered for a two-entity domain; adds operational complexity with no benefit at this scale |

## Consequences

**Positive**
- Simple to develop, run, and demonstrate locally
- Easier to reason about data consistency with one database

**Negative / trade-offs**
- As the domain grows, a monolith requires discipline to avoid coupling (mitigated by Clean Architecture internally — see ADR-002)
