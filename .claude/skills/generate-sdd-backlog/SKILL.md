---
name: generate-sdd-backlog
description: >
  Generates a full SDD-style backlog from a Markdown requirements document. Produces
  one Markdown file per user story organized in epic folders, where each file contains
  both the story (Given/When/Then, MoSCoW priority) and the technical spec (API contract,
  responsibilities, validations, error cases). Use this skill whenever the user
  wants to derive user stories from a requirements doc, create a structured backlog for
  a project, or produce spec-first documentation before writing code.
---

# generate-sdd-backlog

Reads a structured requirements document (Markdown) and produces a full SDD backlog: one `.md` file per user story, grouped by epic, each containing the story definition and its technical specification in a single document.

The goal is that a developer (or Claude Code) can read any story file and immediately know what to build — no additional context needed.

## Output structure

```
docs/backlog/
  epic-01-<name>/
    US-001-<slug>.md
    US-002-<slug>.md
  epic-02-<name>/
    US-003-<slug>.md
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
- If `EXISTS`: continue to Step 2.

---

### Step 2 — Read and analyse the requirements

Read the full content of the requirements file. From it, identify:

- **Functional requirements**: what the system must do
- **Entities**: the main data objects involved (e.g., Project, Task)
- **Technical constraints**: stack, patterns, or architectural rules mentioned
- **Implicit requirements**: things not stated but necessary for the system to work (e.g., listing is required for creating to make sense)

Produce an internal summary of epics and stories before writing any files. Think about grouping: each epic should represent a cohesive domain (e.g., Project Management, Task Management).
Stories should be vertical slices of functionality that can be implemented independently and follow INVEST principles.

---

### Step 3 — Confirm the epic and story breakdown with the user

Present the proposed structure to the user before writing any files:

```
Epic 01 — Projects
  US-001 Create project
  US-002 List projects
  US-003 Delete project

Epic 02 — Tasks
  US-004 Create task
  US-005 Update task status
  US-006 List tasks by project
  ...
```

Ask:
> "Does this breakdown look right? Would you add, remove, or rename anything before I generate the files?"

Wait for confirmation before proceeding.

---

### Step 4 — Create the output directory structure

For each confirmed epic, create its folder:
```bash
mkdir -p docs/backlog/epic-NN-<slug>
```

Use zero-padded numbers for epic and story IDs (`epic-01`, `US-001`).

---

### Step 5 — Generate each story file

For each user story, create `docs/backlog/epic-NN-<name>/US-NNN-<slug>.md` using the template in `templates/user-story-template.md`.

Write all story files before moving to the next step.

---

### Step 6 — Verify output

After writing all files, list the generated structure:
```bash
find docs/backlog -type f -name "*.md" | sort
```

Report to the user:
> "Backlog generated. N epics, M stories total. Files are at `docs/backlog/`."

---

## Notes

- For stories that are purely frontend (UI views, navigation), omit the SQL section and replace the endpoint spec with a component/state description.
- If a story has no clear API contract (e.g., "Display dashboard"), describe the data it needs to fetch and from which endpoints.
- Prioritize clarity over completeness in specs — the spec exists to guide code generation, not to be a formal contract.
- Take in count Clean Architecture as an internal code organization pattern for backend services and write specs accordingly, even if it's not explicitly mentioned in the requirements.