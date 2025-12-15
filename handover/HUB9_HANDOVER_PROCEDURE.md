# HUB #9 — Handover Procedure (Step-by-Step)

## Purpose
This document explains **exactly how to hand over the project at this point** so that HUB #9 can continue the productive work of HUB #8 **without loss of context, functionality, or momentum**.

This is not optional reading.  
If it is not followed, productivity will drop.

---

## STEP 0 — What this project is (1-minute grounding)

Before doing anything else, HUB #9 must read:

1. `handover/project-context.md`
2. `handover/PERSISTANT_HUB_HANDOVER.md`
3. `handover/HUB9_QUICK_START.md`

These define:
- The business problem
- The non-negotiable constraints
- How Fergus works
- Why pricing confidence is the core product value

If any of these are skipped, the Hub will drift.

---

## STEP 1 — Confirm the build is alive (5 minutes)

Open the **production URL** and manually check:

### Navigation
- Venue ▾ opens
- Rooms ▾ opens
- Dropdowns close on:
  - Outside click
  - Route change
- Direct links load:
  - Room Overview
  - Simulation / Modelling
  - Booker Preview

### Critical pages
- `/admin/rooms`
- `/admin/simulation`
- `/admin/booker-preview`

If anything fails → **STOP** and fix before proceeding.

Then fill in:
- `handover/HUB9_BUILD_SNAPSHOT.md`

This snapshot is the “known good state”.

---

## STEP 2 — Understand the pricing spine (non-negotiable)

There is **ONE pricing engine expressed in TWO places**:

1. **Simulation / Modelling**
2. **Booker Preview**

They MUST:
- Use the same rules
- Produce the same numbers
- Change together or not at all

### Pricing terms (locked vocabulary)
These names MUST NOT be changed:

A. Room Base Price  
B. Bundle Price  
C. Offer Price  
D. Provisional Price  
E. Final Price  

Changing names = breaking trust with hotels.

---

## STEP 3 — Understand what is deliberately NOT built

The following are **explicitly excluded** at this stage:

- Availability enforcement
- Calendar collision logic
- Reservation / deposit / payment
- Saving pricing scenarios
- Partial-hour bookings
- Margin optimisation / analytics

If any of these appear in a proposal → **they are future phases**.

---

## STEP 4 — How work is done from here (Spoke-first model)

HUB #9 should **not** implement large features directly unless trivial.

Instead:

1. Define the task clearly (scope + constraints)
2. Decide if it is:
   - UI polish
   - Documentation
   - Logic extension
3. Spin up a **Spoke** with:
   - Exact files allowed to change
   - Explicit “do not touch” list
   - Requirement for FULL delete-and-replace files only

This model is what made HUB #8 successful.

---

## STEP 5 — File discipline rules (critical)

### Golden rule
> If it is not written in a file, **it does not exist**.

Therefore:
- All decisions go into `.md` files
- All changes are full file replacements
- No partial snippets unless explicitly requested

### High-risk files (edit only with care)
- `admin-ui/src/App.jsx`
- `admin-ui/src/pages/Dashboard/Rooms/index.jsx`
- `admin-ui/src/pages/Dashboard/Simulation/index.jsx`
- `admin-ui/src/pages/Dashboard/BookerPreview/index.jsx`

Any change here must:
- Preserve existing behaviour
- Be reviewed before deploy
- Be deployed in isolation if possible

---

## STEP 6 — How to deploy safely (learned the hard way)

**Rule:**  
One logical change = one commit = one deploy.

Recommended order:
1. Navigation changes
2. New page wiring (route only)
3. Page content changes

If Netlify fails:
- Retry once
- If still failing, stop and inspect logs
- Do not stack multiple fixes blindly

---

## STEP 7 — How to communicate with Fergus

Fergus is:
- Non-technical
- Highly visual
- Extremely sensitive to broken continuity

Therefore:
- 2–4 short steps per message
- Ask for “DONE” confirmation
- No long technical preambles
- Show results on screen whenever possible

---

## STEP 8 — What HUB #9 should do first

Immediate, safe, high-value work:

1. Polish **Booker Preview** UI text and clarity
2. Polish **Simulation** labels (no logic changes)
3. Create a **Demo Script** for hotel trials
4. Improve confidence cues (“This price is final”, etc.)

All of these reinforce the core value:
**Price confidence for both sides of the transaction.**

---

## STEP 9 — How to hand over again (future)

When HUB #9 is done:

1. Update:
   - `HUB9_BUILD_SNAPSHOT.md`
   - `HUB9_NEXT_ACTIONS.md`
2. Add a new `HUB10_QUICK_START.md`
3. Do NOT delete historical handover files
4. Commit documentation before code whenever possible

---

## Final instruction to HUB #9

Do not optimise for cleverness.  
Optimise for **trust, clarity, and continuity**.

That is why this project is working.
