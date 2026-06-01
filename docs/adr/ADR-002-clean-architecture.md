# ADR-002 — Backend internal structure: Clean Architecture

**Status:** Accepted

**Date:** 2026-06-01

## Context

The challenge explicitly values code organisation and design decisions as part of the evaluation. The backend must expose a REST API, contain business logic, and persist data to PostgreSQL.

## Decision

The backend is organised into three concentric layers: `domain` (entities and business rules), `application` (use cases and interfaces), and `infrastructure` (controllers, repositories, external adapters).

## Alternatives considered

| Alternative | Reason discarded |
|-------------|-----------------|
| 3-layer (routes / services / repositories) | Simpler but lacks of maintanibility |

## Consequences

**Positive**
- Domain logic is framework-agnostic and fully unit-testable
- Infrastructure can be swapped (e.g., replace Prisma with raw SQL) without touching business logic

**Negative / trade-offs**
- Requires discipline to maintain
