# Handover Documentation Index (Canonical)

This folder (`/handover`) contains the **single source of truth** for all HUB-to-HUB continuity.

Every new HUB must read these documents **before writing any code.**

---

## 1. Canonical Prompts
- **HUB_PROMPT_CANONICAL.md** — master behavioural & governance rules  
- **HUB_CONTEXT.md** — architecture, design intent, and HUB relay notes  
- **STATUS_SUMMARY.md** — all HUB progress in chronological order  

---

## 2. Specs & Spokes
- **RoomSetup_SPEC_MVP.md** — next Spoke implementation  
- **Nav_RoomOverview_AddonDB_SPOKE.md** — navigation changes & placeholder pages  

---

## 3. API & Data Layer
- **API_CONTRACT.md** — live endpoint definitions  
- **DATA_BOUNDARY.md** — UI ↔ API ↔ DB responsibilities  
- **INTEGRATION_PLAN.md** — roadmap to v0.3 (DB-linked availability)

---

## 4. Supabase
Located in `/handover/supabase/`:
- `001_schema.sql` — canonical schema  
- `ENV_SAMPLE.md` — required environment variables  
- `VALIDATION.md` — DB consistency checks  
- `seed_instructions.md` — historical only  

---

## 5. Startup Requirements
- **HUB7_REQUIRED_FILES.md** — mandatory files the OWNER must paste for every new HUB  
- **NEXT_ACTIONS_HUB7.md** — task list for the incoming HUB  

---

## 6. Principles
- `/handover` overrides all other folders.  
- No work is valid unless aligned with these documents.  
- Every HUB must update STATUS_SUMMARY.md and HUB_CONTEXT.md before handover.

---

**Last updated:** HUB #6 → HUB #7 transition
