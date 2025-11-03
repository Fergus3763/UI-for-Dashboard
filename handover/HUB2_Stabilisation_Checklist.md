# HUB#2 Stabilisation Checklist  
*(Pre–Hub#3 Transition | v0.3.1)*  

This checklist ensures Hub#2 is fully aligned, documented, and production-stable before handover.  
All actions must be committed, tagged, and reflected in the GitHub history before Hub#3 activation.

---

## 🧩 Phase 1 — Integrity & Documentation

- [ ] **README.md**
  - Add footer note:
    > **Note:** No local patches or temporary workarounds are permitted.  
    > All fixes must be implemented at system level and reflected across connected Hubs/Spokes.
  - Commit: `docs(readme): add no-local-patch policy notice`

- [ ] **Internal Links Audit**
  - Verify all Markdown links in `/handover/` use relative paths (`./API_CONTRACT.md` not `/handover/API_CONTRACT.md`).
  - Commit: `docs(handover): normalise relative markdown links`

- [ ] **HUB_PROMPT.md**
  - Confirm it references HUB#2 → HUB#3 transition.
  - Ensure it includes:
    - “No local patches…” clause
    - “Engage only after failure or close of HUB#2” instruction
  - Commit: `docs(prompt): align HUB prompt with HUB#3 continuity policy`

---

## ⚙️ Phase 2 — Environment Consistency

- [ ] **.env.sample**
  - Ensure the following exist and mirror production:
    ```
    SUPABASE_URL=
    SUPABASE_SERVICE_ROLE_KEY=
    NETLIFY_SITE_ID=
    NODE_ENV=production
    API_VERSION=18
    ```
  - Add inline comments for clarity.
  - Commit: `chore(env): align .env.sample with production vars and annotate`

---

## 🧱 Phase 3 — Schema & API Sync

- [ ] **Supabase Schema Validation**
  - Confirm `blackout_periods` has:
    - `id`, `room_id`, `title`, `starts_at`, `ends_at`
    - FK constraint: `room_id → rooms.id`
  - Run diagnostic query:
    ```sql
    select table_name, column_name
    from information_schema.columns
    where table_name in ('blackout_periods', 'rooms');
    ```
  - Commit: `docs(schema): verify blackout_periods schema and FK integrity`

- [ ] **API_CONTRACT.md**
  - Confirm header:
    `# API Contract — Availability & Blackouts (Finalised in HUB#2)`
  - Commit: `docs(api): confirm HUB#2 contract finalisation`

---

## 🚀 Phase 4 — Versioning & Release Tag

- [ ] **RELEASE_NOTES.md**
  - Add section:
    ```md
    ## v0.3.1 — HUB#2 Stabilisation
    - Added no-local-patch policy note
    - Normalised markdown paths
    - Finalised blackout_periods schema and API contract
    - Synced .env.sample with production
    ```
  - Commit: `docs(release): add v0.3.1 HUB#2 stabilisation notes`

- [ ] **Tag Release**
  - In GitHub → *Releases → Draft new release*
  - Tag: `v0.3.1`
  - Title: `HUB#2 Stabilisation`
  - Paste the notes above as release description.

---

## 🔍 Phase 5 — Deployment Validation

- [ ] **Netlify / Supabase Smoke Test**
  - Run:
    ```bash
    curl -X POST https://<your-netlify-site>.netlify.app/.netlify/functions/blackout_periods \
      -H "Content-Type: application/json" \
      -d '{"roomId":"RM-002","startsAt":"2025-10-29T10:00:00Z","endsAt":"2025-10-29T12:00:00Z","title":"Test"}'
    ```
  - Verify response: `{"success": true}`
  - Confirm row logged in Supabase.

- [ ] **Final Commit**
  - Commit:
    ```
    chore(release): tag v0.3.1 HUB#2 stabilisation (ready for HUB#3)
    ```

---

### 📦 Deliverable
✅ Stable, documented Hub#2 tagged `v0.3.1`  
✅ Environment, schema, and documentation aligned  
✅ Ready for seamless Hub#3 creation and activation  

---

**Maintainer:** Fergus3763  
**Timestamp:** (to be auto-updated in commit)
