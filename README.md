# Meeting Room MVP — HUB
## Project Links

- 👉 [Links](docs/links.md) 

- [Glossary & Data Dictionary](glossary/Meeting_Rooms_Glossary_and_Dictionary.xlsx)
- ### Glossary & Data Dictionary

[📄 Open in GitHub](https://github.com/Fergus3763/UI-for-Dashboard/blob/main/glossary/Meeting_Rooms_Glossary_and_Dictionary.xlsx)  
[⬇️ Direct download (.xlsx)](https://raw.githubusercontent.com/Fergus3763/UI-for-Dashboard/main/glossary/Meeting_Rooms_Glossary_and_Dictionary.xlsx)

[![Download Data Dictionary](https://img.shields.io/badge/Data%20Dictionary-.xlsx-blue)](https://raw.githubusercontent.com/Fergus3763/UI-for-Dashboard/main/glossary/Meeting_Rooms_Glossary_and_Dictionary.xlsx)

> File: `glossary/Meeting_Rooms_Glossary_and_Dictionary.xlsx` (expected ~13 KB)

🔖 **Latest Handover:** [v0.2 (UI MVP)](https://github.com/Fergus3763/UI-for-Dashboard/releases/tag/v0.2-handoff)

Central source of truth for the **UI-only MVP** and all **data deliverables**.
## Live site
https://fergus3763.github.io/UI-for-Dashboard/

## Structure
```
/ui/         -> Single-file UI (`index.html`) served by GitHub Pages
/data/       -> CSVs (Catalog, Rooms, RoomCatalogMap, VAT, Durations)
/handover/   -> Assumptions & Ambiguities Reports, spoke ZIPs
/glossary/   -> Meeting_Rooms_Glossary_and_Dictionary.xlsx
OPERATIONS.md -> Minimal Hub ↔ Spoke protocol
PR_CHECKLIST.md -> Pre-merge checks
CONTRIBUTING.md -> How to contribute (plain English)
```

## One-page UI (GitHub Pages)
1. Put the UI file at **`/ui/index.html`** (paste the canvas HTML here).
2. GitHub → Repo **Settings** → **Pages**:
   - Source: **Deploy from branch**
   - Branch: **main**
   - Folder: **/ui**
3. Visit: `https://<your-username>.github.io/meeting-room-mvp-hub/`

> This is a **click-through UI**. No logic or backend yet. All logic/data work happens via CSVs in `/data`.

## Data files (CSV, UTF-8, comma)
- `Catalog.csv`
- `Rooms.csv`
- `RoomCatalogMap.csv`
- `VAT.csv`
- `Durations.csv`

**Rules:** No invented data. Headers/order must match the **DataDictionary** (see `glossary/Meeting_Rooms_Glossary_and_Dictionary.xlsx`). Extra/source-only columns must be kept **after** the target columns and prefixed `x_`.

## Operations
- See **OPERATIONS.md** for the Hub ↔ Spoke protocol.
- Tag releases for each accepted handover (e.g., `v0.2-handoff`).

## Local validation
Run:
```
python validator.py
```
It checks schema, types, and cross-references and writes a report to `validation_report.txt`.
