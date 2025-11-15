ou can paste this into GitHub as:

/handover/AddOns_SPEC_MVP.md

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


The Add-ons list is global and shared across all categories. Category-specific views filter the same list.

3.2 Add-on object shape (MVP)

Each object in data.addOns[] must follow this structure:

{
  "id": "string",        // unique, stable identifier
  "name": "string",      // short name shown in UI (required)
  "description": "string", // longer explanation (optional)
  "category": "rooms" | "fnb" | "av" | "labour" | "other",

  "included": true,      // if true, treated as free (price ignored)
                         // if false, price is calculated via pricing model

  "pricing": {
    "model": "PER_EVENT" | "PER_PERSON" | "PER_PERIOD" | "PER_UNIT",
    "amount": 0,         // base price in venue currency (number >= 0)

    // Only used when model = "PER_PERIOD":
    "periodUnit": "MINUTE" | "HOUR" | "DAY"
  },

  "active": true         // if false, hidden from Booker but kept in config
}


Notes:

id can be a UUID or any unique string, but must be stable across saves.

description is optional but strongly recommended.

category must match one of the defined values exactly:

rooms, fnb, av, labour, other (lowercase).

included = true means:

Shown as “Included” or similar wording.

No additional cost added to the total for this add-on.

active = false:

Admin can keep old add-ons without showing them to guests.

3.3 Future fields (do NOT implement logic yet)

Do not implement these for MVP, but the model should not prevent them being added later:

isPopular – mark add-ons as popular for upsells.

isLastMinute – flag add-ons for last-minute prompt.

rules – future structure for conditional logic.

For now, they must not affect behaviour. They can be added in Phase 2 design.

4. Pricing Logic – MVP

The aim is to support full flexibility while keeping MVP calculations simple and predictable.

4.1 Pricing models (MVP)

Supported pricing.model values:

PER_EVENT

Meaning: One fixed price for the entire booking.

Total cost for this add-on:

total = pricing.amount

PER_PERSON

Meaning: Price per attendee.

Inputs needed: attendeeCount from booking context.

Total:

total = pricing.amount * attendeeCount

PER_PERIOD

Meaning: Price per time period (minutes/hours/days).

Inputs needed:

durationMinutes (booking duration in minutes)

pricing.periodUnit:

MINUTE → 1 minute

HOUR → 60 minutes

DAY → 1440 minutes

Compute:

periodLengthMinutes = 1 or 60 or 1440
periods = ceil(durationMinutes / periodLengthMinutes)
total = pricing.amount * periods


PER_UNIT

MVP simplification:

For now, treat PER_UNIT exactly like PER_PERSON,
assuming “1 unit per attendee” (e.g. one pastry per person).

Inputs needed:

attendeeCount

Total:

total = pricing.amount * attendeeCount

In a future phase, a separate “quantity” input can be added for more complex use (e.g. 2 pastries per attendee, or manual quantity entry).

4.2 Included Add-ons

If included = true:

The add-on still appears.

It should show as “Included” or similar.

No cost is added to the total, regardless of pricing.model.

4.3 Deactivated Add-ons

If active = false:

The add-on must not appear in Booker UI.

It can still be edited in Admin UI.

5. Admin UI Requirements (MVP)

The Admin UI is responsible for:

Creating/editing/deleting Add-ons.

Assigning each Add-on to a category.

Saving and loading via save_config / load_config.

Showing Add-ons in:

A Master Add-ons view.

Category-specific panels (Rooms, F&B, AV, Labour, Other).

Important: The SPOKE must confirm exact file paths with the active HUB before editing code.
This spec assumes there is (or will be) a dedicated Add-ons tab/page under “Venue Setup” or the main Admin navigation.

5.1 Single Source of Truth

There is only one underlying Add-ons list:

data.addOns[]


All Admin screens (Master Add-ons, Rooms, F&B, etc.) must:

Read from this same list.

Write changes back to this same list.

Use filtering by category for views.

No duplicated lists per category.

5.2 Master Add-ons Page (Admin)

The Master Add-ons page:

Shows a table/list of all Add-ons across all categories.

Provides controls to:

Add a new Add-on.

Edit an existing Add-on.

Deactivate (or delete) an Add-on.

Recommended fields in the UI list:

Name

Category (e.g. Rooms / F&B / AV / Labour / Other)

Included? (Yes/No)

Pricing model (Per event, Per person, Per period, Per unit)

Amount

Active (Yes/No)

Editing form fields:

Name (required)

Description (optional)

Category (dropdown: Rooms, F&B, AV, Labour, Other)

Included (checkbox)

Pricing:

Pricing model (dropdown: Per event / Per person / Per period / Per unit)

Amount (number, >= 0)

If Per period:

Period unit (dropdown: minute / hour / day)

Active (checkbox)

5.3 Category-specific Add-ons Panels (Admin)

Each of these Admin areas:

Rooms

F&B

AV

Labour

Other (if applicable in UI tabs)

should display a filtered view of data.addOns:

Filter: addOn.category === "<category key>"

For MVP, the behaviour can be:

Read-only list showing the Add-ons for that category with a link/button:

“Manage Add-ons” → takes the user to the Master Add-ons page.

OR (if scope allows):

Inline mini editor that adds/edits Add-ons for that category only, still writing to the global addOns array.

The exact interaction pattern (read-only vs inline editing) should be agreed with HUB before implementation.
Either is acceptable for MVP as long as all changes end up in data.addOns.

