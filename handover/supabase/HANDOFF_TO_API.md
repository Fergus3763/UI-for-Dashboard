# Handoff to API Spoke — Supabase (v0.3-db-ready)

## Status
- Schema: aligned (vat, catalog, rooms, durations, room_catalog_map, blackout_periods)
- Imports: VAT ✅, Catalog ✅, Rooms ✅, Durations ✅, RoomCatalogMap ✅
- Validation: Row counts + Summary dashboard = PASS (all integrity counts = 0)
- Files: 001_schema.sql, 002_seed_instructions.md, VALIDATION.md, validation.sql, .env.sample

## Connection (server-side only)
- SUPABASE_URL = (set in Netlify)
- SUPABASE_SERVICE_ROLE_KEY = (set in Netlify)

## Tables & fields (API-relevant)
- blackout_periods(id, room_id, starts_at, ends_at, title, created_at)
- rooms(id, code, name, …)
- (pricing data present but NOT required for blackout/availability wiring)

## Required endpoints (unchanged contract)
- GET /availability?roomId=&from=&to=
  - Overlap check against blackout_periods
- POST /blackout_periods
  - Fixed blackout: { roomId, startsAt, endsAt, title? }
  - Temp hold: { roomId, tempAmount, tempUnit, title? }
- DELETE /blackout_periods/:id?roomId=
- (Optional) GET /blackout_periods?roomId=

## Acceptance (curl)
1) POST blackout → 200 JSON (record)
2) GET availability (overlap) → available:false + blackoutReason
3) DELETE blackout → 200 { ok: true }
4) GET list (optional) → array including created blackout before deletion

## Notes
- Timestamps: ISO 8601 UTC (`Z`).
- Keep response shapes identical to current contract.
- CommonJS only in Netlify functions (no "type":"module").

