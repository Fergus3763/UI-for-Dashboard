# HUB_CONTEXT — Companion to Operational Handover Prompts

#> NOTE: This file contains historical and architectural context only.
> It is *not* the operational prompt.  
> Hub #8 must always follow the canonical prompt at `/handover/HUB_PROMPT_CANONICAL.md`.
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
## Room Setup Spoke (HUB #7)

**Scope**

This spoke implements a complete Room Setup system for the Admin UI. It does **not** modify availability, booking flow, pricing engine logic, Netlify functions, or other admin tabs.

**Data Model**

All room data is stored in `admin_ui_config.data.rooms` as an array of room objects with the following shape:

```json
{
  "id": "string",                 // stable unique id (uuid)
  "code": "string",               // auto-generated: RM-001 etc unless admin overrides
  "name": "string",
  "description": "string",
  "active": true,
  "images": ["url1", "url2", "..."],   // max 6
  "features": ["WiFi", "Projector", "..."],
  "layouts": [
    { "type": "Boardroom", "min": 4, "max": 20 },
    { "type": "U-Shape", "min": 6, "max": 18 },
    { "type": "Custom", "name": "My Special Layout", "min": 5, "max": 12 }
  ],
  "bufferBefore": 0,
  "bufferAfter": 0,
  "pricing": {
    "perPerson": 20,
    "perRoom": 100,
    "rule": "higher"
  },
  "includedAddOns": ["id1", "id2"]
}

Use this simple format:

### HUB #N → HUB #N+1
- <your note>

### HUB #N+1 → HUB #N+2
- <next note>
### HUB #6 → HUB #7
- Add-Ons have been fully migrated into Rooms; VenueSetup no longer owns them.
- Navigation now includes Room Overview and Addon DB — both placeholders.
- RoomSetup_SPEC_MVP.md defines the next required Spoke.
- The old Availability Spoke repository is archived and must not be reused.
- HUB #7 must begin by implementing Room Setup, then rebuild availability cleanly.

_(Do not delete previous HUB notes; append only.)_


---

### Last Updated: HUB #5 initialization
### HUB #6 → HUB #7
- HUB #7 must request all files listed in `handover/HUB7_REQUIRED_FILES.md` before doing any work.
- Availability Spoke (archived at availability-spoke repo) should NOT be used; a clean rebuild will be done under HUB #7.
- Admin UI logic for Venue, Booking Policy, Rooms, Add-Ons is stored in `admin_ui_config.data`.
(Do not delete previous HUB notes; append only.)_
### HUB #7 → HUB #8
- Room Setup has been rebuilt from scratch with a stable schema and UI.
- Booker View (Basic MVP) delivered; relies on Room Setup fields (layouts, images, pricing, buffers, add-ons).
- Add-Ons tab was restored; next phase is consolidation so global add-ons can be assigned to rooms.
- Room Overview and Add-On DB must now be built as separate Spokes.
- Vite/Netlify build now uses `/dist` — all static pages must live in `admin-ui/public` and will be copied automatically.

