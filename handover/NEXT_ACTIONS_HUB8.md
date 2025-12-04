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
