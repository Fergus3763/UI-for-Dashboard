# HUB Status Summary (Living Document)

> ⚠️ **Note:** Any existing or historical references to “WorXinn” should be disregarded. All context, ownership, and intent refer solely to the **OWNER**. No material or background research is to be drawn from the OWNER’s prior GPT chats or any online sources.

> This file is the living “spine” of the project handover.  
> Each HUB updates this one document at handover.  
> Legend: 🟢 Done • 🟡 In progress / Partial • ⚪ Not started / Deferred
## HUB#3 Interim Update
Environment Consistency verified on Netlify.
Live bundle verification pending (availability + blackout_periods endpoints).
Ready for Hub#4 to complete deployment inspection and mark Phase 2 closed.

---

## 🧭 1) Core Goal Alignment
- 🟢 **Architecture & Workflow Defined** — Hub + Spoke model; HUB is source of truth; Spokes do focused builds.  
  _Ref:_ `handover/HUB_PROMPT.md`
- 🟢 **Data Sources Centralised** — Base CSVs (Rooms, RoomCatalogMap, VAT, Durations, Assumptions) versioned.  
  _Ref:_ `/data/`
- 🟢 **Terminology Alignment** — Glossary validated for consistent naming.  
  _Ref:_ `/glossary/Meeting_Rooms_Glossary_and_Dictionary.xlsx`
- 🟡 **Integration Strategy** — Documented Option 2 (API→DB) then Option 1 (Admin→API).  
  _Ref:_ `handover/INTEGRATION_PLAN.md`

---

## 🏗️ 2) Admin UI & Dashboard (Front-End)
- 🟢 **Base Admin UI (static)** — Room/Date/Time selector, Check, Add/Delete Blackouts (local).  
  _Live:_ GitHub Pages (`/docs` or UI root)  
- 🟢 **Static Deployment (verified)** — Public, embeddable (iframe).  
- 🟡 **Admin → API Wiring** — Not live yet (Admin updates local state only).  
  _Next:_ Option 1 in `handover/INTEGRATION_PLAN.md`
- ⚪ **Room Management Panels (capacity, layouts, F&B, AV)** — Not implemented; data placeholders exist.  
  _Refs:_ `/data/RoomCatalogMap.csv`, `/data/Catalog.csv`
- ⚪ **Analytics/Reports** — Not started.

### Admin UI routing
- Netlify “Open production deploy” opens the site root `/`.
- The app redirects `/` → `/admin/venue` by design (default landing).
- Use the top navigation to reach other tabs (Rooms, F&B, AV, Labour, 3rd-Party).
- Deep links (e.g. /admin/labour) also work directly because `_redirects` routes all paths to `/index.html`.

---

## 🧮 3) Data Model (Backend Schema)
- 🟢 **RoomCalendar / RoomEvent** — JSON schemas incl. buffers, rounding, OOH, overlap.  
- 🟢 **Availability Engine (Luxon)** — `checkOverlap`, `addEvent`, `detectOOH`, `applyBuffers`, etc.  
  _Ref:_ Calendar/Availability Spoke source & functions
- 🟢 **syncCalendarsWithRooms() adapter** — Ensures each room has a calendar stub (no orphans).  
- 🟡 **Persistent Storage** — In-memory; to be replaced by Supabase (Option 2).  
- ⚪ **Layouts, F&B, AV schema/UI** — Not wired yet; CSV scaffolding only.

---

## 🌐 4) Availability API (Serverless on Netlify)
- 🟢 **GET `/availability`** — Returns availability, billableHours, OOH, EU/UTC times.  
- 🟢 **POST `/blackout_periods`** — Create fixed/temporary blackout.  
- 🟢 **DELETE `/blackout_periods/:id`** — Remove blackout by id.  
  _Base:_ `https://<your-netlify-site>.netlify.app`  
  _Functions path always works:_ `/.netlify/functions/...`
- 🟡 **Error handling & logs** — Luxon/ESM/CJS issues resolved; keep testing.  
- 🟡 **Persistence via DB** — Not integrated (Supabase planned).

---

