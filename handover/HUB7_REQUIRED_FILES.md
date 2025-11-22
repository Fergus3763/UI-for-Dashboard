# HUB7_REQUIRED_FILES.md  
**Purpose:**  
This file tells every new HUB (Hub #7, Hub #8, etc.) which files they MUST see in full before doing any work.

The HUB must **explicitly ask the Owner** to paste the full contents of these files into the new chat at the start of the session.

---

## 1. Canonical Hub Prompts & Context

These define how the HUB should think and behave:

1. `handover/HUB_PROMPT_CANONICAL.md`  
2. `handover/HUB_PROMPT.md`  
3. `handover/HUB_CONTEXT.md`

The HUB must **read these first**, in this order, before doing anything else.

---

## 2. Status & Next Actions

These describe where the project is now and what this HUB should do:

4. `handover/STATUS_SUMMARY.md`  
5. `handover/NEXT_ACTIONS_HUB6.md` (or `NEXT_ACTIONS_HUB7.md` once created)  
6. `handover/RELEASE_NOTES.md`

The HUB must use these to understand:
- What has been finished
- What is in progress
- What is expected in this HUB

---

## 3. Key Specs & Spoke Handover Files

These describe specific areas that are already defined or in progress:

7. `handover/AddOns_SPEC_MVP.md`  
8. `handover/RoomSetup_SPEC_MVP.md`  
9. `handover/Nav_RoomOverview_AddonDB_SPOKE.md`  
10. `handover/API_CONTRACT.md`  
11. `handover/INTEGRATION_PLAN.md`  

If any of these files are missing or obviously outdated, the HUB must:
- Pause
- Tell the Owner which file looks wrong
- Propose a small, clear plan to repair it **before** writing new code

---

## 4. Supabase / Data Grounding

These describe the underlying schema and seeds that may affect behaviour:

12. `handover/supabase/001_schema.sql`  
13. `handover/supabase/002_seed_instructions.md`  

The HUB should **not** change these lightly.  
Any schema change must be:
- Discussed with the Owner
- Documented in `RELEASE_NOTES.md`
- Reflected in `STATUS_SUMMARY.md`

---

## 5. Availability & Blackouts (Context Only)

14. `handover/API_CONTRACT.md` (availability + blackout sections)  
15. `handover/AVAILABILITY_SPOKE_ARCHIVE.md` (see next file)

The HUB must understand that:
- Availability and blackout logic live in **Netlify Functions + Supabase**, not in the Admin UI.  
- The old “Availability Spoke” (separate repo) is **historical** and must not be treated as live source of truth.

---

## 6. Mandatory Start-Up Behaviour for New HUBs

Before doing ANY work, a new HUB must:

1. Ask the Owner to paste the full contents of **all files in this list** (or at minimum sections 1–3).  
2. Confirm, in its own words, that it understands:
   - The project purpose  
   - The current status  
   - The specific goals for this HUB  
3. Only then propose a **short plan** (2–4 steps) for this HUB.

If any of these steps are skipped, the HUB risks repeating past mistakes:
- Guessing file paths  
- Ignoring handover docs  
- Re-implementing already-solved problems  

This file exists to prevent that.

---

_Last updated: HUB #6_  
- Added initial list for Hub #7 and beyond.  
- Future HUBs may add new required files but must not remove existing ones without discussion and documentation.
