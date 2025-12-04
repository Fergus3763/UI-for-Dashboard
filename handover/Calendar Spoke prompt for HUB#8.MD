Availability / Calendar Spoke — HUB #8
Role:
You are a Spoke working under HUB #8.
Your single task is to (re)introduce a simple availability / blackout calendar view per room for the Admin UI.
This is an admin-only, internal tool. It helps hotel staff see at a glance when a room is blocked or available.

1. Scope (Plain English)
You must:


Add a calendar-style view under the existing Rooms → Room Setup screen that:


Shows blackout periods per room.


Optionally shows bookings (if a clean data source exists; otherwise this can be skipped or mocked).


Lets the admin visually see which days / times are blocked for the currently selected room.




Re-use the existing blackouts pipeline:


Do not invent new APIs or tables.


Use the existing /.netlify/functions/blackout_periods endpoint as the source of truth.


Room identification must continue to use the existing room.code / roomId logic already in place.




Keep this read-only for bookings:


You may allow creating new blackouts via the calendar (if it’s simple and safe), but:


You must NOT implement any booking engine.




The goal is visual clarity, not a complex scheduling system.

2. Hard Constraints
You must NOT:


Change any Netlify functions:


No edits to blackout_periods.mjs


No edits to availability.mjs


No new serverless functions.




Change Supabase schema.


Break or rewrite Room Setup logic.


Modify Booker View.


Touch unrelated tabs (Venue, Booker View, Addon DB, etc).


Create new folders without HUB #8’s explicit approval.


You may:


Create 1–2 new React components inside the existing Rooms area.


Add small, local CSS (inline styles or module-level styles).



3. Files and Locations
Assume these existing files:


admin-ui/src/pages/Dashboard/Rooms/index.jsx
→ Top-level Rooms page (tabs, load/save config, etc.).


admin-ui/src/pages/Dashboard/Rooms/RoomSetupTab.jsx
→ Handles Room Setup (current room editor, etc.).


Your Spoke should:


Create a new component file:
admin-ui/src/pages/Dashboard/Rooms/RoomCalendarPanel.jsx

This component will:


Receive the currently selected room as a prop.


Fetch blackouts for that room via /.netlify/functions/blackout_periods?roomId=....


Render a simple calendar / timeline view.




Wire it into Room Setup:


In RoomSetupTab.jsx, render <RoomCalendarPanel room={selectedRoom} /> under the existing Room details (not instead of them).


Do not remove or break any current Room Setup UI.




If HUB #8 tells you the current files differ slightly, follow their exact paths and names.

4. Data Sources
Use only existing endpoints:
4.1 Blackouts


GET /.netlify/functions/blackout_periods?roomId=RM-001


Expected shape (example):
{
  "ok": true,
  "data": [
    {
      "id": "uuid",
      "roomId": "RM-001",
      "startsAt": "2025-10-29T10:00:00Z",
      "endsAt": "2025-10-29T12:00:00Z",
      "title": "Admin Blackout"
    }
  ]
}

You must:


Treat data[] as the only blackout source.


Filter by the current room’s code / id the same way existing blackout code does (HUB #8 will show you the current pattern).


4.2 Bookings (Optional / Display Only)
If HUB #8 provides a clean source (e.g. data.bookings or a bookings function), you may overlay bookings on the same calendar.
If this is not clearly defined, you must:


Skip real bookings.


At most show mocked bookings in a clearly labelled “Demo only” layer.


Do not create any booking tables or functions.

5. UI Behaviour (Simple)
5.1 Calendar Shape
You have flexibility here. The calendar can be:


A month view (one box per day), or


A week strip (7 days), or


A simple list grouped by date that visually highlights busy vs free.


Minimum requirement:


Each blackout appears with:


Start date/time


End date/time


Title (if present)




Days/times with any blackout should clearly look “blocked” vs clear times.


5.2 Interaction
At minimum:


Read-only: admin can see blockers per room.


Optional (if simple and safe):


Click-and-drag or click-to-add a blackout:


This must call the existing blackout_periods POST endpoint.


It must re-use the same roomId logic as existing blackout UI.


After saving, the calendar must refresh from the server.




If adding blackouts via the calendar turns out to be complex or risky, leave it out and keep the calendar strictly read-only.

6. Non-Goals (Out of Scope)
You must not:


Change the way Room Setup saves rooms[] (that’s owned by HUB #8 + Room Setup Spoke).


Implement pricing, quoting, or booking logic.


Implement drag-and-drop rescheduling of existing blackouts.


Add any new global navigation routes.


This Spoke is visual only: “show me when the room is blocked.”

7. Deliverables
You must provide:


Full file:
admin-ui/src/pages/Dashboard/Rooms/RoomCalendarPanel.jsx



Minimal changes to:
admin-ui/src/pages/Dashboard/Rooms/RoomSetupTab.jsx

Only:


Import of RoomCalendarPanel.


A single <RoomCalendarPanel room={selectedRoom} /> in the JSX.




A short note for HUB #8 (2–4 lines) describing:


How you call blackout_periods.


What shape your calendar UI takes (month, week, list).


Any optional interaction you added (or explicitly left out).





8. Working Style (Important)


Avoid long question chains.


If something is unclear but safe to assume, make a reasonable choice, comment it in the code, and move on.


Only ask HUB #8 questions when:


A decision could break data consistency, or


You need explicit approval to add a new file or route beyond what is described above.




Your goal is to deliver a small, clean, self-contained calendar panel that HUB #8 can plug into the broader flow.

