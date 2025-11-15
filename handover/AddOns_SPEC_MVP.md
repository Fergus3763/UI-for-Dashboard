# Add-ons – MVP Specification (SPOKE Handover)
**File:** `/handover/AddOns_SPEC_MVP.md`  
**Owner:** HUB#6  
**Purpose:** Define the complete, MVP-level behaviour and data model for Add-ons, so a SPOKE can implement the feature without guessing.  
**Scope:** Admin UI + Booker usage of Add-ons (config + pricing), *not* the upsell “coming soon” preview (which is defined in `/handover/AddOns_Upsell_Preview.md`).

---

## 1. Business Context (Plain English)

Add-ons are **goods or services** that a hotel can attach to a meeting-room booking, for example:

- F&B: Tea/Coffee, Pastries, Water  
- Rooms: Breakout room, extra hours  
- AV: Microphone, projector  
- Labour: Technician hours, host  
- Other: Bedrooms, airport pickups, etc.

Add-ons can be:

- **Included**: free, but still visible as “Included” in the Booker; or  
- **Charged**: add an extra cost to the booking.

Add-ons apply across several **categories**:

- Rooms  
- F&B  
- AV  
- Labour  
- Other  *(catch-all, including venue-level things like bedrooms and transfers)*

The Admin must be able to:

- Create and edit Add-ons.  
- Assign them to a category.  
- Set how they are priced.  
- Have them appear in both:
  - A **Master Add-ons** area  
  - Appropriate category-specific views (Rooms, F&B, AV, Labour, Other)

The Booker must be able to:

- Show relevant Add-ons for a given booking.  
- Include their cost in the total price.  
- Show “Included” items clearly when they are free.

---

## 2. Out of Scope for MVP

The following are **explicitly out of scope** for this MVP Spoke (but must be future-compatible):

- Complex rules (e.g. “Free if attendees > 100”, “Discounted on weekends”).  
- Fully functional “Popular Add-ons” or “Last Minute Add-ons” logic.  
- End-of-flow upsell prompts (“Would you also like to add…?”).  
- Any new backend endpoints.

These are reserved for **Phase 2+**.

For the “Coming Soon” / Upsell Preview UI, see:  
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
    {
      /* add-on object 1 */
    },
    {
      /* add-on object 2 */
    }
  ]
}
