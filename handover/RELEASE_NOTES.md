# Release Notes — v0.2-handoff
Date: 2025-10-14

## Highlights
- ✅ **Handover folder added** with the canonical docs:
  - `API_CONTRACT.md` — Availability & Blackout endpoints (Netlify serverless).
  - `DATA_BOUNDARY.md` — Ownership & boundaries (UI vs Calendar vs DB Spokes).
  - `HUB_PROMPT.md` — Living prompt for HUB#2 continuity.
  - `INTEGRATION_PLAN.md` — Next actions (API→DB, Admin→API wiring).
  - `Assumptions_and_Ambiguities_Report.txt` — Latest validation/assumptions.
  - `README.md` — How to use the handover folder.
- ✅ **Glossary & Data Dictionary** uploaded:
  - `/glossary/Meeting_Rooms_Glossary_and_Dictionary.xlsx`
- ✅ **Links page** for fast navigation:
  - `/docs/links.md` (live links to GitHub Pages UI, Netlify Admin, API examples)
- ✅ **GitHub Pages** live for the click-through UI:
  - `https://fergus3763.github.io/UI-for-Dashboard/`

## Live URLs
- **UI (GitHub Pages):** https://fergus3763.github.io/UI-for-Dashboard/
- **HUB Repo:** https://github.com/Fergus3763/UI-for-Dashboard
- **Links page:** /docs/links.md  
- **Netlify Admin (Availability Spoke):** _see links page_  
- **API examples:** _see links page_

## Scope in this release
- UI-only MVP (no DB). All data deliverables tracked in `/data` and `/glossary`.
- Availability Spoke deployed (Netlify) with endpoints:
  - `GET /availability?roomId=&from=&to=`
  - `POST /blackout_periods`
  - `DELETE /blackout_periods/:id?roomId=...`

## What’s next (from INTEGRATION_PLAN.md)
1. **API → DB (Supabase) persistence**  
2. **Admin UI → API wiring** (create/delete blackout via serverless)  
3. Versioned data drops & CSV validation automation

## Checks
- Glossary opens and renders correctly via “View raw”.
- Links verified in `/docs/links.md`.
- GitHub Pages serving `/` correctly.

## Notes
- Times are ISO (UTC) unless stated; rounding/buffers/OOH enforced by API.
- Replace `Room-A` and timestamps in examples with live values.