## 📦 5) Documentation & Handover
- 🟢 `handover/HUB_PROMPT.md` — Core HUB guidance + Observations section.  
- 🟢 `handover/API_CONTRACT.md` — GET/POST/DELETE contracts with examples.  
- 🟢 `handover/INTEGRATION_PLAN.md` — **Do Option 2 (API→DB) first, then Option 1 (Admin→API)**.  
- 🟢 `handover/DATA_BOUNDARY.md` — Calendar vs Availability vs DB responsibilities.  
- 🟢 `handover/RELEASE_NOTES.md` — Latest release (v0.2 handover).  
- 🟢 `handover/CHECKLIST.md` — Handover verification list.  
- 🟢 `/docs/links.md` — Consolidated URLs.  
- 🟢 `/glossary/Meeting_Rooms_Glossary_and_Dictionary.xlsx` — Real binary file (downloadable).

---

## 🚧 6) Outstanding / Deferred Work
- 🟡 **API → DB (Supabase)** — Replace in-memory blackouts; keep API shapes unchanged.  
- 🟡 **Admin → API Wiring** — Make Admin read/write live events via API.  
- ⚪ **Room Config (capacity, layouts, F&B, AV)** — New Admin sections + data binding.  
- ⚪ **Multi-venue / Tenant** — Future spoke (add `tenant_id`).  
- ⚪ **Analytics Dashboard** — After persistence.  
- ⚪ **Auth / Roles** — Optional; Netlify password OK for now.

---

## 🧾 7) Where each major work item lives
- `handover/` — Source of truth: prompts, contracts, plans, notes, releases, checklist.  
- `data/` — CSV datasets + assumptions report.  
- `glossary/` — Naming & field dictionary (Excel).  
- `netlify/functions/` — Live serverless API (availability & blackouts).  
- `public/` or `docs/` — Frontend Admin UI.  

---

## 🧩 8) Suggested restart sequence for HUB#3
1) Confirm handover docs + run CHECKLIST.  
2) Test API (GET/POST/DELETE).  
3) Implement **Option 2: API → Supabase** (persistence, same API shapes).  
4) Implement **Option 1: Admin → API** (wire buttons + initial fetch).  
5) Start **Room Config** (capacity/layouts/F&B/AV) using CSVs.  
6) ⛔ Return to HUB for integration and test.

---

## Context & Learnings — HUB#2 → HUB#3 (to be filled by HUB#2)
- Add 3–5 bullets with deployment gotchas, data nuances, or UX notes discovered this cycle.
- Example placeholders:
  - Netlify cache needed “Deploy without cache” after function changes.
  - UTC inputs + EU display (Europe/Dublin) confirmed correct during DST.
  - Admin currently updates local state — persistence comes from API/DB only.

---

## Integration Roadmap (Forward Intent)
The final HUB#4 will consolidate all Spokes (UI, API, Data, Calendar, Analytics) into a single functioning entity. Each HUB contributes tested components and updates this file so integration proceeds seamlessly.
> Integration Roadmap: Continues under Hub#3 stewardship — align new work via PR only.

### Status Summary (since HUB#2 → HUB#3)

| Area | Status | Note |
|------|---------|------|
| Environment | 🟢 | Env vars aligned and builds verified |
| API Functions | 🟢 | blackout_periods and availability confirmed operational |
| Docs | 🟡 | Minor normalisation still in progress (relative links and footer notes) |
| Integration Plan | ⚪ | Pending Hub#3 adoption meeting |

### Context & Learnings — HUB#2 → HUB#3
- All core handover docs validated; only minor formatting inconsistencies found.
- Environment file alignment confirmed successful (Netlify + Supabase).
- API schema updates (blackout_periods.title) stable across deployments.
- Early governance clauses (“no local patches”) now enforced in README.
- Recommended adding visual 🔴 tags for critical checklist items pre-handover.

---

## HUB#3 — Current Status

### Status Summary (since HUB#2 → HUB#3)

