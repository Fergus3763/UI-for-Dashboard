# FIX_REPOSITORY.md  
Central backlog of fixes, improvements, refactors, and “return later” tasks  
Owner: HUB#6  
Location: /handover/FIX_REPOSITORY.md

---

## 1. Purpose
This file tracks **known issues**, **future improvements**, and **non-urgent work**  
across the Admin UI, Booker UI, and Netlify Functions.

It prevents losing tasks during HUB/SPOKE handovers and protects the roadmap  
from forgotten context.

- If something is too large for the current sprint → record it here.  
- If a bug is noticed but not critical → record it here.  
- If an architectural improvement is spotted → record it here.  

This is a **living document**.

---

## 2. Current Known Issues / Deferred Fixes

### Admin UI – Venue Setup
- Move Add-ons Master UI from Venue sub-tab → top-level tab (**now planned**).
- Add-ons filtered panels in category tabs (Rooms, F&B, AV, Labour, Other) — *planned for later*.
- Improve alignment and spacing in Booking Policy tab.
- Review form components to use consistent inputs across system.

### Admin UI – Global Add-ons
- Add-ons should appear as a top-level item in the VenueSetup tab menu.
- Planned: ability to duplicate add-ons (template copy feature).
- Planned: support quantity for PER_UNIT pricing (Phase 2).
- Need validation errors for missing name, negative price, invalid category.

### Booker UI
- Add-ons integration into price breakdown (**Phase 2**).
- “Last Minute Add-ons” upsell placeholders working (from `/handover/AddOns_Upsell_Preview.md`).
- Improve display of Included items (icon + tooltip).

### Persistence / API
- Standardise config merge rules across save_config.
- Consider adding schema validation to reject malformed addOns objects.
- Introduce type-checking layer for future complex Rules engines.

---

## 3. Future Enhancements (Not MVP)

### Add-ons Phase 2
- Add-ons rules engine (conditional logic).
- “Popular Add-ons” scoring.
- End-of-flow upsell (“Before you book, would you like to add…”).
- Multi-quantity support for PER_UNIT.

### Room Booker – Roadmap
- Multi-day bookings.
- Layout configurator.
- Dynamic pricing engine.
- VAT calculation by category.

### Admin UI – General
- Convert all tabs to use a shared `<AdminFormSection>` component.
- Light/dark mode (optional).
- Keyboard shortcuts for Save/Undo/Redo.

---

## 4. How to Add New Items  
When a bug/improvement is found:

1. Add a new bullet under the correct section.  
2. Write a short, clear description.  
3. Add `(origin: HUB#6)`, `(origin: SPOKE)`, or `(origin: OWNER)` if useful.  
4. No need for dates — Git tracks history.

Example:

- Dropdown flickers when switching tabs (origin: HUB#6).

---

## 5. When to Clear Items  
Only remove an item when:

- It is completed AND  
- It appears in commit history with a clear commit message.

Example acceptable commit message:

```
fix(addons): correct category filtering in Rooms panel
```

---

## 6. Ownership  
HUB#6 maintains accuracy of this document.  
SPOKES rely on it during implementation.  
The OWNER uses it to track progress between phases.

---

End of File