5.4 Saving and Loading

On load:

/.netlify/functions/load_config returns { ok, id, data }.

If data.addOns exists and is an array:

Use it directly as the Add-ons list.

If not present:

Start with [].

On save:

The Admin UI must POST to /.netlify/functions/save_config with a body that includes addOns, for example:

{
  "addOns": [ /* full current list */ ],
  "... other keys like venue, bookingPolicy, rooms, etc.": {}
}


The Spoke must follow the existing pattern used for Venue + Booking Policy:

use save_config to merge keys into the JSONB column.

save_config must not delete other existing keys (rooms, venue, etc.).

6. Booker Behaviour – MVP

The Booker will:

Receive config via the existing load_config → data.addOns.

Use this list to show Add-ons to the user and calculate prices.

6.1 Displaying Add-ons

For MVP, a simple, clear behaviour is sufficient:

Show Add-ons relevant to the current booking/venue (as defined in config).

Present them in a list/grid with:

Name

Short description

Price display:

“Included” if included = true

Otherwise, show:

“€X per person”

“€X per event”

“€X per hour” / “€X per day”

“€X per person” for Per unit in MVP

Allow the user to:

Select or deselect each add-on.

The method of selection (checkboxes, toggles, etc.) is up to the implementation, but must be:

Simple

Clear

Easy to adjust

6.2 Pricing in the total

The Booker:

Uses selected Add-ons + pricing model + booking context (attendeeCount, durationMinutes)

Computes total Add-ons price and adds it to the booking total.

For each selected Add-on:

If included = true → add 0

Otherwise:

Follow the pricing formulas in Section 4.1.

Clearly separate:

Room/base cost

Add-ons cost (sum of all add-ons)

Taxes/VAT (if applicable later)

6.3 No upsell logic yet

For MVP:

No “Last Minute Add-ons” suggestion logic.

No “Popular Add-ons” reordering logic.

No extra prompt just before “Reserve”.

Any “COMING SOON”/Preview UI is defined separately in
/handover/AddOns_Upsell_Preview.md.

7. Phasing & Future Work

To avoid scope creep, the Spoke implementing this spec should only deliver MVP. Future phases are separate Spokes.

Phase 1 (this spec) – MVP

Global Add-ons list in data.addOns.

Admin UI:

Master Add-ons page:

Create/Edit/Delete

Category-specific panels:

At least filtered view (plus optional link to Master page).

Booker:

Shows Add-ons

Applies pricing model

Adds to total

Handles Included / Active flags.

Phase 2 – Future (not in this Spoke)

isPopular / isLastMinute flags.

End-of-flow upsell prompt.

Real “Last Minute Add-ons” logic.

Conditional rules (e.g. free if attendees > 100).

Quantity control for PER_UNIT.

8. Implementation Constraints for Spoke

To protect architecture and future HUBs:

Backend endpoints:

Do not create new endpoints.

Use only:

/.netlify/functions/load_config

/.netlify/functions/save_config

Storage:

All Add-ons live in data.addOns.

No separate tables or config blobs.

File paths:

Before writing code, the Spoke must confirm exact Admin UI file paths with the active HUB.

This spec assumes there will be:

A Master Add-ons screen

Some integration into Rooms/F&B/AV/Labour tabs

But it does not enforce specific filenames.

No schema-breaking changes:

Existing keys in data (e.g. venue, bookingPolicy, etc.) must not be removed or renamed.

save_config must merge new addOns data alongside existing keys.

Plain English:

All labels and copy must be in clear, simple English, suitable for the OWNER.

9. Acceptance Criteria (Done Means Done)

For this Spoke to be considered complete, all of the following must be true:

Config storage

data.addOns is an array of objects in Supabase.

Each object follows the shape defined in Section 3.2.

Admin UI – Master Add-ons

Admin can:

Create a new add-on.

Edit an existing add-on.

Deactivate (or delete) an add-on.

Category, Included flag, Pricing model, Amount, and Period unit (for Per period) are all editable.

Saving updates Supabase via save_config.

Reloading the Admin UI shows the updated list via load_config.

Admin UI – Category Panels

Each relevant tab (Rooms, F&B, AV, Labour, Other) shows a filtered view of Add-ons for that category.

At minimum, there is a link from these panels to the Master Add-ons page.

Booker – Display

For a test booking, Add-ons appear with correct:

Name

Description

Pricing text

Included label (if applicable)

Inactive Add-ons (active=false) do not appear.

Booker – Pricing

For known test inputs (attendeeCount, durationMinutes), total add-on price matches the formulas in Section 4.1.

Included items (included=true) contribute zero to the price.

No regressions

Venue + Booking Policy continue to save and load correctly.

No console errors related to add-ons.

No changes to endpoints other than additional addOns field in save_config payload.

Documentation

Any UI label or behaviour specific to Add-ons is consistent with this file.

If the Spoke needs to deviate, it must be agreed with the HUB and reflected here.

10. Suggested Commit Message Pattern

When the Spoke is implemented, commits touching Add-ons should follow a pattern like:

feat(addons): add config model and master admin list

feat(addons): wire admin add-ons to save_config/load_config

feat(addons): integrate add-ons into booker pricing

Final integration commit might be:

feat(addons): implement MVP add-ons config and booker integration


End of File – AddOns_SPEC_MVP.md
This is the canonical Add-ons MVP spec for future SPOKES.
Any Spoke implementing Add-ons must follow this document and confirm file paths with the active HUB before coding.
