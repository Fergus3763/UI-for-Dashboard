# Handover Pack
# Handover Pack — UI MVP (v0.2)
# Handover Index

This folder contains the operational documents used by HUBs and Spokes.
Use this file as the entry point.

## Primary
- **Master Handover:** [HUB2_to_HUB3_Master_Handover.md](./HUB2_to_HUB3_Master_Handover.md)
- **HUB Prompt (authoritative brief for each Hub):** [HUB_PROMPT.md](./HUB_PROMPT.md)

## Contracts & Plans
- **API Contract:** [API_CONTRACT.md](./API_CONTRACT.md)
- **Integration Plan:** [INTEGRATION_PLAN.md](./INTEGRATION_PLAN.md)
- **Data Boundary:** [DATA_BOUNDARY.md](./DATA_BOUNDARY.md)

## Back-end Integration Notes
- **Supabase / API Handoff Notes:** [supabase/HANDOFF_TO_API.md](./supabase/HANDOFF_TO_API.md)

## Process Rules (Global)
- No local patches or temporary workarounds: all changes must be PR-reviewed, documented, and aligned with the API Contract and Data Boundary. See **HUB_PROMPT** for enforcement details.

**Release Tag:** [v0.2-handoff](https://github.com/Fergus3763/UI-for-Dashboard/releases/tag/v0.2-handoff)  
**Status:** ✅ Stable | **Date:** October 2025  

This folder contains the canonical handover documentation for the **UI MVP** milestone of the project.

---

## 📂 Contents

| File | Description |
|------|--------------|
| **API_CONTRACT.md** | Availability & blackout endpoints (Netlify serverless). |
| **DATA_BOUNDARY.md** | Ownership & boundaries (UI vs Calendar vs DB Spokes). |
| **HUB_PROMPT.md** | Living prompt for HUB#2 continuity. |
| **INTEGRATION_PLAN.md** | Next actions (API ↔ DB ↔ Admin ↔ API wiring). |
| **Assumptions_and_Ambiguities_Report.txt** | Latest validation and assumptions. |
| **RELEASE_NOTES.md** | Detailed release summary and next steps. |
| **README.md** | This index file. |

---

## 🧭 Related Files Elsewhere

- `/glossary/Meeting_Rooms_Glossary_and_Dictionary.xlsx` — Master data reference.
- `/docs/links.md` — Quick links to GitHub Pages UI, Netlify Admin, API examples.
- Root `/README.md` — Project overview and live site link.

---

## 🧾 Version History
- **v0.2-handoff** — UI MVP baseline handover created.
- **v0.3+** *(planned)* — Automation of build/deploy; environment variable documentation.

---

**Maintainer:** Fergus3763  
**Purpose:** Serves as the definitive continuity pack for the UI MVP phase.

This folder contains the canonical handover documents for the UI MVP.

- [API_CONTRACT.md](API_CONTRACT.md)
- [DATA_BOUNDARY.md](DATA_BOUNDARY.md)
- [HUB_PROMPT.md](HUB_PROMPT.md)
- [INTEGRATION_PLAN.md](INTEGRATION_PLAN.md)
- [Assumptions_and_Ambiguities_Report.txt](Assumptions_and_Ambiguities_Report.txt)
- [RELEASE_NOTES.md](RELEASE_NOTES.md)

---

### 🔄 HUB Continuity Summary
**Current HUB:** #3  
**Last Update:** HUB#2 → HUB#3 Transition  
**Status:** 🟢 Stable — environment and API verified, docs synchronised.  
**Notes:** Governance and “no local patches” policy active; Integration Roadmap unchanged.  
**Maintainer:** Fergus3763 (Project Owner)

---
