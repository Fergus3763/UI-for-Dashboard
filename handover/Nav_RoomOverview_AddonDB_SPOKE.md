# Admin UI Navigation – Room Overview & Addon DB (SPOKE Handover)

**Owner:** Fergus / HUB#6  
**Scope for this Spoke:**  
1. Remove obsolete top-level tabs: **F&B**, **AV**, **Labour**.  
2. Add two new top-level tabs: **Room Overview** and **Addon DB**.  
3. Create two simple React pages (placeholders) for those new tabs, with headings and short explainer text.  
4. Do **not** change any save/load logic, Supabase calls, or config structure.

The goal is _purely navigation + placeholder screens_. No data wiring.

---

## 1. Context (plain English)

- The Admin UI currently has top-level navigation links: `Venue`, `Rooms`, `F&B`, `AV`, `Labour`.  
- Configuration for F&B, AV, Labour, Services & Amenities and Other is now handled through a **single Add-Ons editor** under:  
  **Rooms → Add-Ons tab**.  
- Therefore, the top-level tabs **F&B**, **AV**, **Labour** are now **obsolete** and should be **removed**, not restored.

New high-level views we want:

1. **Room Overview**  
   - A future “matrix” style view to compare rooms side-by-side (what’s included, add-ons, rules etc.).  
   - For this Spoke: **placeholder page only**.

2. **Addon DB**  
   - A future global Add-On inventory, showing all add-ons and where they are applied.  
   - For this Spoke: **placeholder page only**.

---

## 2. Hard constraints

You **must not**:

- Add or modify any Netlify Functions.  
- Add or modify any Supabase tables or config structure.  
- Touch `load_config.mjs` or `save_config.mjs`.  
- Change Venue or Rooms behaviour beyond the nav items themselves.  
- Introduce any new save/load logic on the new pages.

You **may**:

- Create new React page components for navigation targets.  
- Update the main Admin UI navigation component to point to these new pages.  
- Add simple, static copy and headings.

---

## 3. Files and discovery rules

Because file structure may evolve, you must **discover** the correct files instead of asking Fergus.

### 3.1 Navigation container

1. Use repo search to locate the main Admin UI nav, for example by searching for:
   - `"Venue"` (the tab label), or
   - `"Rooms"` (top nav), or
   - `"Venue setup"` heading.
2. Once found, identify:
   - The React component that renders the top-level tabs (Venue / Rooms / F&B / AV / Labour).  
   - Its exact file path under `admin-ui/src/...`.

You must **write down in code comments** at the top of that file:

```js
// NOTE (Nav Spoke): Top-level Admin nav edited by AddOns/Nav SPOKE.
// Tabs: Venue, Rooms, Room Overview, Addon DB.
// Obsolete tabs F&B, AV, Labour removed (see handover/Nav_RoomOverview_AddonDB_SPOKE.md).
3.2 New pages
You should create two new files:

admin-ui/src/pages/RoomOverview/index.jsx

admin-ui/src/pages/AddonDB/index.jsx

If the repo uses a different convention (e.g. RoomOverview.jsx under pages/), you may adapt, but keep it consistent and document the final paths in a comment in the nav component.

4. Required behaviour (plain English)
4.1 Top-level navigation
After your change, the top nav should show exactly:

Venue

Rooms

Room Overview

Addon DB

F&B, AV, Labour must be removed.

Click behaviour:

Venue → existing Venue Setup route (unchanged).

Rooms → existing Rooms route (unchanged: with Room Setup + Add-Ons sub tabs).

Room Overview → new placeholder page.

Addon DB → new placeholder page.

You must not change the URLs/routes for Venue or Rooms, only add the two new routes.

4.2 Room Overview page content
File: admin-ui/src/pages/RoomOverview/index.jsx (or consistent equivalent).

Requirements:

Default export a React component (function).

Use plain JSX, no external state.

Content:

<h1>Room Overview</h1>

2–3 short paragraphs explaining the future intent, for example:

This page will become a side-by-side room comparison view.

It will show which add-ons and inclusions apply per room.

It will help hotel admins spot inconsistencies (e.g. water included in some rooms but not others).

No buttons, no forms, no API calls.

4.3 Addon DB page content
File: admin-ui/src/pages/AddonDB/index.jsx (or consistent equivalent).

Requirements:

Default export a React component (function).

Use plain JSX, no external state.

Content:

<h1>Addon DB</h1>

2–3 short paragraphs explaining the future intent, for example:

This page will become the global Add-On catalogue.

It will list all add-ons created under Rooms → Add-Ons.

It will show where each add-on is used and relevant rules/thresholds.

No buttons, no forms, no API calls.

5. Implementation rules
Code style: match existing Admin UI (simple function components, no TypeScript).

Imports: only React and any local layout components necessary for consistency (if used elsewhere).

Routing: follow whatever routing/layout pattern is already in use (e.g. updating a central routes list or nav component), but:

Do not introduce a new routing library.

Do not change existing paths.

6. Acceptance criteria
This Spoke is complete when:

Top nav shows only: Venue, Rooms, Room Overview, Addon DB.

Clicking each tab navigates to the correct screen.

Venue and Rooms behaviour is unchanged.

Room Overview page shows heading + static explanatory text.

Addon DB page shows heading + static explanatory text.

No new API calls or Supabase interactions have been added.

No console errors or React warnings are introduced.

yaml
Copy code

---

## Prompt B — Rebuild / Reactivate **Room Setup** (under Rooms)

You can save this as  
`/handover/RoomSetup_SPEC_MVP.md`  
and paste it as the **first message** to the Room-Setup Spoke.

```markdown
# Rooms – Room Setup (MVP Specification, SPOKE Handover)

