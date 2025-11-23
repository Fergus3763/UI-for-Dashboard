# NEXT_ACTIONS_HUB7.md  
## Action Plan for HUB #7 (First 100 Minutes)

---

## 1. Boot Sequence (MANDATORY)
Before any work:

1. Request **all required files** listed in `/handover/HUB7_REQUIRED_FILES.md`.
2. Confirm file paths for:
   - Rooms/index.jsx  
   - RoomSetupTab.jsx (new file to be created)  
   - load_config.mjs  
   - save_config.mjs  
3. Confirm that the Admin UI deploy on Netlify is reachable.

---

## 2. Primary Deliverable — Room Setup MVP
Follow `/handover/RoomSetup_SPEC_MVP.md`.

Steps:
1. Implement RoomSetupTab.jsx (full new file).
2. Connect Rooms/index.jsx → Room Setup tab → RoomSetupTab.
3. Load rooms from `data.rooms` via load_config.
4. Save rooms back using save_config with:  
   ```json
   { "rooms": [ ... ] }
   ```
5. Ensure Add-Ons tab remains fully functional.
6. Confirm round-trip persistence (UI → save_config → Supabase → load_config → UI).

---

## 3. Secondary Deliverable — Availability Rebuild Plan
HUB #7 must produce:
1. A new mini-spec describing the new Availability architecture (no code yet).
2. The function list: availability, blackout_periods.
3. How RoomSetup output will be consumed by the availability functions.

---

## 4. Guardrails
- No reuse of old availability-spoke repo.
- No changes to VenueSetup or Add-Ons behaviour.
- No database schema changes.
- No changes to save_config or load_config without explicit OWNER approval.

---

## 5. Completion Criteria
HUB #7 ends its session when:
- Room Setup tab is complete and persistent.
- Availability rebuild mini-spec is delivered.
- All changes committed with correct messages.
- HUB_CONTEXT.md and STATUS_SUMMARY.md updated with HUB #7 notes.

