# ADR-010 — Containerisation: Docker Compose

**Status:** Accepted
**Date:** 2026-06-01

## Context

The application requires a PostgreSQL instance, a Node.js backend, and a React frontend to run together. Setting up these dependencies manually creates friction for local development and evaluation. A reproducible local environment is necessary to meet the requirement of having the application running at presentation time.

## Decision

Docker Compose is used to orchestrate all local services: PostgreSQL, the backend API, and the frontend dev server. A single `docker-compose up` starts the full stack.

## Alternatives considered

| Alternative | Reason discarded |
|-------------|-----------------|
| Manual setup (no containers) | Requires the evaluator to install and configure PostgreSQL locally; not reproducible |
| Kubernetes (minikube) | Massive overkill for local development of a two-service application |
| Podman Compose | Functionally equivalent but Docker Compose has broader adoption and familiarity |

## Consequences

**Positive**
- Reproducible environment: one command to start everything
- PostgreSQL data can be persisted via a named volume
- Isolates runtime dependencies from the host machine

**Negative / trade-offs**
- Requires Docker Desktop installed on the evaluator's machine
- Container build times add latency on first run
