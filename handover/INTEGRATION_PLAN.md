# Integration Plan — v0.3 → v0.4 (Canonical for HUB#7)

This file defines the required integration sequence for Admin UI, API, and Supabase.

---

# Phase 1 — Persistence (Admin UI ↔ save_config)
Goal: Move all configuration into Supabase through `admin_ui_config.data`.

Required keys in `.data`:
- `venue`
- `bookingPolicy`
- `rooms`
- `addOns`

Admin UI duties:
1. Load → `/.netlify/functions/load_config`
2. Save → `/.netlify/functions/save_config`
3. Always POST **full objects**:
   ```json
   { "rooms": [ ... ] }
   ```

No Supabase direct writes from the UI.

---

# Phase 2 — Availability Layer (HUB #7)
Goal: Rebuild availability engine cleanly.

Requirements:
- Use Supabase `blackout_periods` as the persistent event list.
- Prepare for future `bookings` table.
- Export logic as a modular library.
- Finalise full spec in `API_CONTRACT.md`.

---

# Phase 3 — Booker MVP (Reader Only)
Goal: Booker can read availability + room config.

Steps:
1. Load rooms from Admin UI config.
2. Display rooms + date/time search.
3. Call `/availability`.
4. Render result state (available / not available).

No pricing, payments, or booking flows yet.

---

# Phase 4 — Release v0.4
- Update `RELEASE_NOTES.md`.
- Update `STATUS_SUMMARY.md`.
- Add Supabase seed snapshot.
- Smoke test:
  - GET /availability
  - POST /blackout_periods
  - Confirm round-trip works.

---

# Versioning
- v0.3 — Availability + blackout API live  
- v0.4 — Persistent config + Room Setup + Rebuilt availability engine  
