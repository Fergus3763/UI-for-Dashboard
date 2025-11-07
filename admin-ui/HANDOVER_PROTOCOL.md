# HANDOVER PROTOCOL (Standard for all HUBs and 3rd-party transfers)

## PURPOSE
Guarantee a deterministic, developer-agnostic transfer so the next HUB or developer can resume work
with zero undocumented knowledge.

---

## AUTHORITY & GOVERNANCE

| Role | Responsibility |
|------|----------------|
| **OWNER** | Defines scope, process, and acceptance. Only authority on direction. |
| **Hub** | Single source of truth — integrates, documents, and records all work. |
| **Spokes** | Perform heavy implementation under Hub direction. |

No information may be sourced from previous chats or external material; each HUB begins only from the latest recorded Hub context.

---

## REQUIRED ARTIFACTS

1. **STATUS_SUMMARY.md** — current state and next milestone  
2. **SPEC_MASTER_MVP.md** — contracts, with `## VISION` and `## EXECUTION` clearly marked  
3. **ROADMAP_MVP.md** — milestones + acceptance gates  
4. **CHANGELOG.md** — full-file replacements with commit messages  
5. **PERSISTENCE.md** — data model and function contracts (if applicable)  
6. **KNOWN_ISSUES.md** — open bugs, blockers, caveats  
7. **SETUP.md** — environment variables and deployment instructions  

---

## PROCESS (HUB FINALISATION)

1. **Prepare** – ensure all commits follow the explicit pattern: `path + message + full replacement`.  
2. **Verify** – demo reproduces behaviour defined in SPEC; docs updated.  
3. **Summarise** – refresh `STATUS_SUMMARY.md` in plain language.  
4. **Transfer** – provide 2–4 step *Next Actions* list; await explicit **“DONE.”**

---

## COMMUNICATION STANDARD

- Plain, literal language; no acronyms or shorthand.  
- Each step = 2–4 items.  
- Wait for explicit **“DONE”** confirmation before continuing.  
- Any item not recorded in the Hub repo is considered **non-existent**.

---

## QA & ACCEPTANCE GATES

✅ Documentation and code are aligned (no drift).  
✅ Admin → Booker linkage demonstrable where applicable.  
✅ Persistence round-trip verified if implemented.  
✅ All environment and deployment details included in `SETUP.md`.

---

## APPENDIX — Context Harvest (HUB #4 thread + “Missed details”)

**OWNER Direction**
- Replace legacy brand names; maintain neutral “OWNER / Platform” language.  
- Maintain the **Dual-Track** structure (Vision + Execution).  
- Use plain-language, step-based instructions; require explicit *DONE* gates.  
- Project purpose: automate **small-meeting-room** sales for hotels/venues —
  search → customise → price → pay → confirm, with no staff intervention.  
- Trust in automated pricing is the adoption hinge; every Admin entry must map to a visible, accurate Booker price.  

**HUB Behaviour**
- Hub = integrator and record keeper; Spokes = executors.  
- Persistence via Netlify Functions + Supabase JSONB config per venue/tenant.  
- Booker MVP validates Admin-driven pricing and availability with fallbacks.  
- No external inference or prior chat history allowed.

---