| Area | Status | Note |
|------|---------|------|
| Environment | 🟢 | Env vars aligned and Netlify build verified |
| API Functions | 🟢 | `blackout_periods` + `availability` functions operational post-deploy |
| Documentation | 🟡 | Minor markdown normalisation in progress (`./` relative links and footer notes) |
| Integration Plan | ⚪ | Pending formal adoption by Hub#3 post-stabilisation |
| Governance | 🟢 | “No local patches” rule formalised and included across handover docs |

---

### Context & Learnings — HUB#2 → HUB#3
- Handover documentation now standardised; all authoritative files validated.
- Environment parity achieved across Supabase, Netlify, and API layers.
- Schema update (`blackout_periods.title`) deployed and verified live.
- Added visual 🔴 flags in checklist for must-complete stabilisation tasks.
- Governance and version control policies reinforced via README footer.

---
## Status — end of HUB#3

- 🟢 Admin UI tabs live: Venue, Rooms, F&B, AV, Labour, Add-Ons
- 🟢 Separate Netlify site for admin-ui with Node 18 (base=admin-ui, publish=public)
- 🟡 API unchanged this phase; formal spec uplift planned for HUB#4
- ⚪ Persistence for Admin UI (Supabase) planned next

**Handover to HUB#4:** proceed with data model + persistence, API spec hardening, and E2E smoke.
## Status — HUB#4 (in progress)

### Admin UI – Venue persistence wiring

- Route `/admin/venue` now renders `admin-ui/src/pages/Venue.jsx`.
- `Venue.jsx` is a **thin wrapper** that only returns `<VenueSetup />` from  
  `admin-ui/src/pages/Dashboard/VenueSetup/index.jsx`.
- `VenueSetup` is the *single source of truth* for the Venue form:
  - On mount it calls `/.netlify/functions/load_config` (GET).
    - If `response.data.venue` exists, it hydrates the form from that JSON.
  - On Save it calls `/.netlify/functions/save_config` (POST) with:
    - Body shape: `{"data": { "venue": { /* form fields */ } }}`.
- Persistence target:
  - Supabase table `public.admin_ui_config` (currently a single row with `id = 'default'`).
  - Column `data` is a JSONB blob that will later also hold `rooms`, `fnb`, `av`, `labour`, `addons`, etc.
- Pattern for future HUBs:
  - Reuse this approach for other Admin tabs by extending the same `data` object rather than adding new tables for every UI tweak.
  - If you change Venue behaviour, do it in `Dashboard/VenueSetup/index.jsx` (not in `pages/Venue.jsx`).

> **Integration Roadmap:** Continues under Hub#3 stewardship — all new work must align via PR and follow the no-local-patch policy.
>  


- [ ] Append 2–4 lines to `handover/HUB_CONTEXT.md` under “🔁 Context Relay — for the Next HUB”.


---
---

## 🚀 HUB #5 Start-Up Checklist

> Purpose: give HUB #5 a 1-page launch reference so no context is lost.

### 🧭 Before you begin
- [ ] Read **handover/HUB_CONTEXT.md** once to understand overall purpose, architecture, and governance.
- [ ] Start the new chat with the **Operational Handover Prompt (Prompt A)**.
- [ ] Paste the contents of **handover/HUB_CONTEXT.md (Prompt B)** immediately afterwards.

### 🧹 Phase 1 – Cleanup & Sync
- [ ] Verify that `/handover` files are canonical (STATUS, SPEC, ROADMAP, HUB_PROMPT, CONTEXT).
- [ ] Ensure `/admin-ui` files for ROADMAP & HUB_PROMPT_TEMPLATE are **pointers only**.
- [ ] Timestamp all edits in this file when complete.
- [ ] Commit message format:  
  `docs: mark handover canonical and add HUB#5 cleanup complete`

### 🧪 Phase 2 – Persistence Check
- [ ] Visit `/admin/venue` → change, save, refresh.
- [ ] Confirm “Saved to Supabase.” appears and data reloads.
- [ ] Confirm `public.admin_ui_config` still contains JSON data.

### 🧩 Phase 3 – Prepare for Booker MVP
- [ ] Review **handover/SPEC_MASTER_MVP.md** & **handover/ROADMAP_MVP.md**.
- [ ] Outline search → availability → results → reserve stub flow.
- [ ] Identify which Admin config values (e.g. rooms, pricing) feed Booker.

