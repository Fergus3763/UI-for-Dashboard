HUB9_QUICK_START.md

Purpose
This file gets a new Hub productive fast without re-interpreting the product.
It assumes PERSISTANT_HUB_HANDOVER.md has already been read.

1. What exists now (current state)
Top-level Admin Navigation

Venue ▾

Venue Setup

Booking Policy / Terms

Rooms ▾

Rooms (Create / Edit)

Add-Ons (Create / Edit)

Add-On Catalogue & Assignment

Room Overview

Simulation / Modelling ✅

Booker Preview ✅

Addon DB is intentionally removed from navigation.
Add-Ons now live where they are used, not as a standalone concept.

2. Pricing system (DO NOT reinterpret)

The canonical pricing model is locked and documented in:

📄 PERSISTANT_HUB_HANDOVER.md

Key reminder:

Room Base Price → hotel input (per person / per room, rule applies)

Bundle Price → base + inclusive add-ons

Offer Price → what the booker first sees

Provisional Price → offer + selected optional add-ons

Final Price → provisional at confirmation (MVP)

Both Simulation and Booker Preview use the same logic.

⚠️ Any change to pricing logic must update both or neither.

3. Simulation / Modelling (Hotel-only)

Location:

/admin/simulation


Purpose:

Hotel reassurance

Internal validation

Demo credibility

Current assumptions:

Hour-block bookings only

Start times on the hour

Duration: 1–12 hours

PER_EVENT, PER_PERSON, PER_PERIOD(HOUR) supported

No availability, no reservation, no payment

Hard rule:
Simulation is read-only.
No POSTs. No saves. No side effects.

4. Booker Preview (Admin-only demo)

Location:

/admin/booker-preview


Purpose:

Show exactly what a booker would experience

Validate trust: “what the hotel calculates = what the booker sees”

Key constraints:

Inclusive add-ons: names only, no prices shown

Optional add-ons: selectable, priced live

Same hour-block assumptions as Simulation

No availability logic

No payment

No persistence

This page is not the real booking flow — it is a truthful preview.

5. File ownership (critical for Spoke management)
Core pricing logic lives in:

SimulationPage

BookerPreviewPage

These must evolve together.

Navigation & routing:

admin-ui/src/App.jsx

Query-string driven views for Venue and Rooms

Rooms & Add-Ons:

Rooms/index.jsx owns:

room state

add-on assignment

canonical data wiring

6. Spoke management rules (non-negotiable)

When briefing Spokes:

✅ DO

Give access only to files required for the task

Require full delete-and-replace for modified files

Require explicit commit messages

Require confirmation that no existing functionality is removed

❌ DO NOT

Allow “helpful refactors”

Allow renaming of pricing terms

Allow silent schema changes

Allow touching Netlify functions unless explicitly approved

Allow “temporary” logic forks between Simulation and Booker Preview

If a Spoke needs a new file:

They must ask

Hub must approve

Scope must be written down first

7. What is intentionally not done yet

These are known and deferred — not missing:

Availability / calendar enforcement

Partial-hour bookings

+30 min extensions

Payment / reservation logic

Saving simulator scenarios

Pricing analytics / margin tooling

Do not let a Spoke “just add a bit of logic” here.

8. Immediate safe next steps for Hub #9

Recommended order:

Stabilise Simulator + Booker Preview (UX polish only)

Align copy/labels (after helper walkthrough is planned)

Prepare demo script for hotels

Only then consider:

Availability logic

Booker journey wiring

Margin tooling

9. If something breaks

First check:

Was PERSISTANT_HUB_HANDOVER.md violated?

Did a Spoke touch files they weren’t assigned?

Did pricing logic diverge between Simulator and Booker Preview?

If yes → revert immediately.

End of HUB9 Quick Start
