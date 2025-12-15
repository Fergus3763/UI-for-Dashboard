# HUB #9 — QUICK START

## Purpose of HUB #9

HUB #9 continues development of the **Automated Meeting Room Booking Platform**, with a primary focus on:

- Booker-facing pricing confidence
- Strict alignment between:
  - Hotel Admin pricing logic
  - Simulation / Modelling
  - Booker Preview
- Preserving architectural integrity while extending functionality

This Hub inherits its **full business, market, and product context** from:

➡️ `UI-for-Dashboard/handover/project-context.md`  
(This document is authoritative and must not be reinterpreted or shortened.)

---

## Core Product Principle (Non-Negotiable)

> **At the moment of BUY → ORDER CONFIRMED, both parties must trust the price.**

Everything built in HUB #9 must reinforce:
- Price accuracy
- Transparency
- Determinism
- Consistency across Admin, Simulator, and Booker Preview

---

## Current System State (Start of HUB #9)

The following elements are **live and working**:

### Admin Dashboard
- Venue Setup (with Booking Policy / Terms)
- Room Setup
- Add-On Catalogue & Assignment
- Room Overview

### Pricing Infrastructure
- Canonical pricing rules defined and implemented
- Hour-block pricing model (per-hour base × duration)
- Inclusive vs Optional add-ons fully respected
- PER_EVENT, PER_PERSON, PER_PERIOD(HOUR) supported

### Validation Tools
- **Simulation / Modelling** (hotel-only reassurance + testing)
- **Booker Preview** (booker-facing pricing mirror)

Both tools:
- Use **GET `/.netlify/functions/load_config` only**
- Perform **no writes**
- Share the **same pricing logic**

---

## What HUB #9 Is Responsible For

### 1. Protect What Already Works
- No regression in pricing behaviour
- No change to existing Netlify functions
- No schema changes unless explicitly approved
- No silent changes to pricing semantics

### 2. Extend Booker-Facing Flow Carefully
- Booker Preview must remain a **mirror**, not a fork
- Any new Booker-side feature must:
  - Use existing pricing rules
  - Be explainable to a hotel admin in plain English

### 3. Maintain One Source of Truth
- Pricing logic must never diverge between:
  - Admin setup
  - Simulator
  - Booker Preview

If logic cannot be shared directly, it must be **textually identical**.

---

## Working Rules (Critical)

### File Discipline
- **No new files** unless:
  - Requested by the Hub, OR
  - Requested by a Spoke and explicitly approved
- Full delete-and-replace files only
- If it’s not in GitHub, it does not exist

### Communication Style
- 2–4 short steps per message
- Explicit **DONE** required before moving on
- No long explanations unless requested

---

## Spoke Management Rules

HUB #9 is expected to:
- Proactively propose Spokes for heavy lifting
- Provide Spokes with:
  - Only the files they need
  - Only the context they need
- Avoid:
  - Copy-pasting large parts of the repo
  - Allowing Spokes to “explore” the codebase
  - Letting Spokes invent new abstractions

Spokes must:
- Work from **tight prompts**
- Return **full files**
- Avoid architectural decisions

---

## Immediate Focus Areas for HUB #9

1. Booker journey completeness (without booking/payment yet)
2. Clear explanation of price components to the booker
3. Ensuring hotels can *demonstrate* price integrity confidently
4. Preparing the ground for:
   - Availability logic
   - Reservation / payment
   - Pricing Lab (future phase)

---

## What HUB #9 Must NOT Do

- Do not redesign Admin UI unless explicitly requested
- Do not add booking, payment, or availability logic yet
- Do not introduce partial persistence or “temporary saves”
- Do not rename pricing terms without agreement

---

## Definition of Success for HUB #9

- A hotel can confidently demo:
  - Admin setup
  - Simulation
  - Booker Preview
- And say:
  > “This is exactly the price the system will charge.”

When that is true, HUB #9 is successful.
