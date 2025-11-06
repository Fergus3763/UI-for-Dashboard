# HUB#3 → HUB#4 Master Handover

## Executive Summary
- Admin UI now has working tabs: **Venue, Rooms, F&B, AV, Labour**, plus **Add-Ons & Upsells** MVP.
- Admin UI builds/deploys on a **separate Netlify site** (Node 18) under `/admin-ui` repo folder.
- No local patches or temporary workarounds. All changes merged via PR; environments match.

## What changed in HUB#3
- New Admin UI sections wired with React Router:
  - `/admin/venue`, `/admin/rooms`, `/admin/fnb`, `/admin/av`, `/admin/labour`, `/admin/addons`
- Netlify build changes:
  - `netlify.toml` uses `base = "admin-ui"` and `publish = "public"`
  - build command: `npm install && npm run build`
  - `NODE_VERSION = "18"` set in `[build.environment]` and Netlify env var
- Created a **separate Netlify site** specifically for Admin UI to avoid conflicts with functions.
- Venue tab implemented (MVP): contact, address, images, notes (console stub save).

## How to run / deploy
- **Local**: `cd admin-ui && npm install && npm start`
- **Build**: `npm run build` → outputs to `admin-ui/public`
- **Netlify (Admin UI site)**:
  - Base directory: `admin-ui`
  - Publish directory: `public`
  - Build command: `npm install && npm run build`
  - Env var: `NODE_VERSION=18`
- **Functions site (unchanged)** continues to serve serverless functions.

## Status Snapshot (post-HUB#3)
- ✅ Admin UI routes live (Venue, Rooms, F&B, AV, Labour, Add-Ons)
- ✅ Netlify admin-ui site using Node 18
- ✅ `netlify.toml` updated at repo root
- 🟡 API contract unchanged for this phase (only UI scaffolding)
- 🟡 E2E smoke (UI + functions) to be added in HUB#4
- 🟢 Governance: no local patches/out-of-band changes allowed

## Next Actions (HUB#4)
- Add persistence for Admin UI pages (Supabase tables + basic CRUD service).
- Wire **Add-Ons & Upsells** UI to schema (guardrails, stages, cost centre references).
- Formalise **Availability/Blackouts** API spec in `handover/API_CONTRACT.md`.
- Add smoke tests: call both admin-ui routes and functions endpoints in CI.

## Links
- Docs: `handover/README.md`
- Handover notes: `handover/STATUS_SUMMARY.md`
- Contracts: `handover/API_CONTRACT.md`
- Data boundary: `handover/DATA_BOUNDARY.md`
- Integration plan: `handover/INTEGRATION_PLAN.md`

> Governance rule: **No local patches**. Any fix/change must be implemented at system level and reflected across connected Hubs/Spokes.
