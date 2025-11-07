# ROADMAP — MVP

## VISION TRACK (Outcomes)
1. Admin config is **the** source of pricing truth.
2. Booker visibly demonstrates Admin-driven pricing and availability.
3. Process is reproducible (Hub records every step).

## EXECUTION TRACK (Milestones)
- **HUB #3** — Admin UI tabs complete; deployment stable. ✅
- **HUB #4** — Persistence integration  
  - Wire “Save All” → Supabase via Netlify Functions  
  - Add load-on-boot; confirm round-trip determinism  
  - Keep all routes stable
- **HUB #5** — Booker MVP  
  - Search → Availability → Results → Reserve stub  
  - Totals traceable back to Admin config  
  - Alternative suggestions when first choice unavailable
- **HUB #6** — Pricing hardening & basic blocks  
  - Add VAT/third-party/blocks surfaced in UI + Booker
- **HUB #7** — Payment path (stub → capture) & audit trail

## ACCEPTANCE GATES
- Each HUB merges only when:  
  1) Spec updated;  
  2) Contracts unchanged or versioned;  
  3) Demo matches Spec;  
  4) Plain-language summary added to STATUS_SUMMARY.md.

## COMMUNICATION PROTOCOL
- Plain language; 2–4 step instructions; **“DONE”** gates.
- No hidden updates: if it’s not in repo docs, it doesn’t exist.
