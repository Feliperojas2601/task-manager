---
name: init-project
description: >
  Bootstraps a new full-stack project from a PDF technical challenge. Orchestrates
  pdf-to-markdown, generate-architecture, and generate-sdd-backlog in sequence to
  produce the full docs/ structure (challenge.md, ADRs, architecture overview, and
  SDD backlog) in a single command. Use this skill at the very start of a new project
  when the user has a PDF specification, technical challenge, or requirements document
  and wants to initialise the repository documentation automatically.
---

# init-project

Single entry point for bootstrapping a new project from a PDF. Runs three skills in sequence:

1. `pdf-to-markdown` → converts the PDF to `docs/challenge.md`
2. `generate-architecture` → produces ADRs + `docs/architecture-overview.md`
3. `generate-sdd-backlog` → produces the full backlog under `docs/backlog/`

The output is a repository with all foundational documentation in place before a single line of application code is written.

## Steps

### Step 1 — Ask for the PDF path

Ask the user:
> "What is the path to the technical challenge PDF?"

Accept either an absolute path or a path relative to the current working directory.

#### Step 1.1 — Validate the path

Run:
```bash
test -f "<path>" && echo "EXISTS" || echo "NOT_FOUND"
```

- If `NOT_FOUND`: tell the user the file was not found and abort the process.
- If `EXISTS`: continue to Step 2.

---

### Step 2 — Validate the repository state

Check that the current directory is a Git repository:
```bash
git rev-parse --is-inside-work-tree 2>&1
```

- If not a Git repo: continue anyway but warn that changes won't be tracked.
- If it is a Git repo: continue.

Check that `docs/` does not already exist to avoid overwriting previous output:
```bash
test -d docs && echo "EXISTS" || echo "NOT_FOUND"
```

- If `docs/` already exists: warn the user and ask if they want to continue.
- If it does not exist: continue.

---

### Step 3 — Create the base directory structure

```bash
mkdir -p docs/adr
mkdir -p docs/backlog
```

Tell the user: "Directory structure ready. Starting documentation generation..."

---

### Step 4 — Run pdf-to-markdown

Follow the `pdf-to-markdown` skill in full, using the PDF path from Step 1.

Target output: `{{output_path}}`
Do not continue to Step 5 until the Markdown file is successfully created and move ``{{output_path}}`` to `docs/challenge.md`.

---

### Step 5 — Run generate-architecture and generate-sdd-backlog

Run both skills using `docs/challenge.md` as input. Since both read from the same file and write to separate output directories, run them sequentially:

First run `generate-architecture`:
- Skip Step 1 and 1.1 of that skill (path is already known: `docs/challenge.md`)
- Complete all remaining steps including user confirmation of ADR list

Then run `generate-sdd-backlog`:
- Skip Step 1 and 1.1 of that skill (path is already known: `docs/challenge.md`)
- Complete all remaining steps including user confirmation of epic/story breakdown

---

### Step 6 — Verify the full output

Run:
```bash
echo "=== Root docs ===" && ls docs/*.md
echo "=== ADRs ===" && find docs/adr -name "*.md" | sort
echo "=== Backlog ===" && find docs/backlog -name "*.md" | sort
```

Report a summary to the user:

```
Project initialised successfully.

docs/
  challenge.md          ← requirements extracted from PDF
  architecture-overview.md
  adr/
    ADR-001-...md
    ADR-002-...md
    ...
  backlog/
    epic-01-.../
      US-001-....md
      ...
    epic-02-.../
      ...

Next steps:
  1. Review docs/architecture-overview.md and the ADRs in docs/adr/
  2. Review the backlog in docs/backlog/ — each story includes its spec
  3. Start development story by story, using each US-NNN.md as the input to Claude Code
```

---

## Notes

- This skill is a pure orchestrator. All logic for PDF conversion, architecture generation, and backlog creation lives in the individual skills.
- If any individual skill fails, stop and surface the error. Do not attempt to continue with partial output.
- User confirmation steps inside child skills (epic breakdown, ADR list) are preserved — this skill does not skip them.
