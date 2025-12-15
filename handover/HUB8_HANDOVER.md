📘 UI-for-Dashboard/handover/HUB8_HANDOVER.md

Status: Canonical handover for the next Hub
Scope: Admin Dashboard, Pricing, Add-Ons, Simulation, Booker Preview
Audience: Next Hub owner, future Spokes, emergency recovery

1. What This Product Is (Non-Negotiable)

This product exists to establish absolute trust in pricing for both sides of a hotel meeting-room transaction.

Hotel trust:
The hotel must be able to prove that every cost element (room, time, inclusives, optionals) is correctly included in the price shown.

Booker trust:
The booker must see a clear, consistent, final price that does not change unpredictably.

Everything else (UX polish, analytics, automation) is secondary.

2. Core Pricing Philosophy (Frozen)

Pricing is intentionally transparent, layered, and deterministic.

Canonical Price Terms (DO NOT RENAME)

These terms are used across code, UI, simulator, and preview:

Room Base Price
The starting price for the room itself, before add-ons.

Bundle Price
Room Base Price + all Inclusive Add-Ons.

Offer Price
The price first shown to the booker (equals Bundle Price).

Provisional Price
Offer Price + any selected Optional Add-Ons.

Final Price
The price accepted and paid (MVP = Provisional Price).

⚠️ Any future Hub or Spoke attempting to rename or merge these concepts is breaking the system.

3. Time Model (Intentional Design)

Bookings are sold in whole-hour blocks.

Start times are on the hour (e.g. 09:00, 10:00).

If a meeting starts at 08:30, the booker books 08:00–10:00.

This is not a limitation, it is a revenue-optimising model:

Inclusive add-ons are already “consumed”

Hotels retain pricing control

Simplifies availability logic later

This aligns with the 2–10 person post-COVID meeting market, while still supporting larger bookings.

4. Add-Ons: Canonical Rules
Add-On Catalogue (Global)

Created and priced once

Have:

Unique code

Pricing model (PER_EVENT, PER_PERSON, PER_PERIOD(HOUR))

Amount

Active / inactive state

Room Assignment (Per Room)

Each add-on, per room, can be:

Not Used

Inclusive (bundled into room)

Optional (chargeable upsell)

Rules:

An add-on cannot be both Inclusive and Optional for the same room.

Inclusive add-ons are never priced individually for the booker.

Optional add-ons are always shown as line items.

5. Simulator (Hotel-Side)
Purpose

The simulator exists to answer one question:

“What price will the booker see and pay, and why?”

Characteristics

Read-only

GET /load_config only

No saving

No availability

No payment

No booking

What It Shows

Full internal breakdown:

Room Base Price (per hour + total)

Inclusive add-ons with pricing logic

Optional add-ons

Bundle / Offer / Provisional / Final prices

Strategic Role

Reassurance tool

Demonstration tool

Pricing experimentation (future “Pricing Lab”)

6. Booker Preview (Admin-Only)
Purpose

A mirror of the simulator, showing what a real customer would see.

Key Differences vs Simulator

Inclusive add-on values hidden

Inclusive add-on names may be shown

Optional add-ons shown as selectable upsells

Same pricing rules, same outputs

Critical Rule

Simulator and Booker Preview must always share identical pricing logic.
If they diverge, trust is broken.

7. Navigation & IA (Current State)

Top-level admin navigation now includes:

Venue ▾

Venue Setup

Booking Policy / Terms

Rooms ▾

Rooms (Create / Edit)

Add-Ons (Create / Edit)

Add-On Catalogue & Assignment

Room Overview

Simulation / Modelling

Booker Preview

This structure is deliberate:

Avoids burying the USP

Keeps Rooms as the organisational anchor

Allows future evolution without re-routing hell

8. Hard Constraints (Do Not Break)

❌ No POST from Simulator or Booker Preview

❌ No saving scenarios

❌ No touching availability, reserve, payment logic

❌ No Netlify function changes

❌ No Supabase schema changes

❌ No silent refactors of pricing logic

Any future phase must layer on, not rewrite.

9. What Is Explicitly Not Built (Yet)

This is not technical debt, it is intentional sequencing:

Availability engine

Booking confirmation

Payment processing

Discounts

Deposits

AI / analytics

Dynamic pricing

Partial-hour bookings

These come after pricing trust is proven.

10. Why HUB #8 Was Successful

This hub succeeded because of:

Strong inherited handover

Disciplined scope control

Clear language

Strict Spoke management

Zero tolerance for silent regressions

The goal of this document is to make that repeatable, not accidental.
