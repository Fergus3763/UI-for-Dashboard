# Integration Plan — to v0.3 “DB-linked Availability”

## Phase 1 — API ↔ Supabase
- Add Supabase client; read keys from env vars.
- Replace in-memory stores with DB CRUD in functions.
- Add unit tests for create/delete blackout, list availability.
- Smoke test via curl/Postman.

## Phase 2 — Admin UI ↔ API
- Replace local “Add Blackout” with POST /blackout_periods.
- Render existing blackouts by fetching on load.
- Show toasts on success/failure; disable buttons while pending.

## Phase 3 — Public UI ↔ API (read)
- Populate availability with GET /availability.
- Cache recent queries (SWR/localStorage).

## Phase 4 — Release
- Update `/handover/RELEASE_NOTES.md`; tag v0.3.
- Add `/handover/ENV_SAMPLE.md` with required env names.

Deliverable: persistent availability + admin changes reflected after refresh.

