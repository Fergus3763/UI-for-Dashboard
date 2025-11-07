# HUB PROMPT TEMPLATE

Use this file to start any new HUB cleanly. Send Prompt #1 first. After the assistant acknowledges, send Prompt #2. If there were changes since the last HUB that aren’t yet captured in the repo, also send the optional Delta Prompt.
<!-- ───────────────────────────────────────────────────────────────────────── -->
## 🔁 Prompt Evolution Note

The assistant will occasionally propose **Prompt Revision Suggestions** when new insights,
principles, or governance nuances emerge that would help future HUBs (especially for
Prompt #2 — *“What You May Have Missed”*).  
Each suggestion will identify:
- the affected prompt section (e.g., “Vision”, “Principles”, “Governance”), and  
- the exact line or paragraph to add.

You may review and merge these notes into this template as needed to keep it current.

---

## 🔹 Prompt #1 — BOOTSTRAP (send first)
You are now HUB #<N>, continuing from HUB #<N-1>.

Context:
- Canonical docs live in `/admin-ui/` (this repo).
- Follow Dual-Track (VISION + EXECUTION) and Hub-and-Spoke governance.
- No external sources or prior chats. Use only repo content.

Current state (from `/admin-ui/STATUS_SUMMARY.md`):
- <1–3 bullets: what’s finished>
- <1–2 bullets: what’s next (the immediate milestone)>

Your role:
→ Begin with `/admin-ui/STATUS_SUMMARY.md` to confirm current focus.  
→ Use `/admin-ui/SPEC_MASTER_MVP.md` and `/admin-ui/ROADMAP_MVP.md` to guide decisions.  
→ If persistence is involved, confirm `/admin-ui/docs/PERSISTENCE.md`.  
→ Keep existing working routes untouched.

Rules:
- Every change = explicit **path + commit message + full replacement code**.
- Plain English; 2–4 steps per message; await explicit **“DONE”** before advancing.
- Do not infer beyond repo docs.

Deliverables for this HUB:
- Updated `/admin-ui/STATUS_SUMMARY.md` reflecting progress.
- Working feature per roadmap milestone, deployed.

(Replace the angle-bracket bullets above before sending.)

---

## 🔹 Prompt #2 — CONTEXT DEEPENING (“What You May Have Missed”) (send second)
What you may have missed:
- Read `/admin-ui/HANDOVER_PROTOCOL.md` (governance & comms).
- Read `/admin-ui/docs/APPENDIX_CONTEXT_HARVEST.md` (OWNER intent, pricing integrity, purpose).
- If needed, consult historical files under `/handover/` (labelled “Historical Reference”) for lineage.
- Reconfirm that **Price Integrity** applies: Admin inputs must deterministically drive Booker totals.
- Confirm the acceptance gates in `/admin-ui/ROADMAP_MVP.md`.

Task:
- Summarise your understanding in <8–12> bullets: purpose, end goal, owner principles, current progress, constraints.
- List any ambiguities or conflicts you detect in the docs before coding.

---

## 🔹 (Optional) Prompt #3 — DELTA (only if there’s new info not yet in repo)
Delta since last HUB (not yet in repo):
- <brief bullet list of new decisions, constraints, or environment changes>

Action:
- Please incorporate this Delta into your understanding.  
- Propose minimal doc edits (paths + commit messages + full replacement) to bring the repo into parity.

---

## File Index (assistant should consult these first)
- `/admin-ui/STATUS_SUMMARY.md` — current state & next milestone
- `/admin-ui/SPEC_MASTER_MVP.md` — VISION & EXECUTION (contracts)
- `/admin-ui/ROADMAP_MVP.md` — milestones & acceptance gates
- `/admin-ui/HANDOVER_PROTOCOL.md` — handover rules (no external inference)
- `/admin-ui/docs/PERSISTENCE.md` — data model & API contract (if persistence involved)
- `/admin-ui/docs/APPENDIX_CONTEXT_HARVEST.md` — captured context (HUB #4)

> Historical docs under `/handover/` exist for lineage only; the `/admin-ui/` versions are canonical.
