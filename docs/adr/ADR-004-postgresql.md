# ADR-004 — Database engine: PostgreSQL

**Status:** Accepted
**Date:** 2026-06-01

## Context

The challenge explicitly requires PostgreSQL as the relational database. The domain (projects with tasks having statuses and priorities) maps naturally to a relational model with foreign key constraints.

## Decision

PostgreSQL is the sole persistent store for all application data.

## Alternatives considered

| Alternative | Reason discarded |
|-------------|-----------------|
| MySQL / MariaDB | Relational alternative, but PostgreSQL is required by the challenge |
| SQLite | Suitable for local dev only; not production-grade for a multi-user system |
| MongoDB | Document model adds no advantage for a structured relational domain; excluded by the requirement |

## Consequences

**Positive**
- Relational model enforces referential integrity between projects and tasks
- Rich query capabilities (JSON columns, window functions) available if needed
- Directly satisfies the stated requirement

**Negative / trade-offs**
- Requires a running PostgreSQL instance (mitigated by Docker Compose — see ADR-010)
- More setup overhead than an embedded database
