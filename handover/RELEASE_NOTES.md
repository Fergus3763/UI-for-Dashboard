# Release Notes — Handover v0.2 (UI MVP)

**Release Tag:** [v0.2-handoff](https://github.com/Fergus3763/UI-for-Dashboard/releases/tag/v0.2-handoff)  
**Date:** October 2025  
**Status:** ✅ Stable — Handover Pack Confirmed

---

## Summary
This release formalises the **Handover folder** and its canonical documentation for the **UI MVP**.  
It represents the baseline from which future HUB#2 and multi-tenant extensions can evolve.

---

## 📁 Included Files

- `API_CONTRACT.md` — Availability & blackout endpoints (Netlify serverless).  
- `DATA_BOUNDARY.md` — Ownership & boundaries (UI vs Calendar vs DB Spokes).  
- `HUB_PROMPT.md` — Living prompt for HUB#2 continuity.  
- `INTEGRATION_PLAN.md` — Next actions (API ↔ DB ↔ Admin ↔ API wiring).  
- `Assumptions_and_Ambiguities_Report.txt` — Latest validation & assumptions.  
- `README.md` — How to use this handover folder.  
- `RELEASE_NOTES.md` — This file.

---

## 🧾 Glossary & Data Dictionary
- `/glossary/Meeting_Rooms_Glossary_and_Dictionary.xlsx` — Canonical reference for data field naming and mappings.

---

## 🔗 Links Page
- `/docs/links.md` — Quick navigation to GitHub Pages UI, Netlify Admin, and API examples.

---

## 🌐 GitHub Pages
- Click-through UI live at:  
  [https://fergus3763.github.io/UI-for-Dashboard/](https://fergus3763.github.io/UI-for-Dashboard/)

## v0.4.0 — Admin UI routes live; Venue added (MVP)
- New: Admin UI tabs (Venue, Rooms, F&B, AV, Labour, Add-Ons)
- Infra: separate Netlify site for admin-ui, Node 18
- Updated: `netlify.toml` set base/publish + build command
- Handover: prepared HUB#3 → HUB#4 with clear next actions

---
## Release Notes — Handover v0.3 (Database Integration)
- Added API Acceptance Checklist to `/handover/supabase/HANDOFF_TO_API.md` (blackout + availability).

### Database Integration (Seed & Validate)
- Added `/handover/supabase/HANDOFF_TO_API.md` for API Spoke integration.
- Schema aligned and data seeded via Supabase UI.
- Validation PASS (row counts + summary checks = 0 issues).
- `seed.js` deferred until after API wiring.
- ## v0.3.1 – Docs alignment for HUB#2 handover
- Added /handover/README.md (index)
- Updated HUB_PROMPT with “Zero Local Patches” and backend state
- Added blackout_periods/availability sections to API_CONTRACT
- Integration Plan updated with status snapshot and next steps

## 🧭 Next Steps
1. Version bump to `v0.3` for automation of build/deploy (manual currently 100%).  
2. Add environment variable documentation (Firebase + Google Cloud + Stripe).  
3. Integrate a simplified `/glossary/README.md` to describe each sheet/column.  

---

**Maintainer:** Fergus 3763  
**Purpose:** Acts as the definitive reference for UI handover, ensuring smooth continuation between contributors and future chats.
