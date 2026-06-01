# ADR-007 — Frontend framework: React 18

**Status:** Accepted
**Date:** 2026-06-01

## Context

The challenge explicitly requires React version 18 or higher for the frontend. The application needs to display projects, associated tasks, statuses, and priorities — a component-based UI model is well suited.

## Decision

The frontend is built with React 18, using functional components and hooks throughout.

## Alternatives considered

| Alternative | Reason discarded |
|-------------|-----------------|
| Vue 3 | Not specified by the challenge |
| Angular | Not specified by the challenge |
| Next.js (React SSR) | Adds server-side rendering complexity not required by the challenge; a SPA is sufficient |

## Consequences

**Positive**
- Directly satisfies the stated requirement
- Concurrent rendering features (Suspense, transitions) available if needed
- Large ecosystem; broad evaluator familiarity

**Negative / trade-offs**
- React alone does not dictate folder structure or data-fetching strategy — these must be decided explicitly (see ADR-008)
