# HUB #9 — Next Actions

## Purpose
This file is a short, practical checklist for HUB #9 to continue safely without breaking what already works.

Authoritative context lives in:
- `handover/project-context.md`
- `handover/PERSISTANT_HUB_HANDOVER.md`
- `handover/HUB9_QUICK_START.md`

---

## What is working now (do not break)

### Navigation
- Venue dropdown deep-links work:
  - `/admin/venue?view=venue`
  - `/admin/venue?view=terms`
- Rooms dropdown deep-links work:
  - `/admin/rooms?view=room-setup`
  - `/admin/rooms?view=addons-create`
  - `/admin/rooms?view=addons-catalogue`
- Direct links work:
  - `/admin/room-overview`
  - `/admin/simulation`
  - `/admin/booker-preview`

### Pricing confidence toolchain
- Add-On Catalogue + room assignment works:
  - Add-ons created in catalogue
  - Assigned to rooms as Inclusive / Optional / Not used
  - Active add-ons filtered correctly
- Simulation / Modelling works:
  - Read-only, GET-only
  - Hour-block model (start time on the hour, duration in whole hours)
  - Inclusive and Optional add-ons priced using supported models
- Booker Preview works:
  - Mirrors the same pricing logic as Simulation
  - Inclusive add-on values are hidden from the booker view (names may be shown)
  - Optional add-ons priced and added on top

---

## Critical safety rules (non-negotiable)

1) **Pricing terms must not be renamed**
Room Base Price, Bundle Price, Offer Price, Provisional Price, Final Price.

2) **Simulation and Booker Preview must remain identical in pricing logic**
If one changes, the other must change to match in the same phase.

3) **Simulator and Booker Preview must remain read-only**
- No POST requests
- No “save scenario”
- No booking/reserve/payment logic

4) **No changes to Netlify functions or Supabase schema unless explicitly approved**

---

## Top priority tasks (safe and valuable)

### Task A — Booker Preview clarity polish (no pricing logic changes)
Goal: increase demo credibility and reduce confusion.
- Improve labels and micro-copy
- Make “included vs optional” visually obvious
- Improve unsupported model messaging (avoid “treated as €0” confusion if possible)

Deliverable:
- Small UI-only tweaks in Booker Preview (and optionally Simulation if labels shared)

### Task B — Simulator clarity polish (no pricing logic changes)
Goal: make it easier for hotels to trust what they are seeing.
- Improve headings / descriptions
- Make per-hour and total prices clear
- Ensure inclusive add-on pricing multipliers are readable

Deliverable:
- Small UI-only tweaks in Simulation

### Task C — Demo script (documentation only)
Goal: let Fergus demo the product confidently in 3–5 minutes.
- Define a demo click path:
  1) Add-ons created
  2) Assigned to room
  3) Simulation proves price
  4) Booker Preview shows matching booker outcome

Deliverable:
- New doc: `handover/HUB9_DEMO_SCRIPT.md` (short)

---

## Deferred tasks (do not start yet unless explicitly requested)

- Availability enforcement (bookings vs blackout conflicts)
- Reservations, deposits, payment
- Partial-hour logic / 30-minute add-ons
- Margin tooling / pricing lab (save scenarios)
- Analytics / AI optimisation

These are future phases and must not be mixed into current work.

---

## Files that should be treated as “high risk”
Only edit these when necessary and always with full-file replacements:

- `admin-ui/src/App.jsx`
- `admin-ui/src/pages/Dashboard/Simulation/index.jsx`
- `admin-ui/src/pages/Dashboard/BookerPreview/index.jsx`
- `admin-ui/src/pages/Dashboard/Rooms/index.jsx`

If a Spoke touches these, scope must be tight and explicitly approved.

---
