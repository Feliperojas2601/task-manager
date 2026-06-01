---
name: generate-architecture
description: >
  Generates architecture documentation from a Markdown requirements document. Produces
  one ADR (Architecture Decision Record) per identified technical decision and a single
  architecture-overview.md summarising the full system design. Use this skill whenever
  the user wants to document technical decisions, produce ADRs for a new project, or
  create an architecture overview from a requirements or challenge document. Also use it
  when starting any greenfield project where architectural decisions need to be made explicit.
---

# generate-architecture

Reads a structured requirements document and produces:
1. One `ADR-NNN-<slug>.md` per architectural decision identified
2. One `architecture-overview.md` summarising the full system

ADRs capture *why* a decision was made, not just *what* was decided. They include the context that existed at the time, the alternatives that were considered, and the trade-offs accepted. This makes architectural thinking visible and auditable.

## Output structure

```
docs/
  architecture-overview.md
  adr/
    ADR-001-<slug>.md
    ADR-002-<slug>.md
    ADR-NNN-<slug>.md
```

## Steps

### Step 1 — Ask for the requirements document path

Ask the user:
> "What is the path to the requirements Markdown file?"

#### Step 1.1 — Validate the path

Run:
```bash
test -f "<path>" && echo "EXISTS" || echo "NOT_FOUND"
```

- If `NOT_FOUND`: tell the user the file was not found and abort the process.
- If `EXISTS`: continue to Step 2 and store the path in `{{requirements_path}}`.

---

### Step 2 — Read and analyse the requirements

Read the full content of the requirements file. Identify:

- **Technologies explicitly required**: frameworks, databases, languages named in the document
- **Technologies implied but not stated**: e.g., if React + Node.js are required, Docker for containerisation is a natural decision worth documenting
- **Architectural patterns**: any structural decisions that arise from the requirements (e.g., 3-layer architecture, REST API, monorepo vs. separate repos)
- **Cross-cutting concerns**: error handling strategy, authentication approach, environment configuration

Each of these becomes a candidate ADR.

---

### Step 3 — Confirm the list of ADRs with the user

Present the proposed ADR list before writing any files:

```
ADR-001 — Backend architecture: 3-layer (routes / services / repositories)
ADR-002 — Database: PostgreSQL
ADR-003 — Frontend framework: React 18
ADR-004 — API style: REST
ADR-005 — Containerisation: Docker Compose
ADR-006 — Runtime: Node.js with Express
...
```

Ask:
> "Does this list of decisions look complete? Would you add or remove any before I generate the files?"

Wait for confirmation before proceeding.

---

### Step 4 — Create the output directories

```bash
mkdir -p docs/adr
```

---

### Step 5 — Generate each ADR file

For each confirmed decision, create `docs/adr/ADR-NNN-<slug>.md` using the template in `templates/adr-template.md`.

Write all ADR files before moving to the next step.

---

### Step 6 — Generate architecture-overview.md

Create `docs/architecture-overview.md` using the template in `templates/architecture-overview-template.md`.

---

### Step 7 — Verify output

List all generated files:
```bash
find docs/adr -name "*.md" | sort
ls docs/architecture-overview.md
```

Report to the user:
> "Architecture docs generated. N ADRs + architecture overview at `docs/`."

--- 

## Notes
- Clean Architecture is an internal code organization pattern for backend services, not an architecture style and must be a default ADR with the explanation of a more maintainable, testable, and scalable codebase as the main reason. Even if the requirements don't explicitly call for it, it's a best practice that should be documented as a decision. 