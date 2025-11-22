Integration Plan — Toward v0.3 “DB-Linked Availability”

Canonical version — updated by HUB #6

This plan defines the sequence for integrating Admin UI → API → Supabase → Booker.

Phase 1 — API → Supabase (Persistence Layer)
Required

Attach blackout_periods to Supabase

Maintain availability calculation in code (Luxon)

Replace any in-memory structures with DB reads/writes

Keep API response shapes unchanged

Deliverables

All API calls round-trip from database

Validation: GET + POST + DELETE blackouts all work via Supabase

/handover/API_CONTRACT.md updated accordingly

Phase 2 — Admin UI → API
Required

Rooms → Add-Ons: reads/writes via save_config / load_config

Venue / BookingPolicy: same pattern

Room Setup Spoke: rooms saved through POST save_config

Deliverables

After refresh, UI shows persisted state

Save button triggers POST → DB → GET → UI hydration

Phase 3 — Booker (Read-only)
Required

Booker fetches availability

Booker fetches rooms

Booker uses all policy and venue config

Phase 4 — Release v0.3
Required

Update RELEASE_NOTES.md

Snapshot DB structure

Move Availability spec from “draft” to “formal”

Integration Plan v1.1 — Updated by HUB #6
