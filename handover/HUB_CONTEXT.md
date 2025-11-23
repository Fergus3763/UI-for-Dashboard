# HUB_CONTEXT — Companion to Operational Handover Prompts

#> NOTE: This file contains historical and architectural context only.
> It is *not* the operational prompt.  
> Hub #7 must always follow the canonical prompt at `/handover/HUB_PROMPT_CANONICAL.md`.
### Availability Spoke (Archived)
The old “availability-spoke” GitHub repository was an early prototype.  
It failed to stabilise, lacked DB persistence, and was superseded during HUB#6’s rebuild.  
HUB #7 must treat it as **historical only** and must not reuse or import any code from it.

# Purpose
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

## 🔁 Context Relay — for the Next HUB

Each HUB should add a short note (2–4 lines) here before hand-over,
describing something they believe the *next HUB* must understand.

Focus on:
- A decision or design choice that might not be obvious later.
- A pain point or friction you encountered that should be avoided.
- A clarification of project intent or architecture that matured during your cycle.

Use this simple format:

### HUB #N → HUB #N+1
- <your note>

### HUB #N+1 → HUB #N+2
- <next note>

_(Do not delete previous HUB notes; append only.)_


---

### Last Updated: HUB #5 initialization
### HUB #6 → HUB #7
- HUB #7 must request all files listed in `handover/HUB7_REQUIRED_FILES.md` before doing any work.
- Availability Spoke (archived at availability-spoke repo) should NOT be used; a clean rebuild will be done under HUB #7.
- Admin UI logic for Venue, Booking Policy, Rooms, Add-Ons is stored in `admin_ui_config.data`.
