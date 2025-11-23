# FOLDER_STRUCTURE.md  
## Repository Structure (as of HUB #6 → HUB #7)

This document provides a high-level map of all folders relevant to HUB continuity.

---

## 1. Root-Level Folders

### `/admin-ui/`
- React Admin Dashboard  
- Netlify functions  
- All UI code for Venue, Rooms, Add-Ons  
- Critical files:
  - `src/pages/Dashboard/VenueSetup/Tabs/*`
  - `src/pages/Dashboard/Rooms/index.jsx`
  - `netlify/functions/load_config.mjs`
  - `netlify/functions/save_config.mjs`

### `/handover/`
**Canonical documentation spine** — the source of truth for Hub governance  
Contains:
- HUB_PROMPT_CANONICAL.md
- HUB_CONTEXT.md
- STATUS_SUMMARY.md
- FOLDER_STRUCTURE.md
- API_CONTRACT.md  
- DATA_BOUNDARY.md  
- INTEGRATION_PLAN.md  
- RoomSetup_SPEC_MVP.md  
- Nav_RoomOverview_AddonDB_SPOKE.md  
- NEXT_ACTIONS_HUB7.md  
- HUB7_REQUIRED_FILES.md  

### `/handover/supabase/`
Supabase schema, validation, and environment templates:
- `001_schema.sql`
- `ENV_SAMPLE.md`
- `VALIDATION.md`
- `seed_instructions.md` *(historical reference)*

### `/data/`
CSV data for rooms, catalog, VAT, durations:
- Rooms.csv
- Catalog.csv
- VAT.csv
- Durations.csv
- RoomCatalogMap.csv

### `/glossary/`
- `Meeting_Rooms_Glossary.xlsx` — terminology dictionary

### `/docs/`
- Links, public UI output, GitHub Pages hosting artifacts

---

## 2. High-Level Structure Summary

```
repo-root/
├── admin-ui/
│   ├── netlify/functions/
│   └── src/pages/Dashboard/
├── handover/
│   ├── supabase/
│   └── *.md (canonical docs)
├── data/
├── glossary/
├── docs/
└── README.md
```

---

## 3. Notes
- `/admin-ui` and `/handover` are the two mission-critical areas.  
- HUBs must not create new root folders without updating this file.  
- Any deprecated folders should be marked explicitly.