**File:** `/handover/RoomSetup_SPEC_MVP.md`  
**Owner:** HUB#6  
**Scope for this Spoke:**  
Implement the **Room Setup** experience under the existing **Rooms → Room Setup** tab, using the shared config pattern (Supabase JSON via Netlify Functions).  

This Spoke focuses only on **room configuration**, not pricing engine or Booker UI.

---

## 1. Business context (plain English)

- The Admin UI has a **Rooms** section with two sub tabs:
  - `Room Setup` (currently just placeholder text)
  - `Add-Ons` (already implemented by a previous Spoke)
- Config for Add-Ons is stored in Supabase under `data.addOns`.

We now need a minimal but real **Room Setup** so a hotel can:

- Define rooms (e.g. Boardroom, Suite 1, Meeting Room A).  
- Capture basic properties per room:
  - Name
  - Capacity (min / max attendees)
  - Description
  - Active flag
- Store this data in Supabase under the existing config JSON (no new tables).

This prepares the way for the Booker to query available rooms later.

---

## 2. Data model – where rooms are stored

Use the existing config structure:

- Table: `public.admin_ui_config`  
- Row: `id = 'default'`  
- Column: `data` (JSONB)

Inside `data`, add a top-level `rooms` array:

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
2.1 Room object shape (MVP)
Each object in data.rooms[] must follow this structure:

jsonc
Copy code
{
  "id": "string",          // unique, stable identifier for the room
  "code": "string",        // short code, e.g. "R-001" (required)
  "name": "string",        // human-readable name (required)
  "description": "string", // longer free-text description (optional)

  "capacityMin": 1,        // minimum attendees (integer >= 1)
  "capacityMax": 20,       // maximum attendees (integer >= capacityMin)

  "active": true           // if false, hidden from Booker but kept in config
}
Notes:

id can be a UUID or any unique string; must not change once created.

code must be present and unique within the rooms array.

capacityMin and capacityMax are whole numbers; basic validation is required in the UI.

active = false means:

The room is still visible in Admin.

The room will be ignored by the Booker later.

You should write light-weight helpers to create new room objects with sensible defaults.

3. Existing plumbing you must use
You must wire Room Setup through the existing save/load pipeline:

/.netlify/functions/load_config (GET)

/.netlify/functions/save_config (POST)

The pattern has been established by earlier work:

load_config returns JSON:
{ ok: true, id: "default", data: { ... } }

save_config merges the POST body into data (do not break this).

3.1 Required load behaviour
When Rooms → Room Setup loads:

Call /.netlify/functions/load_config (GET).

Extract json.data.

If data.rooms exists and is an array → use that.

