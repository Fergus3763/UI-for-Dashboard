NEXT TASK: Add Booker View as an Admin Dashboard Tab

(For HUB #8 or next available HUB)

Purpose

Expose the existing Booker View UI (booker-view.html) as a visible, first-class page inside the Admin Dashboard so hotel trial users can preview how rooms appear to bookers.

Requirements

Create a new top-level tab

Label: “Booker View”

Link target: /admin/booker-view

Must appear in the same navigation bar as:

Venue

Rooms

Room Overview

Add-On DB

Route definition

Add a React route in admin-ui/src/App.jsx:

<Route
  path="/admin/booker-view"
  element={
    <iframe
      src="/booker-view.html"
      style={{ width: "100%", height: "90vh", border: "none" }}
    />
  }
/>


This embeds booker-view.html inside the admin UI using an inline iframe.

Must NOT rewrite booker-view.html into React — it remains a static HTML file.

Do NOT:

Modify the Booker View logic

Modify the Netlify functions

Move the HTML out of admin-ui/public/booker-view.html

Introduce new build steps

Success Criteria

When clicking Booker View in the admin navigation, the hotel admin sees the exact Booker View UI rendered full-width inside the dashboard.

The page loads using:

https://<site>.netlify.app/booker-view.html


No console errors.

No interference with Room Setup, Add-Ons, Venue, or Overview.

Why iframe?

Zero risk to existing React routing

Booker View remains standalone

Very fast to implement

Perfect for MVP demos

Future HUBs can replace iframe with React integration if needed
### NEXT TASK – Hook Booker View into Admin navigation (Hub #8)

- Add a new top-level navigation link in the Admin UI:
  - Label: **Booker Preview**
  - Path: `/admin/booker-view`
- Create a small React wrapper page at `admin-ui/src/pages/Dashboard/BookerPreview/index.jsx` that:
  - Renders an `<iframe>` or simple redirect to `/booker-view.html`
  - Is read-only and clearly labelled as a demo/preview (not live production Booker)
- Do **not** change the existing `booker-view.html` logic or the availability endpoint.
- Confirm that `/admin/booker-view` loads correctly and is reachable from the main Admin nav.
### Priority Work for Hub #8

1. **Room Setup persistence stabilisation**
   - Fix the remaining “Save All Rooms” issues so that:
     - Layout capacities
     - Base pricing (per-person / per-room / rule)
     - Buffers
     - Included / optional add-ons
   - all save reliably and re-load correctly, and appear in Room Overview.

2. **Room Overview alignment**
   - Ensure Room Overview reads the same room shape that Room Setup writes.
   - Verify new rooms and edits appear correctly (layouts, pricing, buffers, add-ons).

3. **Per-room availability calendar (Availability Spoke v2)**
   - Reintroduce a **visual availability view** per room (calendar or structured list) driven by:
     - `blackout_periods` (admin blackouts)
     - bookings (mock or minimal real data)
   - Keep it read-only at first; editing blackouts can remain in Room Setup.

4. **Booker Preview integration**
   - Add the new **Booker Preview** tab in the Admin nav pointing to the existing `booker-view.html`.

5. **Documentation and Quick-Start updates**
   - Update `HUB8_QUICK_START.md`, `STATUS_SUMMARY.md`, and `HUB_CONTEXT.md` to reflect:
     - Final room schema
     - How Room Setup, Room Overview, Booker View, and availability endpoints connect.
