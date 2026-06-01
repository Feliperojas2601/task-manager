# ADR-005 — ORM: Prisma

**Status:** Accepted
**Date:** 2026-06-01

## Context

The backend needs to interact with PostgreSQL. Raw SQL is verbose and error-prone for routine CRUD. An ORM or query builder provides type safety, reduces boilerplate, and standardises query patterns. The infrastructure layer in Clean Architecture is the appropriate place to confine ORM coupling.

## Decision

We use Prisma as the ORM. The Prisma client is used exclusively within the `infrastructure` layer (repositories); domain and application layers are never aware of it.

## Alternatives considered

| Alternative | Reason discarded |
|-------------|-----------------|
| TypeORM | Decorator-heavy; less idiomatic with Clean Architecture's dependency inversion |
| Sequelize | Mature but weakly typed compared to Prisma; more runtime magic |
| Knex (query builder) | More control but requires more boilerplate; schema management is separate |
| Raw SQL (pg) | Full control but no type safety or migration tooling built in |

## Consequences

**Positive**
- Auto-generated TypeScript types from the schema eliminate a class of runtime errors
- Migrations are versioned and reproducible (see ADR-011)
- Schema-first approach makes the data model explicit and reviewable

**Negative / trade-offs**
- Prisma's query API is specific to Prisma; switching ORM requires rewriting repositories
- Slight learning curve for advanced use cases (raw queries, complex joins)
