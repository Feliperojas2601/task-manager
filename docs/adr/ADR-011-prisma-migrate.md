# ADR-011 — Database migrations: Prisma Migrate

**Status:** Accepted
**Date:** 2026-06-01

## Context

The PostgreSQL schema must be created and kept in sync with the application's data model as it evolves. Without a migration tool, schema changes are applied manually and inconsistently across environments. Since Prisma is already chosen as the ORM (ADR-005), its built-in migration system is the natural fit.

## Decision

Prisma Migrate is used to manage all database schema changes. Migration files are committed to version control and applied automatically on startup (or via an explicit migration step in Docker Compose).

## Alternatives considered

| Alternative | Reason discarded |
|-------------|-----------------|
| Flyway | Language-agnostic and powerful, but adds a separate toolchain when Prisma Migrate covers the same need |
| Liquibase | Same reasoning as Flyway; unnecessary given Prisma is already in the stack |
| Manual SQL scripts | Error-prone and not reproducible across environments |

## Consequences

**Positive**
- Schema changes are versioned alongside application code in the same repository
- `prisma migrate deploy` can be run in CI or on container startup for zero-config environments
- Prisma Studio provides a visual DB browser for development

**Negative / trade-offs**
- Prisma Migrate generates SQL that may need manual review for complex migrations (e.g., data backfills)
- Locked to Prisma; switching ORM means migrating the migration history too
