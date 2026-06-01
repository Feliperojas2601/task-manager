# ADR-008 — Frontend state management: React Query + Context API

**Status:** Accepted
**Date:** 2026-06-01

## Context

The frontend needs to fetch, cache, and mutate server data (projects, tasks) and share minimal global UI state (e.g., selected project, notification state). Two categories of state emerge: server state (remote data) and client state (UI-only). Mixing them into a single store leads to complexity without benefit.

## Decision

Server state is managed with React Query (TanStack Query). Client/UI state is managed with React's built-in Context API. No global state library (Redux, Zustand) is introduced.

## Alternatives considered

| Alternative | Reason discarded |
|-------------|-----------------|
| Redux Toolkit | Overkill for a read-heavy CRUD app; React Query handles async state better |
| Zustand | Lightweight but adds a dependency for client state that Context API handles adequately at this scope |
| SWR | Similar to React Query but less feature-rich (no mutation helpers, no optimistic updates built-in) |

## Consequences

**Positive**
- React Query handles caching, background refetching, loading/error states automatically
- Context API is zero-dependency and sufficient for simple global UI state
- Clear separation between server state and UI state

**Negative / trade-offs**
- React Query adds a dependency; team must be familiar with its invalidation model
- Context API can cause unnecessary re-renders if not structured carefully with memoisation
