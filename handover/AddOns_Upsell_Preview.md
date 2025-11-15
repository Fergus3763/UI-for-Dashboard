# Add-Ons – Upsell Preview (Coming Soon UI)
**Location:** `/handover/AddOns_Upsell_Preview.md`  
**Purpose:** Define non-functional “Coming Soon” elements that show future upsell logic to hotels, without adding complexity to the current MVP.

---

## 1. Overview

This document describes **visual-only** UI elements related to “Last Minute Add-Ons” and upsell opportunities.

They are:

- Shown in demos to hotels to illustrate future revenue features.  
- **Not functional** in the MVP.  
- Designed so they can later be wired to real logic without redesign.

There are two preview locations:

1. Booker — Results page (guest-facing, viewed in demo by hotels only).  
2. Admin UI — Add-ons tab (hotel-facing configuration).

---

## 2. Booker – Results Page Preview

### 2.1 Purpose

Show hotels where “Last Minute Add-Ons” will appear in the Booker, **without** implementing any logic yet.

This is purely a visual indicator of:

- Future upsell opportunities.  
- The idea that guests will be prompted with quick add-on choices during the booking flow.

### 2.2 Placement

- Page: **Booker Results page** (where rooms and main configuration are shown).  
- Position: Near the add-on choices area or immediately below the main room/price results.

### 2.3 UI Description (MVP, non-functional)

- A small section with the title:

  **`LAST MINUTE ADD-ONS – Coming Soon`**

- Under the title, display **6 small boxes** arranged in a simple grid or row.

  Each box:

  - Shows only the word **“ADD”**.  
  - The “ADD” text appears greyed out or visibly disabled.  
  - No hover state, no click action, no links.

- The whole section is **non-interactive**:
  - Clicking anywhere does nothing.
  - No tooltips, no hidden panels, no side-effects.

### 2.4 Behaviour (MVP)

- No data load.  
- No dependency on real add-ons.  
- No pricing impact.  
- If JavaScript fails, the section can simply not appear (no hard dependency).

### 2.5 Future Behaviour (Post-MVP / v1.2+ – for reference only)

In a later version, this same location can be used to:

- Show **real, popular add-ons** (e.g. Tea/Coffee, Water, Pastries).  
- Allow guests to click “ADD” to include those items in their booking.  
- Only show add-ons that are:
  - Marked as “Last Minute” or “Popular” in the Admin UI.  
  - Not already chosen elsewhere in the booking.

For now, this behaviour is **not implemented**.  
This section is only a **visual placeholder**.

---

## 3. Admin UI – Add-ons Tab Preview

### 3.1 Purpose

Inform hotel admins that a future feature, **“Save As Last Minute ADD-ON”**, will be added to the Add-ons section, and that it is not yet active.

This sets expectations and aligns the Admin UI with the Booker-side preview.

### 3.2 Placement

- Page: **Admin UI – Add-ons tab**.  
- Position: **Top of the page**, above the add-on creation / editing fields.

### 3.3 UI Description (MVP, non-functional)

- A single, screen-wide text area or banner with the following message:

  > **“The Save As Last Minute ADD-ON button in this section is coming soon and non-responsive for now.”**

- Styling can be simple:
  - Full width.  
  - Slightly different background (optional).  
  - No border or subtle border.  
  - It must be clearly readable and visible.

### 3.4 Behaviour (MVP)

- This is **read-only informational text**.  
- There is **no actual “Save As Last Minute ADD-ON” button** in the MVP.  
- No interactions, no pop-ups, no extra pages.

### 3.5 Future Behaviour (Post-MVP – for reference only)

Later, this tab will likely include:

- A real **“Save As Last Minute ADD-ON”** checkbox or button on each add-on.  
- A flag in the data model (for example: `isLastMinute` or `isPopular`).  
- Logic in the Booker to show these flagged add-ons in the “Last Minute Add-Ons” section.

For now, only the **informational text** exists.  
No new fields or flags are required for MVP.

---

## 4. Implementation Notes (for future SPOKE)

- These elements can be implemented as a **small UI-only task**:
  - Booker: add a static, non-functional “Last Minute Add-Ons – Coming Soon” block with 6 disabled “ADD” boxes.  
  - Admin UI Add-ons tab: add a static banner with the provided text.

- No changes required to:
  - Netlify Functions  
  - Supabase schema  
  - pricing logic  
  - existing configuration data

- When upsell logic is ready in a later phase:
  - Re-use the same areas (Booker section + Admin banner).  
  - Simply replace static placeholder content with real data and actions.

---

## 5. Status

- **Current status:** Planned (spec only, no implementation in MVP).  
- **Next step:** Assign a small SPOKE task to add the UI placeholders once core Booker and Admin work is stable.
