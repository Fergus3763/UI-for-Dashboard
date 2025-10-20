# HUB PROMPT — UI-for-Dashboard

This file tells any new “HUB” how to continue the project with full context.

## Core links
- Repo: https://github.com/Fergus3763/UI-for-Dashboard
- Live UI (GitHub Pages): https://fergus3763.github.io/UI-for-Dashboard/
- Links index: /docs/links.md
- Glossary: /glossary/Meeting_Rooms_Glossary_and_Dictionary.xlsx
- Release notes: /handover/RELEASE_NOTES.md (latest v0.2 “UI MVP”)

## What the HUB owns
- API contract & payloads (/handover/API_CONTRACT.md)
- Data/logic boundaries (/handover/DATA_BOUNDARY.md)
- Integration plan & next steps (/handover/INTEGRATION_PLAN.md)
- Release tagging + notes (/handover/RELEASE_NOTES.md)

## Status snapshot (v0.2)
- UI MVP live on GitHub Pages.
- Netlify serverless endpoints for Availability/Blackouts (stateless).
- Admin UI not yet wired to API (uses in-page state).
- DB not attached yet (Supabase planned).

## Next steps (recommended order)
1. **API → Supabase**: persist blackout/availability data.
2. **Admin → API**: replace local mutations with API calls.
3. Add `ENV_SAMPLE.md` documenting required env vars.
4. Update release notes; tag v0.3 (“DB-linked Availability”).

## Principles
- UI never writes DB directly; only API does.
- Keep markdown concise; prefer tables and examples.
- Every new HUB must read /docs/links.md then these handover docs.

_Last updated: 2025-10-20_

