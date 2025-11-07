# APPENDIX — CONTEXT HARVEST (HUB #4 Only)

This appendix consolidates all relevant OWNER and HUB context from HUB #4 and
*Missed details.docx* for archival and traceability.

---

## OWNER INSIGHTS

- **Market Problem:** post-COVID rise in small, short-notice meeting bookings that
  current hotel workflows can’t profitably handle.  
- **Ambition:** make those bookings viable again through automation and price accuracy.  
- **Key Value:** eliminate human back-and-forth; achieve instant confirmation.  
- **Trust Requirement:** hotels must rely on algorithmic pricing accuracy.  
- **System Principle:** Admin configuration drives every customer-side calculation.  
- **Tone & Communication:** literal, plain English; no jargon or acronyms.  

---

## HUB INSIGHTS

- **Architecture:**  
  - Frontend = React Admin UI  
  - Persistence = Netlify Functions + Supabase JSONB  
  - Future Booker MVP = search → availability → results → reserve stub  
- **Process:**  
  - Hub-and-Spoke model: Hub holds truth; Spokes implement.  
  - Dual-Track workflow: Vision + Execution.  
- **Governance:** OWNER retains authority; Hub records deterministically.  
- **Current Focus:** persistence integration (HUB #4).  
- **Next:** Booker MVP demonstrating Admin→Booker price integrity.  

---

## COMMUNICATION PRINCIPLES

1. Keep instructions to 2–4 concise steps.  
2. Wait for explicit **“DONE.”** before proceeding.  
3. No implicit dependencies or local assumptions.  
4. Documentation and deployed code must always be in sync.

---
