📘 BOOKER VIEW — SPOKE PROMPT (HUB → Spoke Handover)

File: /handover/BOOKER_VIEW_SPOKE_PROMPT.md
Owner: HUB #7 → Booker View Spoke
Scope:
Create the Basic Booker View UI (read-only) that displays all rooms and their attributes, using only Admin-configured data and simple availability logic.
No pricing engine, no payments, no booking creation.

1. 🎯 Purpose (Plain English)

Your job is to build a simple front-facing Booker View page that shows a hotel administrator what a guest would see when browsing available rooms.

This is a demo/MVP, not the final Booker product.

This Booker View MUST:

Read all data from the existing APIs:

/load_config

/availability

NEVER write to the database.

NEVER call blackout APIs directly.

Show rooms in a clean, simple, public-facing style.

This is essentially a public version of "Room Overview", built for guests.

2. 🔒 Hard Constraints (Do NOT break these)
❌ You MUST NOT:

Modify any Netlify Functions.

Modify any Admin UI screens.

Modify Supabase tables or schema.

Add new backend endpoints.

Implement booking or payment logic.

Show blackout periods or bookings on screen.

Show internal/hidden fields.

❌ You MUST NOT block progress by asking micro-questions.

If something is unclear:

Make a safe, reasonable assumption

Proceed

Document the assumption in a single short note

(You may batch questions only when absolutely required.)

❌ No React for this Spoke.

The Booker View is a single HTML page + vanilla JS in /public.

3. 📁 File Location (MANDATORY)

You will create ONE new file:

admin-ui/public/booker-view.html


This file will automatically deploy through Netlify.

It must be fully self-contained:

HTML

Minimal CSS (inline or <style>)

Simple JavaScript (inside <script>)

No bundlers, no imports, no frameworks.

4. 📡 Data Sources — What You Can Use
4.1 /load_config

Returns:

data.rooms

data.addOns

data.venue

data.bookingPolicy

This is your main configuration source.

4.2 /availability?roomId=RM-001&start=…&end=…

Returns:

{ ok: true, available: true/false }


This endpoint already works.

You will use it only for the “date check” feature.

5. 🎨 Page Responsibilities (What You Must Build)

The Booker View page must include:

5.1 Top-level layout

Hotel name (from venue config)

A brief intro text

A date selector:

Start date

End date

A “Check availability” button

When clicked:

Loop through all rooms

Query the /availability endpoint for each

Mark each room as Available or Unavailable

5.2 Room Cards (one per room)

Each card MUST show:

Room Name

Room Code

Description (if present)

Capacity (min → max)

Active / Inactive (inactive rooms are hidden)

Room Images (if any exist)

Room Features list (from featuresJSON)
If no featuresJSON exists, this section hides

Room Layouts
If layoutsJSON exists

Add-Ons

Show add-ons that are:

Included (marked clearly)

Optional (marked clearly)

Pull data from data.addOns

You do NOT need to match admin styling — clean & simple is enough.

5.3 Availability Results

After the user chooses dates and clicks "Check availability":

For each room:

If available → show a green badge: ✓ Available

If unavailable → show a red badge: ✗ Unavailable

No blackout lists.
No booking lists.
No calendars.

Just a simple Yes/No.

6. ⚠️ Behaviour Requirements
6.1 All rooms come from JSON config

Do not hardcode anything.

6.2 Inactive rooms must be hidden completely
6.3 Missing fields

If a field doesn't exist (e.g., no images), hide that section.

6.4 Must handle errors gracefully

If the availability API fails:

Show a generic “Unavailable (API error)” badge

7. 🧪 Manual Testing (Spoke must test before returning work)

The Spoke must confirm:

The page loads at:

https://<site>.netlify.app/booker-view.html


Room list appears (from config)

Add-ons appear correctly

Capacity values correct

Date selector works

Availability checks run for each room

Rooms correctly mark Available / Unavailable

8. 🟩 Completion Criteria

This Spoke is DONE when:

✔ booker-view.html exists and deploys

✔ Rooms load from config

✔ Add-ons display properly

✔ Images/features/layouts display when present

✔ Availability check works

✔ Inactive rooms do not show

✔ No errors in browser console

✔ Code is clean, commented, readable

9. 📬 Communication Rules (Important)

To avoid HUB token wastage:

The Spoke must NOT ask endless minor questions.

Only ask questions if:

A file path is ambiguous

A requirement contradicts another requirement

Unrealistic layout expectations appear

Questions must be BATCHED into one list.

Small UI decisions: use best judgement and proceed.

10. 📌 HUB Message to Spoke

“This is a Basic Booker View.
It is not the final product.
Build a clean, simple, public-facing read-only page that shows our rooms and checks availability.
No backend work, no writing to DB, no booking engine.”

11. ✔ HUB Recommendation (for the Spoke)

Proceed with straightforward implementation:

Simple layout

No frameworks

Clean room cards

One availability call per room

Fail gracefully

No future work should be blocked by this.
