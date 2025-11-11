# HUB_CONTEXT — Companion to Operational Handover Prompts

## Purpose
This document preserves deep context between HUBs without overloading the live operational prompt.

New HUBs should:
1. Read this file once before starting.
2. Use the separate “Operational Handover Prompt” text block as their working system prompt.

## Project Overview
A SaaS platform enabling **hotels and venues** to automate small meeting-room bookings (2–20 people, short-lead time).
Goal: search → configure → price → pay → confirm **without staff**.

## Folder Roles
- `/handover/` → authoritative documentation spine  
  (STATUS, SPEC, ROADMAP, HUB_PROMPT, this CONTEXT)
- `/admin-ui/` → application code and runtime docs  
  (PERSISTENCE, APPENDICES, plus pointer stubs back to `/handover`)
- `/api/`, `/booker/`, `/mobile/` etc. → implementation spokes.

## Governance Rules
- Only `/handover` holds canonical strategy and documentation.
- Pointers in `/admin-ui` prevent divergence.
- Every HUB must mark completed milestones **“DONE”** before advancing.
- Each HUB adds a timestamped “Next Checkpoint” to `handover/STATUS_SUMMARY.md`.

## Known Traps
- Duplicated .md files under `/admin-ui`.
- Missing timestamps in previous HUBs.
- Large sessions slowing model context (start fresh each HUB).

## Hand-Over Pattern
Each new HUB begins with:
1. The **Operational Handover Prompt** (short 4-part block).  
2. This **Context file** loaded as read-only background.

---

### Last Updated: HUB #5 initialization