If not present → start with [].

Store in React state (rooms, setRooms or similar).

3.2 Required save behaviour
When the user clicks Save in the Room Setup tab:

POST to /.netlify/functions/save_config with body:

jsonc
Copy code
{
  "rooms": [ /* full, current rooms array */ ]
}
Do not remove or rename other keys (venue, bookingPolicy, addOns, etc.).
This is handled by save_config; you must not change that function in this Spoke.

4. Files and ownership
This Spoke must operate under Rooms, not Venue.

You must discover the existing Rooms container using repo search.

4.1 Known file
There is already a Rooms page at:

admin-ui/src/pages/Dashboard/Rooms/index.jsx

This file:

Provides top-level Rooms layout.

Renders at least two sub tabs: Room Setup and Add-Ons.

Already passes props to AddOnsTab for the Add-Ons editor.

You must:

Keep this structure.

Implement Room Setup as a child component rendered under the Room Setup tab.

4.2 Room Setup component file
Create (or reuse, if it already exists) a dedicated component file for Room Setup, e.g.:

admin-ui/src/pages/Dashboard/Rooms/RoomSetupTab.jsx

Behaviour:

Receives rooms, setRooms, and onSave as props from Rooms/index.jsx.

Contains all JSX and logic for listing, editing and creating rooms.

Does not make direct API calls (all save/load owned by Rooms/index.jsx).

If you choose a different file name/path, document it in a top-of-file comment.

5. UI behaviour (plain English)
5.1 Layout
Under Rooms:

Two buttons/tabs: Room Setup (active by default) and Add-Ons.

Clicking Room Setup shows the new configuration UI.

Clicking Add-Ons continues to show the existing Add-Ons UI (unchanged).

5.2 Room list
Room Setup tab should show:

A short introductory paragraph explaining that this config controls meeting rooms for the Booker.

A table or list of existing rooms with columns, for example:

Code

Name

Capacity (Min–Max)

Active? (Yes/No)

Edit/Delete actions

If there are no rooms:

Show a friendly “No rooms defined yet. Click ‘New room’ to add your first room.” message.

5.3 Create / edit room form
Below the list (or in a simple panel) provide a form with fields:

Code (text, required)

Name (text, required)

Description (textarea, optional)

Capacity – Min (number input, required)

Capacity – Max (number input, required)

Active (checkbox)

You may:

Reuse the same form for both “New room” and “Edit room”, with a simple state flag.

Use basic inline validation (plain text error messages, no libraries).

Validation rules (MVP):

Code must not be empty.

Name must not be empty.

CapacityMin >= 1.

CapacityMax >= CapacityMin.

If validation fails, do not call onSave; show simple error messages.

5.4 Save behaviour
Room Setup must have a clear Save button.

When clicked:

Build the complete rooms array from current state (including the edited/new room).

Call the parent onSave(updatedRooms) (passed from Rooms/index.jsx).

The parent handler will:

POST { rooms: updatedRooms } to save_config.

Handle loading/success/error messages.

You should also:

Display a simple “Saving…” state while the save is in progress.

Show “Rooms saved” or error text based on the response.

6. Implementation rules
No backend changes:

Do not edit Netlify Functions or Supabase schema.

No routing changes:

Keep Rooms route path as-is.

State ownership:

Rooms/index.jsx owns the rooms state and all API calls.

RoomSetupTab is presentational + local form state only.

Code style:

Match existing Admin UI (function components, hooks, simple CSS/inline styles).

7. Acceptance criteria
This Spoke is complete when:

Under Rooms → Room Setup:

Rooms are loaded from data.rooms (or [] if missing).

The screen shows a list of rooms (or a friendly “no rooms yet” message).

The admin can create a new room, edit an existing room, and delete a room from the list.

On save:

A POST to /.netlify/functions/save_config is made with body { rooms: [...] }.

The Supabase row is updated (confirmed by reloading the page and seeing the same data).

Existing keys (venue, bookingPolicy, addOns, etc.) remain intact.

The Add-Ons tab under Rooms continues to work exactly as before.

No console errors or React warnings are introduced.

No new dependencies (libraries) are added.

End of RoomSetup_SPEC_MVP.md.
