# Project Links & Endpoints

> One place for the URLs we share with the team.  
> **Bookmark this page** (or link it from the README).

_Last updated: {{ update this date }}_

---
### Glossary / Data Dictionary
- [📄 Open in GitHub](https://github.com/Fergus3763/UI-for-Dashboard/blob/main/glossary/Meeting_Rooms_Glossary_and_Dictionary.xlsx)
- [⬇️ Direct download (.xlsx)](https://raw.githubusercontent.com/Fergus3763/UI-for-Dashboard/main/glossary/Meeting_Rooms_Glossary_and_Dictionary.xlsx)

## Live UIs

### HUB (Admin UI – MVP)
- **GitHub Pages (root UI):**  
  https://fergus3763.github.io/UI-for-Dashboard/

- **Repo (UI):**  
  https://github.com/Fergus3763/UI-for-Dashboard

- **Quick links within the UI header:**  
  - `/data` → Project data folder  
  - `/handover` → Handover notes  
  - `/glossary` → Term glossary

---
## Data & DB
- **Supabase Handoff (for API Spoke)** → [/handover/supabase/HANDOFF_TO_API.md](/handover/supabase/HANDOFF_TO_API.md)

### Availability Spoke (Admin + API Demo)
- **Netlify site (Admin page):**  
  https://zingy-biscuit-94791a.netlify.app/

- **Repo (Availability Spoke):**  
  https://github.com/Fergus3763/availability-spoke

---

## API (Availability Spoke – Netlify Functions)

**Production (Netlify):**
- Check availability (GET):  
  `https://zingy-biscuit-94791a.netlify.app/.netlify/functions/availability?roomId=Room-A&from=2025-10-15T10:00:00Z&to=2025-10-15T12:00:00Z`

- Create blackout (POST):  
  `https://zingy-biscuit-94791a.netlify.app/.netlify/functions/blackout_periods`  
  Body (JSON examples):
  ```json
  {
    "roomId": "Room-A",
    "startsAt": "2025-10-15T10:00:00Z",
    "endsAt": "2025-10-15T12:00:00Z",
    "title": "Admin Blackout"
  }
