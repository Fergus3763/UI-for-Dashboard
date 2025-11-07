# STATUS SUMMARY — HUB #4

## EXECUTION — Where we are now
- Admin UI deployed (tabs: Venue, Rooms, F&B, AV, Labour, Add-Ons).
- Netlify pipeline pinned to Node 18; site for `/admin-ui` live.
- Handover materials present; Mermaid fixed.
- Persistence integration (Supabase via Netlify Functions) is the **next** step.

## VISION — What we’re building
A SaaS for **hotels/venues** to automate **small meeting-room** sales (2–20 people, short lead time):
- Goal: search → configure → price → pay → confirm **without staff**.
- Trust hinges on **price integrity** — admin config must deterministically drive live pricing.
- MVP must **demonstrate** that link (Admin → Booker pricing).

## PROCESS MODEL
- **Dual-Track:** VISION (why/what) in parallel with EXECUTION (what ships).
- **Hub-and-Spoke:**  
  - **Hub (this repo/chat)** = single source of truth, coordination, integration, final record.  
  - **Spokes** = heavy implementation work.  
  - If it’s not in the Hub docs, it doesn’t exist.

## COMMS STANDARD
- Plain, literal language.  
- Short, step-based instructions (2–4 steps), await explicit **“DONE”** before advancing.  
- No jargon or unstated assumptions.

## NEXT CHECKPOINT (HUB #4)
- Wire “Save All” to `/.netlify/functions/save_config` (Supabase).
- Load-on-boot via `/.netlify/functions/load_config`.
- Keep all current routes stable (no regressions).
- Prep for Booker MVP (search → availability → results → reserve stub).