### 💬 Phase 4 – Governance & Relay
- [ ] Update this checklist with a ✅ marker when done.
- [ ] Add 2–4 lines under **“🔁 Context Relay — for the Next HUB”** in `handover/HUB_CONTEXT.md`.
- [ ] Ensure “HUB #5 – Cleanup Complete” section appears in this file with timestamp.

---
---

## HUB #5 — Cleanup Complete  
**Date:** 2025-11-11  
**Owner:** Fergus3763  

### Summary  
- Verified pointer structure between `/admin-ui` and `/handover`.  
- Confirmed `/handover` remains the **canonical documentation spine**.  
- Checked and validated all six target files:  
  1. `admin-ui/ROADMAP_MVP.md` → correct pointer ✅  
  2. `admin-ui/HUB_PROMPT_TEMPLATE.md` → correct pointer ✅  
  3. `handover/ROADMAP_MVP.md` → marked canonical ✅  
  4. `handover/SPEC_MASTER_MVP.md` → marked canonical ✅  
  5. `handover/HUB_PROMPT.md` → marked canonical ✅  
  6. `handover/STATUS_SUMMARY.md` → updated with HUB #5 summary ✅  
- No redundant or duplicated files found under `/admin-ui/`.  
- Canonical markers are now consistent and timestamped.  

**Next step:** Begin Booker MVP planning (search → availability → results → reserve stub).
---

## HUB #5 — VenueSetup Tabbed Layout
**Date:** 2025-11-12  
- Converted VenueSetup to tabs (Venue + Booking Policy).  
- Booking Policy UI scaffold added; persistence to Supabase will follow as a separate task.  
- No change to existing save/load behaviour for `venue`.

_This section is appended at the end of `handover/STATUS_SUMMARY.md` for each HUB.  
Never delete older checklists—just add the new one below them._

## HUB #5 — Final Status (Failed / Incomplete)
- Booking Policy persistence not fully connected to UI.
- Backend save_config works when called manually.
- UI save button does not POST correctly.
- Config hydration incomplete.
- HUB #5 terminated early due to instability.
- HUB #6 will resume with new prompts defined in:
  - HUB6_MASTER_PROMPT_1.md
  - HUB6_MASTER_PROMPT_2.md
---
## HUB #6 — Status Summary (Complete)

### Key Achievements
- Migrated Add-Ons out of VenueSetup into Rooms → Add-Ons (canonical structure).
- Introduced Room Setup tab placeholder and defined its MVP spec (`RoomSetup_SPEC_MVP.md`).
- Removed obsolete top-level tabs (F&B, AV, Labour) and added Room Overview + Addon DB.
- Stabilised save/load pipeline for Add-Ons (Rooms/index.jsx is now source of truth).
- Created `HUB7_REQUIRED_FILES.md` and `AVAILABILITY_SPOKE_ARCHIVE.md`.

### Important Notes for Hub #7
- Availability Spoke is archived — follow API_CONTRACT + integration plan only.
- Room Setup needs implementation using the Supabase-backed config model.
- Ensure new work continues to follow: UI → save_config → Supabase → load_config → UI.
- Do not change backend endpoints without updating `/handover` first.

**Next HUB:** Implement Room Setup (MVP), validate Add-Ons interactions, and prepare for Availability reintegration work.
## HUB #6 — Final Status

### Summary
- Venue Setup + Booking Policy scaffolding completed.
- Room Setup spec written; implementation pending for HUB #7.
- Navigation Spoke (Room Overview + Addon DB) drafted, pending build under HUB #7.
- Identified drift in handover files; canonical prompt corrected and normalised.
- Introduced `HUB7_REQUIRED_FILES.md` requirement for all future HUBs.

### Pending for HUB #7
- Rebuild availability + blackout logic cleanly (ignore old Availability Spoke).
- Implement Room Setup MVP end-to-end with Supabase persistence.
- Build Room Overview + Addon DB placeholder screens.
- Validate load/save chain across all tabs.


