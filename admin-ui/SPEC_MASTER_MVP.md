# SPEC MASTER — MVP

## VISION
### Market Context & Ambition
Small meeting bookings (2–20 people, short notice) are high-frequency but low-margin and currently **labour-heavy**. The platform enables hotels/venues to **profitably automate** these by moving the flow fully online: search → customise → price → pay → confirm.

### Positioning
Not a generic “booking widget.” It’s a **redefinition of small meeting-room sales** that can coexist with or replace larger event systems.

### Price Integrity Principle
Adoption depends on **trust in automated pricing**. Therefore:
- Admin must capture all pricing determinants (room, duration, layout, F&B, AV, labour, add-ons, VAT, third-party).
- Booker must **visibly** reflect that configuration with deterministic totals.
- MVP success = stakeholders can trace a final price back to admin inputs.

### Governance
- **Dual-Track** (Vision vs Execution) maintained in every HUB.
- **Hub-and-Spoke:** Hub owns truth; Spokes execute work; Hub integrates and records.

## EXECUTION
### Admin UI (current)
- Tabs: Venue, Rooms, F&B, AV, Labour, Add-Ons.
- Objective: Persist entire configuration as a single JSON document per venue/tenant.

### Persistence Contract
- **Storage:** Supabase table `admin_ui_config(id text PK, data jsonb, updated_at timestamptz)`
- **APIs:**  
  - `POST /.netlify/functions/save_config` → upsert `{ id?, data }`  
  - `GET  /.netlify/functions/load_config?id?` → returns `{ id, data, updated_at, created? }`
- **Determinism:** round-trip (load → edit → save → reload) must be lossless.

### Booker MVP (next)
- Reads same config; provides:  
  1) **Search** (date/time/people/layout)  
  2) **Availability** (apply blocks/constraints)  
  3) **Results** (rank + alternatives)  
  4) **Reserve stub** (pre-payment confirmation path)  
- **Explicit Link:** Booker totals must be derivable from Admin config (demo of Price Integrity).

### Non-Goals (MVP)
- Full permutations of pricing edge cases.
- Payment capture beyond a stub.
- Complex multi-venue routing.

### Comms & Acceptance
- Steps in 2–4 items, await **“DONE”** gates.
- Acceptance = docs + working demo consistent with the above contracts.
