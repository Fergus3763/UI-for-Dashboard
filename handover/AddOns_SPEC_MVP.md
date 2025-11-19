# Add-ons – MVP Specification (SPOKE Handover, v1.1)

**File:** `/handover/AddOns_SPEC_MVP.md`  
**Owner:** HUB#6  

**Purpose:**  
Define the complete, MVP-level behaviour and data model for Add-ons, using a **single common Add-on template** shared across all categories.  

**Scope (this MVP):**  
- Admin UI: create/edit/deactivate Add-ons using **one common form**.  
- Config storage: `data.addOns[]` in `public.admin_ui_config`.  
- Booker: still out-of-scope for this Spoke (but shapes must be future-safe).  

Rules / thresholds / upsell logic remain **Phase 2** and are documented but **not to be implemented now**.

---

## 1. Business Context (Plain English)

Add-ons are **goods or services** hotel admins can attach to a meeting-room booking, for example:

- **F&B:** Tea/Coffee, pastries, water, lunch menus.  
- **AV/Tech:** Projectors, microphones, speakers.  
- **Services & Amenities:** Stationery, parking, cloakroom, Wi-Fi upgrades.  
- **Labour & 3rd Party:** Technicians, hosts, security, outsourced services.  
- **Other:** Bedrooms linked to the meeting, airport transfers, anything else.

The Admin must be able to:

- Create Add-ons using **one common form**.  
- Choose a **category** for each Add-on.  
- Set **pricing** and whether it is **included** or **chargeable**.  
- Mark some Add-ons as **internal only** (not visible to guests) for future cost modelling.  
- Deactivate Add-ons without deleting them.

All categories share the **same underlying structure**.  
Category is a **field on the Add-on**, not a different storage mechanism.

---

## 2. Out of Scope for THIS MVP (Phase 2+)

The following are explicitly **out of scope for the current Spoke**, but the model must not block them:

- Rules/thresholds such as:
  - “Included if attendees ≥ X”
  - “Included if duration ≥ Y hours/days”
  - Day-of-week or seasonal rules.
- Upsell placement and logic:
  - “In purchase” vs “At purchase” prompts.
  - “Popular Add-ons” and “Last Minute Add-ons” logic.
- Any new endpoints or database tables.

These will be implemented in a **later Spoke**.  
For now they may appear as **inactive UI sections** or comments, but must not affect behaviour.

For upsell placeholders, see:  
`/handover/AddOns_Upsell_Preview.md`.

---

## 3. Data Model – Config Storage

All Add-ons are stored in Supabase in the existing config structure:

- Table: `public.admin_ui_config`  
- Row: `id = 'default'`  
- Column: `data` (JSONB blob)

### 3.1 Storage location

Inside `data`, Add-ons live under a single array:

```json
{
  "addOns": [
    { /* add-on object 1 */ },
    { /* add-on object 2 */ }
  ]
}

