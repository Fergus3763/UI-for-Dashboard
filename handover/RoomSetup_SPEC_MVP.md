# Rooms – Room Setup (MVP Specification, SPOKE Handover)

**File:** `/handover/RoomSetup_SPEC_MVP.md`  
**Owner:** HUB#6 → HUB#7  
**Scope:**  
Implement and maintain the **Room Setup** experience under the existing **Rooms → Room Setup** tab, using the shared config pattern (Supabase JSON via Netlify Functions).

This spec covers:

- Room data model (stored in `admin_ui_config.data.rooms`).  
- How the Admin UI loads and saves rooms.  
- Basic Room Setup UI behaviour.  
- Explicit rules for **room code auto-generation**.  

It does **not** cover:

- Availability engine.  
- Blackout persistence.  
- Booker UI and pricing.  

Those are handled by separate availability / blackout specs and future Spokes.

---

## 1. Business Context (Plain English)

The Admin UI has a **Rooms** section with two sub-tabs:

- `Room Setup`  
- `Add-Ons` (already implemented, stores config in `data.addOns`)

**Room Setup** must allow a hotel admin to:

- Define one or more **rooms** (e.g. “Boardroom”, “Meeting Room A”, “Suite 1”).  
- Store basic properties for each room in a way the **Booker** and **Availability engine** can use later.  
- Keep the data in Supabase so it survives refresh and deploys.

This Room Setup is the canonical source of truth for:

- Which rooms exist.  
- Their codes and display names.  
- Their basic capacities.  
- Whether they are active or not.

---

## 2. Data Model — Where Rooms Are Stored

Use the existing config structure:

- **Table:** `public.admin_ui_config`  
- **Row:** `id = 'default'`  
- **Column:** `data` (JSONB blob)

Inside `data`, rooms are stored under a **top-level** `rooms` array:

