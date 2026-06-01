# ADR-004 — ORM and migration: Prisma

**Status:** Accepted

**Date:** 2026-06-01

## Context

The backend needs to interact with the database. An ORM or query builder provides type safety and standardises query patterns. The infrastructure layer in Clean Architecture is the appropriate place to confine ORM coupling. Also a migration tool is needed to keep in sync the data model.

## Decision

We use Prisma as the ORM. The Prisma client is used exclusively within the `infrastructure` layer (repositories);

## Alternatives considered

| Alternative | Reason discarded |
|-------------|-----------------|
| TypeORM | Decorator-heavy; less idiomatic with Clean Architecture's dependency inversion |
| Sequelize | Mature but weakly typed compared to Prisma; more runtime magic |
| Raw SQL (pg) | Full control but no type safety or migration tooling built in |

## Consequences

**Positive**
- Auto-generated TypeScript types from the schema eliminate a class of runtime errors

**Negative / trade-offs**
- Prisma's query API is specific to Prisma; switching ORM requires rewriting repositories
