# HUB7_REQUIRED_FILES.md  
## Mandatory Inputs for Every New HUB

A new HUB session must **not begin any development or produce any code** until  
the OWNER has pasted **all of the following files in full**, each as a separate message.

This prevents drift, missing context, and architectural mistakes.

---

# 1️⃣ Canonical Prompts (foundation)
These establish role, behaviour, guardrails, and governance.

1. `/handover/HUB_PROMPT_CANONICAL.md`
2. `HUB6_MASTER_PROMPT_1.md`
3. `HUB6_MASTER_PROMPT_2.md`

---

# 2️⃣ Context Spine (architecture & history)

4. `/handover/HUB_CONTEXT.md`
5. `/handover/STATUS_SUMMARY.md`

---

# 3️⃣ Active Specs Required by HUB #7

These define the tasks HUB #7 must operate on.

6. `/handover/RoomSetup_SPEC_MVP.md`
7. `/handover/Nav_RoomOverview_AddonDB_SPOKE.md`

---

# 4️⃣ API / Data Layer (needed for continuity)

8. `/handover/API_CONTRACT.md`  
9. `/handover/INTEGRATION_PLAN.md`  
10. `/handover/DATA_BOUNDARY.md`

---

# 5️⃣ Environment & Supabase (minimal required)

11. `/handover/supabase/ENV_SAMPLE.md`  
12. `/handover/supabase/001_schema.sql`  
13. `/handover/supabase/VALIDATION.md` *(if present)*  
14. `/handover/supabase/seed_instructions.md` *(historical: optional)*

---

# 6️⃣ Admin UI Critical Components

These ensure the new HUB understands where UI state is loaded, saved, and hydrated.

15. `admin-ui/netlify/functions/load_config.mjs`
16. `admin-ui/netlify/functions/save_config.mjs`
17. `admin-ui/src/pages/Dashboard/VenueSetup/Tabs/VenueTab.jsx`
18. `admin-ui/src/pages/Dashboard/VenueSetup/Tabs/BookingPolicyTab.jsx`
19. `admin-ui/src/pages/Dashboard/Rooms/index.jsx`
20. `admin-ui/src/pages/Dashboard/Rooms/RoomSetupTab.jsx` *(if present)*

---

# 7️⃣ Add-On System (needed for Room Setup continuity)

21. Any file under:  
    `admin-ui/src/pages/Dashboard/Rooms/AddOns/*`

---

# 8️⃣ Availability (historical reference only — DO NOT REUSE CODE)

22. *One-paragraph explanation from OWNER:*  
    “The old ‘availability-spoke’ repo existed only as an early prototype.  
     It repeatedly failed, was replaced during HUB#6 by a clean rebuild,  
     and must NOT be reused.  
     HUB #7 should ignore the old code entirely — it is archival only.”


---

# 9️⃣ HUB7 Successor Checklist

23. `/handover/NEXT_ACTIONS_HUB7.md`  
   (HUB #7 works from this file throughout its life.)

---

#  🔒 Final Rule

If ANY file above is missing, incomplete, or unclear:  
**The HUB must stop immediately and request the missing item.**

No work may start until the full set is provided.

This rule is mandatory and permanent.

