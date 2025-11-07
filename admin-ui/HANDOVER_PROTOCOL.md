# HANDOVER PROTOCOL (for future HUBs and 3rd parties)

## PURPOSE
Provide a deterministic, developer-agnostic transfer: the successor can continue without tribal knowledge.

## SCOPE OF AUTHORITY
- **OWNER** is the sole authority on scope/process.
- **Hub** is the single source of truth (this repo + latest Hub thread).
- No use of prior chats or online sources.

## ARTIFACTS (REQUIRED)
1. `STATUS_SUMMARY.md` — current state + next step in plain language
2. `SPEC_MASTER_MVP.md` — contracts (VISION + EXECUTION clearly marked)
3. `ROADMAP_MVP.md` — milestones, acceptance gates
4. `CHANGELOG.md` — commits (path + message + full replacements)
5. `PERSISTENCE.md` — data model + function contracts (if relevant)
6. `KNOWN_ISSUES.md` — bugs, caveats, blockers
7. `SETUP.md` — env vars, deploy instructions

## PROCESS
1. **Prepare**: Ensure all changes are captured as full-file replacements with explicit commit messages.
2. **Verify**: Run acceptance demo matching SPEC contracts.
3. **Summarise**: Update `STATUS_SUMMARY.md` in plain, literal language.
4. **Transfer**: Provide a short 2–4 step “Next Actions” list; await **“DONE”**.

## COMMUNICATION STANDARD
- No jargon, no implied context.
- Steps of 2–4 items.
- Each step waits for explicit **“DONE”** before proceeding.

## QA & ACCEPTANCE
- ✅ Docs and code align (no drift).
- ✅ Admin→Booker linkage demonstrable (where applicable).
- ✅ Persistence round-trip verified (where applicable).
- ✅ All env/deploy details in SETUP.md (no hidden config).

## APPENDIX — CONTEXT HARVEST (HUB #4 THREAD ONLY)
**OWNER (this thread):**
- Replace any prior brand references; use neutral “OWNER / platform” terminology.
- Keep all context inside the Hub; do not infer from older chats or the web.
- Maintain **Dual-Track** (Vision + Execution) going forward.
- Plain-language, step-based comms; await **“DONE.”**
- Purpose: automate small meeting-room sales end-to-end without staff involvement.

**HUB (this thread):**
- Persistence via Netlify Functions + Supabase storing a single JSON config per venue/tenant.
- Booker MVP must visibly reflect Admin-driven pricing, with alternatives when unavailable.
- Hub integrates/records; Spokes do heavy implementation.

> Note: This appendix is restricted to content from this HUB #4 chat and the uploaded “Missed details” document.
