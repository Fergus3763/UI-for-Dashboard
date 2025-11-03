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
```md
## Status Snapshot (post-HUB#2)
- [x] Netlify functions live: `blackout_periods`, `availability`
- [x] Env vars aligned (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NODE_VERSION=18`)
- [x] Schema updated: `blackout_periods.title`
- [ ] Formalise `availability` API spec in `API_CONTRACT.md`
- [ ] Add E2E smoke script (CI) to hit both endpoints and validate basic responses
- [ ] Document Room ID/Name mapping rules (Design doc → upcoming Spoke)
Deliverable: persistent availability + admin changes reflected after refresh.

