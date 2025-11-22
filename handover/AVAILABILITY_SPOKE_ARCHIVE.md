# AVAILABILITY_SPOKE_ARCHIVE.md

**Purpose:**  
To record the history and status of the early “Availability Spoke” work, and to make it clear how it should (and should not) be used by future HUBs.

---

## 1. What the Availability Spoke was

- A separate experimental project / repo (often referred to as `availability-spoke` or deployed on Vercel) used to explore:
  - Meeting room availability rules  
  - Blackout periods  
  - Core calendar logic and functions  

- It went through many iterations and deployments and helped the Owner refine:
  - How blackout periods should behave  
  - How availability windows should be queried  
  - How room calendars might be structured

However, it is **not** the current live implementation.

---

## 2. Current Source of Truth for Availability & Blackouts

For this repo (`UI-for-Dashboard` / Admin UI):

- Availability and blackout logic are now part of the **Netlify Functions + Supabase** layer, not the old Vercel “availability-spoke” app.
- The **canonical contract** for these behaviours now lives in:

  - `handover/API_CONTRACT.md`  
  - `handover/INTEGRATION_PLAN.md`  
  - `handover/supabase/001_schema.sql`  
  - `handover/supabase/002_seed_instructions.md`

- Admin UI should **never** attempt to own or duplicate the availability engine.  
  It should:
  - Call the API
  - Display results
  - Let the backend enforce rules

---

## 3. How future HUBs may use the old Availability Spoke

The old spoke may still be useful as **reference**, but only in this way:

✅ Allowed:
- Reading the old code or UI to understand:
  - How blackout periods might be displayed  
  - How availability might be visualised  
  - Example flows or naming patterns  
- Copying **small, clearly-understood snippets** (e.g. a helper function) into the current repo, **but only after**:
  - Checking that it matches the current API/DB shapes, and  
  - Documenting the reuse in `RELEASE_NOTES.md`.

❌ Not allowed:
- Treating the old Availability Spoke as current production code.
- Pointing the Admin UI or Booker at any of the old Vercel deployments.
- Copy-pasting entire files or flows without aligning them to:
  - The current Netlify Functions  
  - The current Supabase schema  
  - The current Admin config model (`admin_ui_config.data`)

If in doubt, the HUB should:
1. Ask the Owner if a specific piece of old logic is still wanted.  
2. Propose a small, scoped migration plan (e.g. “Bring blackout day-picker UI into current Rooms page”).

---

## 4. Clear Status: ARCHIVED

The Availability Spoke is **archived** in architectural terms:

- It is no longer the primary path forward.  
- It is a historical experiment, not a live feature.  
- It can inspire future work, but never override the current contracts defined in `/handover` and the live Netlify + Supabase setup.

Any future availability or blackout work should start from:

- `handover/API_CONTRACT.md`  
- `handover/INTEGRATION_PLAN.md`  
- The existing Netlify Functions in this repo.

---

_Last updated: HUB #6_  
- Documented status of old Availability Spoke.  
- Clarified how it may be used as reference only.
