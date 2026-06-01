---
name: pdf-to-markdown
description: >
  Converts a PDF file to a structured, clean Markdown file using the Marker library.
  Use this skill whenever the user wants to convert a PDF to Markdown, extract content
  from a PDF into readable text, or when any downstream skill needs a Markdown
  representation of a PDF document (e.g., before generating a backlog or architecture
  docs from a technical challenge PDF).
---

# pdf-to-markdown

Converts a PDF to a clean, structured Markdown file using [Marker](https://github.com/datalab-to/marker). Marker is a high-accuracy PDF-to-Markdown converter that preserves headings, tables, lists, and code blocks.

## Steps

### Step 1 — Ask for the PDF path

Ask the user:
> "What is the path to the PDF file you want to convert?"

Accept either an absolute path or a path relative to the current working directory.

#### Step 1.1 — Validate the path

Run:
```bash
test -f "<path>" && echo "EXISTS" || echo "NOT_FOUND"
```

- If `NOT_FOUND`: tell the user the file was not found at that path and abort the process.
- If `EXISTS`: store the path in a variable `{{pdf_path}}`.

---

### Step 2 — Validate Python

Run:
```bash
python3 --version 2>&1
```

- If the command fails or returns an error: tell the user Python 3 is required and abort the process.

---

### Step 3 — Validate Marker

Run:
```bash
  python3 -m pip show marker-pdf 2>&1
```
Or: 
```bash
  pipx list | grep marker-pdf
```
  
- If it fails: continue to Step 3.1.

#### Step 3.1 — Install Marker

Tell the user: "Marker is not installed. Installing now..."

Run:
```bash
python3 -m pip install marker-pdf 2>&1
```

- If the installation fails: show the user the error output and abort the process.
- If it succeeds: verify the installation by re-running the import check from Step 3, then continue to Step 4.

---

### Step 4 — Store the output path

Derive the output path from the PDF directory path. For example:
- If the PDF is at `~/Documents/challenge.pdf`, the output path should be `~/Documents/`. Store this path in `{{output_dir}}` for use in the next steps.

---

### Step 5 — Execute Marker

Run:
```bash
marker_single `{{pdf_path}}` --output_dir `{{output_dir}}` 2>&1
```

This process can take a few minutes, timeout after 10 minutes. 

---

### Step 6 — Verify and report

Marker generates a Markdown file with the same base name as the PDF. For example, if the PDF is `challenge.pdf`, the output will be `challenge.md` in the output directory `{{output_dir}}/challenge/`.
Open the output file and check that:
- It is not empty
- It contains readable Markdown content (headings, paragraphs)

Save the full path to the generated Markdown file in `{{output_path}}` for reporting.
Report to the user:
> "Conversion complete. Output saved to `{{output_path}}`."

