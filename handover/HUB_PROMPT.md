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
---

## 💡 Observations & Context for Successor

### 1. Project Intent and Direction
- The long-term goal is to evolve a **modular workspace booking ecosystem**, beginning with the **Meeting Room MVP**.
- Architecture is being deliberately structured to expand toward **multi-venue, multi-tenant** environments (hotels, coworking, serviced offices).
- This Availability Spoke is one of several functional spokes planned to plug into a shared API “hub.”
- Future spokes are expected to include: **Billing, Calendar Sync, Analytics, and CRM integration**.
- Design priorities emphasize a **lightweight, modular, serverless** structure that scales smoothly from prototype to SaaS.

---

### 2. Style and Ownership
- **Project Owner:** Fergus — not a full-time developer but technically literate and systems-minded.  
- Fergus manages multiple dimensions (development, design, marketing, and hotel operations) and values transparency and structured progress.
- Documentation is essential — all updates should be mirrored in `/handover/` with meaningful commit messages.
- Expect occasional open-ended or exploratory phases — Fergus prefers **proactive proposals** based on best practices rather than waiting for directives.

---

### 3. Core Principles Learned During Build
- **Clarity first:** Write human-readable, maintainable code. Avoid clever but opaque logic.  
- **Strict separation of concerns:** Each Spoke should remain independent. Interaction happens only via API endpoints.  
- **Full transparency:** Every significant change or fix must be logged in `/handover/RELEASE_NOTES.md`.  
- **Deploy parity:** All code must deploy cleanly on Netlify — no local-only dependencies or assumptions.

---

### 4. Practical Lessons
**Netlify**
- Keep `package.json` using CommonJS (`require`) syntax — do *not* set `"type": "module"`.
- Place all serverless functions under `/netlify/functions`.
- Redirects in `netlify.toml` help readability but are optional; direct calls to  
  `/.netlify/functions/...` always work.

**Date Handling**
- Always use **UTC** timestamps (`Z` suffix) for all API calls.  
- The project uses **Luxon** for timezone handling (Moment.js deprecated).

**Testing**
- Use **Hoppscotch** or **Postman** to test the three main endpoints:  
  - `GET /availability`  
  - `POST /blackout_periods`  
  - `DELETE /blackout_periods/:id`  
- Validate each deploy by confirming GET + POST + DELETE all return correct JSON.

---

### 5. Next Logical Evolution
1. Replace in-memory storage with **Supabase tables** for persistence.  
2. Connect **Admin UI → API** for live blackout management.  
3. Add **auth layer** (Netlify Identity or Supabase Auth).  
4. Introduce `tenant_id` for multi-room, multi-venue operation.  
5. Add **Analytics Spoke** (usage, revenue, occupancy).

---

### 6. Tone and Collaboration
- Keep communication **succinct, structured, timestamped** — aligns with current project rhythm.  
- Emphasize **complete deliverables** (fully working feature before moving on).  
- Leave every module **clearer than you found it** — continuity and clarity are key.

---

### 7. Summary for New Hub or Spoke Leads
This handover is structured so a **new ChatGPT Hub (Hub#2)** or future collaborator can  
reboot the project seamlessly by reading `/handover/`, `/docs/`, and `/glossary/`.  
All key project logic, API behavior, and decisions are captured there.  
The live environment is currently hosted on **Netlify**:  
`https://zingy-biscuit-94791a.netlify.app/`

---

