# Contributing (plain English)

## Golden rules
- **Use plain English. Fergus is non-technical.**
- **No invented data.** Leave blanks where unknown.
- **Exact headers/order** per DataDictionary (see `glossary/Meeting_Rooms_Glossary_and_Dictionary.xlsx`).
- Keep extra/source-only columns **after** target columns and prefix them with `x_`.

## How to contribute
1) Create a branch from `main`.
2) Put new/updated CSVs in `/data` and reports in `/handover`.
3) Run `python validator.py` and fix any issues.
4) Open a Pull Request to `main`.
5) The PR must pass the **PR checklist** (see `PR_CHECKLIST.md`).

## File formats
- CSVs: **UTF-8, comma-delimited**, with headers.
- Scripts: small, focused, documented in plain English.
- UI: **single file** in `/ui/index.html` (no build tooling).

## Questions
Batch your questions in one comment using:
```
QUESTIONS:
1) File, Column: <question>
2) …
PROPOSED DEFAULTS: <…>
```
