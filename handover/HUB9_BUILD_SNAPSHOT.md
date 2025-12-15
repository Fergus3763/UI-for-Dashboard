# HUB #9 — Build Snapshot

## Purpose
This is a simple “known working state” record so the next Hub can quickly confirm the system is alive and correct.

---

## Snapshot Timestamp (Dublin time)
Date: ______________________  
Time: ______________________  

(Write the date/time when you last confirmed the build was working.)

---

## Deployment Location
Netlify Site / Project: ______________________  
Production URL: ______________________  

---

## Confirmed Working Pages (checklist)

### Navigation (dropdowns)
- [ ] Venue dropdown opens and closes properly
- [ ] Rooms dropdown opens and closes properly
- [ ] Dropdown closes when you click outside
- [ ] Dropdown closes after selecting an item

### Venue deep links
- [ ] `/admin/venue?view=venue` opens Venue tab
- [ ] `/admin/venue?view=terms` opens Booking Policy / Terms tab

### Rooms deep links
- [ ] `/admin/rooms?view=room-setup` opens Room Setup
- [ ] `/admin/rooms?view=addons-create` opens Add-Ons → Create/Edit
- [ ] `/admin/rooms?view=addons-catalogue` opens Add-Ons → Catalogue & Assignment

### Room Overview
- [ ] `/admin/room-overview` loads successfully
- [ ] Shows room cards and add-ons correctly

### Simulation / Modelling
- [ ] `/admin/simulation` loads successfully
- [ ] Uses GET `/.netlify/functions/load_config` only
- [ ] Hour-block controls are present (start time on the hour, duration in whole hours)
- [ ] Price changes when duration changes
- [ ] Optional add-ons change Provisional / Final totals

### Booker Preview
- [ ] `/admin/booker-preview` loads successfully
- [ ] Uses GET `/.netlify/functions/load_config` only
- [ ] Mirrors Simulation pricing behaviour
- [ ] Inclusive add-on values are not shown (names may be shown)
- [ ] Optional add-ons show as priced line items
- [ ] Final price equals Provisional price (MVP rule)

---

## Known Assumptions (MVP)
- Hour blocks only
- Duration capped (current UI cap: 12 hours)
- No availability enforcement
- No booking / reservation / payment logic
- Simulator and Booker Preview are read-only and do not save scenarios

---

## Notes (optional)
Add anything that would help the next Hub, for example:
- Any odd behaviour you noticed
- Any non-critical UI issue to polish later
- Any temporary workaround you had to use

Notes:
______________________________________________________________________
______________________________________________________________________
______________________________________________________________________
