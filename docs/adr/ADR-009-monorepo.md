# ADR-009 — Repo structure: Monorepo

**Status:** Accepted
**Date:** 2026-06-01

## Context

The system has two codebases: a Node.js backend and a React frontend. Both must be submitted together and run locally as a unit. The evaluator needs to clone one repository and start the full stack. Managing two separate repositories adds overhead with no benefit at this scale.

## Decision

Frontend and backend live in a single Git repository. They are organised under `apps/frontend` and `apps/backend` (or equivalent top-level directories). A single root `docker-compose.yml` orchestrates both.

## Alternatives considered

| Alternative | Reason discarded |
|-------------|-----------------|
| Two separate repos | Complicates local setup; evaluator must clone and configure two repos |
| Nx / Turborepo monorepo tooling | Adds build orchestration overhead unnecessary for two apps |

## Consequences

**Positive**
- Single `git clone` + `docker-compose up` to run the full stack
- Shared TypeScript types can be extracted to a `packages/shared` directory if needed
- Simpler CI/CD pipeline for a single submission

**Negative / trade-offs**
- Frontend and backend are coupled in the same release cycle
- Repo grows larger over time (acceptable for this scope)