```jsonc
{
  "rooms": [
    {
      /* room object 1 */
    },
    {
      /* room object 2 */
    }
  ],

  /* existing keys (venue, bookingPolicy, addOns, etc.) must remain unchanged */
}
2.1 Room Object Shape (MVP)

Each object in data.rooms[] must follow this structure:

{
  "id": "string",          // unique, stable identifier for the room
  "code": "string",        // short code, e.g. "RM-001" (required, unique)
  "name": "string",        // human-readable name (required)
  "description": "string", // longer free-text description (optional)

  "capacityMin": 1,        // minimum attendees (integer >= 1)
  "capacityMax": 20,       // maximum attendees (integer >= capacityMin)

  "active": true           // if false, hidden from Booker but kept in config
}


Notes:

id

Can be a UUID or any unique string.

Must not change once created.

Used internally; not shown to guests.

code

Short code visible in admin and used in other systems (e.g. “RM-001”).

Required and unique within rooms[].

Must follow the auto-code rules (Section 3).

capacityMin / capacityMax

Whole numbers (integers).

capacityMin >= 1.

capacityMax >= capacityMin.

active

true → room can be used by Booker (subject to availability rules later).

false → room visible in Admin UI but ignored by Booker.

Room objects may gain additional fields in future (e.g. layout, tags, blackout metadata), but this is the baseline contract.

3. Room Code Auto-Generation (Explicit Rules)

Room codes must be consistent, human-readable, and stable.

3.1 Format

The standard format is:

RM-XXX


Where:

RM- is a fixed prefix.

XXX is a zero-padded 3-digit number, e.g.:

RM-001

RM-002

RM-010

RM-123

3.2 Generation Rules (Admin UI behaviour)

When creating a new room:

The admin may either:

Leave the Code field empty, or

Type a code manually.

If the admin leaves Code empty:

The UI must:

Look at all existing rooms[].code values that start with "RM-" and a 3-digit suffix.

Extract the numeric portions (e.g. 1, 2, 10, 123 from RM-001, RM-002, etc.).

Pick the next available integer, max + 1, or 1 if no codes exist.

Generate a new code with zero padding to 3 digits, e.g.:

If no rooms exist → RM-001

If highest existing code is RM-007 → RM-008

If highest existing code is RM-099 → RM-100

If the admin types a code manually:

The UI must:

Accept it as long as it is:

Non-empty, AND

Unique within the rooms[] array.

Validation:

If a duplicate is detected, show a simple error (e.g. “Code must be unique”) and block save.

The generated code value is:

Stored in the room object.

Treated as immutable identifier for business purposes (though the admin may change it manually in future if needed).

3.3 No Assumptions About External Systems

The code format is intentionally simple.

No integration with external PMS/CRS systems is assumed at this stage.

Future Spokes may introduce alternative prefixes (e.g. per venue), but MVP must implement RM-XXX as described.

4. Existing Plumbing — Save/Load Pattern

Room Setup must reuse the existing admin config pipeline:

/.netlify/functions/load_config (GET)

/.netlify/functions/save_config (POST)

The established pattern:

load_config returns JSON:

{
  "ok": true,
  "id": "default",
  "data": {
    /* config blob */
  }
}


save_config merges the incoming JSON body into data of admin_ui_config without deleting other keys.

4.1 Required Load Behaviour (Rooms → Room Setup)

When Rooms → Room Setup loads:

Call /.netlify/functions/load_config (GET).

Extract json.data.

If data.rooms exists and is an array → use it.

If data.rooms is missing → start with [].

Store in React state in the Rooms parent component, e.g.:

const [rooms, setRooms] = useState([]);

4.2 Required Save Behaviour (Rooms → Room Setup)

When the user saves from the Room Setup tab:

The parent Rooms component must POST to:

/.netlify/functions/save_config


The body must include the full rooms array:

{
  "rooms": [
    /* full, current rooms[] */
  ]
}


save_config merges this into existing data.

It must not remove or rename other keys (e.g. venue, bookingPolicy, addOns, etc.).

The Spoke must not modify save_config implementation as part of this spec.

5. Files and Ownership

This spec operates under the Rooms section (not Venue).

5.1 Known parent component

There is an existing Rooms page at:

admin-ui/src/pages/Dashboard/Rooms/index.jsx


This file:

Provides the top-level Rooms layout.

Renders at least two sub-tabs:

Room Setup

Add-Ons

Already passes props to AddOnsTab for the Add-Ons editor.

Rules:

Rooms/index.jsx must remain the single source of truth for:

rooms state.

API calls to load_config and save_config related to rooms.

5.2 Room Setup component file

Create (or reuse, if already present) a dedicated component for the Room Setup tab, for example:

admin-ui/src/pages/Dashboard/Rooms/RoomSetupTab.jsx


RoomSetupTab responsibilities:

Receives props:

<RoomSetupTab
  rooms={rooms}
  setRooms={setRooms}
  onSave={handleSaveRooms}
  saving={saving}
/>


Handles:

Listing rooms.

Creating a new room.

Editing an existing room.

Deleting a room (removing it from the array).

Applying the auto-code rules when the admin leaves code blank for a new room.

Does not:

Call Netlify functions directly.

Know anything about Supabase.

Manage cross-tab state.

The parent Rooms/index.jsx handles all API calls and global state.

If the file name or path differs, the Spoke must document the final path in a comment at the top of the file.

6. UI Behaviour (Plain English)
6.1 Tabs under Rooms

Under Rooms, there are two sub-tabs:

Room Setup (default / first tab)

Add-Ons

Click behaviour:

Room Setup → Show the Room Setup configuration UI.

Add-Ons → Show the existing Add-Ons UI (unchanged).

6.2 Room List

The Room Setup tab should show:

A short introductory paragraph, e.g.:

“Define your meeting and event rooms here.
These settings feed into availability and pricing logic for the Booker.”

A list or table of rooms with columns:

Code

Name

Capacity (Min–Max)

Active (Yes/No)

Actions: Edit / Delete

If there are no rooms:

Show a simple message such as:

“No rooms defined yet. Click ‘New room’ to add your first room.”

6.3 Create / Edit Room Form

Provide a form, either inline or in a panel, with fields:

Code

Text input.

Optional on create (auto-filled if left blank).

Required on save.

Must be unique.

Name

Text input (required).

Description

Textarea (optional).

Capacity Min

Number input (required).

>= 1.

Capacity Max

Number input (required).

>= capacityMin.

Active

Checkbox (default: checked / true).

Use the same form for both:

“New room”

“Edit room”

with a simple internal state flag to distinguish modes.

6.4 Save Flow

User edits rooms (add/edit/delete) in the Room Setup tab.

When ready, clicks a Save button in Room Setup.

RoomSetupTab calls onSave(updatedRooms) passed from the parent.

Parent Rooms/index.jsx:

Sets saving = true.

POSTs {"rooms": updatedRooms} to save_config.

Shows “Saving…” while the request is in flight.

On success: shows “Rooms saved” message.

On failure: shows a simple error message.

On next load / refresh, load_config hydrates from Supabase, and the Room list should match previous saved state.

7. Validation Rules

Required validation (MVP):

code

Cannot be empty at save time.

Must be unique among rooms[].

If empty on create, auto-generate using Section 3.

name

Cannot be empty.

capacityMin

Must be integer >= 1.

capacityMax

Must be integer >= capacityMin.

Error handling:

Use plain, inline text messages (no libraries).

Do not block other tabs.

Keep messages simple and understandable by non-technical users.

8. Out of Scope (for this Spoke / Spec)

The following items are explicitly out of scope for this Room Setup MVP spec, but must be designed so they can be added safely later:

Blackout / Availability integration

No reading/writing blackout_periods here.

No calls to the availability functions.

A future Availability Spoke will:

Define how rooms[] is consumed by availability functions.

Implement the blackout UI + persistence.

Pricing engine

No base rate calculations.

No link to catalog / add-ons pricing.

Layouts, F&B, AV mapping

The rooms[] shape in this spec does not yet include layout or add-on linkage.

That linkage will be handled by other Spokes using existing Supabase tables (rooms, room_catalog_map, etc.) or additional config fields.

9. Acceptance Criteria (Done = Done)

This Room Setup spec is considered implemented when:

Data model

Supabase admin_ui_config.data.rooms contains an array of room objects.

Each object follows the shape in Section 2.1.

Admin UI – Rooms → Room Setup

Rooms are loaded from data.rooms (or [] if missing).

The admin can:

Create a new room (with auto-generated code if left blank).

Edit an existing room (including code, with uniqueness validation).

Delete a room.

Auto-code rules applied

New rooms with blank Code receive a generated RM-XXX value.

Codes are unique and sequential as per Section 3.

The admin can still type their own codes, provided they are unique.

Persistence

Clicking Save in Room Setup causes a POST to /.netlify/functions/save_config with body:

{ "rooms": [ /* full rooms[] */ ] }


After reload:

load_config hydrates the same rooms.

Rooms list appears exactly as before (no regression).

No regressions

Venue + BookingPolicy config continue to save and load correctly.

Add-Ons tab under Rooms continues to work exactly as before.

No console errors or React warnings introduced.

No changes to Netlify Functions or Supabase schema caused by this work.

10. Versioning Notes

Version: RoomSetup_SPEC_MVP v1.1 (HUB#6 → HUB#7)

Changes from earlier draft:

Added explicit auto-code rules (RM-XXX pattern).

Clarified ownership of rooms state in Rooms/index.jsx.

Clarified that blackout integration is out-of-scope but expected in a future Availability Spoke.
