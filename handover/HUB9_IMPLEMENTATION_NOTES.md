# HUB#9 – Implementation Notes
## Capacity-Based Booking Segmentation (Foundational Rule)

### Purpose of This Document
This document defines **exact rules and guardrails** for implementation.

HUB#9 should not guess file paths, behaviour, or intent.
If something is unclear, request the file.

---

## Foundational Rule (Must Not Be Violated)

> Booking behaviour is determined by **room layout capacity**, not meeting type labels.

There is **one system**, not two.

---

## Capacity Threshold (Hotel-Defined)

Each hotel will define a numeric threshold (e.g. 20).

For each room layout:
- If `maxCapacity ≤ threshold` → ONLINE BOOKABLE
- If `maxCapacity > threshold` → RFQ / PRE-CONTRACT

This threshold must be:
- Configurable by the hotel
- Applied per layout, not just per room

---

## Behaviour by Booking Mode

### ONLINE BOOKABLE Layouts
- Instant pricing
- Instant booking (future)
- Existing behaviour retained

**Add-On Exposure**
- Included add-ons
- Hotel-curated optional add-ons only

**Explicitly NOT allowed**
- Full add-on catalogue exposure
- Overwhelming configuration UI

This protects speed and usability.

---

### RFQ / PRE-CONTRACT Layouts
- No instant booking
- Pricing still fully calculated
- Human closing required

**Add-On Exposure**
- Included add-ons
- **Full optional add-on catalogue**

Booker can:
- Select any add-on
- Quantify services
- See structured pricing output

Result is a **priced RFQ**, not a booking.

---

## Data Model (Important Clarification)

No new add-on data is required.

- Add-Ons already exist globally
- Rooms already define:
  - Included add-ons
  - Optional add-ons (curated subset)

For RFQ mode:
- Ignore room-level optional restriction
- Expose full catalogue read-only

---

## UI Guidance (High Level)

### ONLINE
- Simple
- Curated
- Few choices
- Fast

### RFQ
- Structured
- Dense
- Transparent
- Confident

The UI can become more complex *only* after crossing the threshold.

---

## What HUB#9 Should NOT Do

- Do NOT duplicate pricing logic
- Do NOT create separate “large meeting” flows
- Do NOT remove human approval from large bookings
- Do NOT guess file names or paths

If unsure:
→ Request the file.

---

## Success Criteria for HUB#9

- Small meetings remain frictionless
- Large meetings become self-priced
- Hotels trust the numbers
- Humans focus on closing, not calculating

This document + Strategy Overview define the full intent.
