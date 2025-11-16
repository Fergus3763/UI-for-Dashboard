# FIX_REPOSITORY.md  
Central repository of issues, improvements, architectural tasks, and future fixes.  
Maintained by HUB#6.

---

## 1. Purpose
This file stores **all** issues and deferred fixes that should NOT be solved immediately but must NOT be forgotten.

A separate quick-reference file contains only the headlines.  
This file contains the **full detail** and reasoning.

---

## 2. Current Known Issues / Deferred Fixes  
(Updated by HUB#6 — includes Add-ons relocation + integration tasks)

---

### Admin UI – Add-ons (Global)
- **Move Global Add-ons out of the Venue sub-tab and into its own top-level tab.**  
  Add-ons are global, cross-category items and should not live under Venue.
- **Ensure the new top-level Add-ons tab appears alongside:**  
  Venue, Rooms, F&B, AV, Labour, Other.
- **Refactor routing/navigation** if needed to properly separate Add-ons.
- **Maintain existing functionality exactly during the move** (master list, create/edit/deactivate, save/hydration).
- Verify AddOnsTab.jsx continues to receive:  
  - `addOns`  
  - `setAddOns`  
  - `onSave`
- Add top-of-page description text (simple plain-English introduction).
- Optional UI polish: Category colour badges, consistent spacing.

---

### Admin UI – Category Tabs (Rooms, F&B, AV, Labour, Other)
Each category tab must be extended with a **filtered Add-ons panel**:
- Shows only items where `addOn.category === "<category>"`.
- Must be **read-only for MVP**.
- Includes a “Manage Add-ons” button linking to the Master Add-ons page.
- Deactivated Add-ons (`active:false`) must be hidden.
- Styling should match existing Venue Setup panel patterns.

Future (not MVP):
- Inline editor.
- Sorting / grouping.
- Category-specific suggestions.

---

### Admin UI – Venue Tab
- Remove Add-ons from inside the Venue navigation to avoid confusion.
- Confirm tab-switching/routing behaviour remains unaffected.

---

### Persistence / Load–Save Behaviour
- After relocation, re-verify:
  - `addOns` hydrates correctly from load_config.
  - `addOns` saves correctly via save_config.
  - Other config shapes (`venue`, `bookingPolicy`, `rooms`, etc.) are untouched.
- Add fallback guard:  
  ```
  if (!Array.isArray(data.addOns)) addOns = [];
  ```

---

### Visual / UX Enhancements (Add-ons)
- Improve table spacing and responsiveness.
- Replace HTML table with shared admin table component (if exists).
- Add clearer “Included” badge (green label).
- Display human-readable pricing labels (“Per event”, “Per hour”).
- Optional: category icons.

---

### Booker UI – Add-ons Behaviour (Deferred)
- Display relevant Add-ons in Booker flow.
- Include “Included” items visibly.
- Compute add-on pricing using spec formulas.
- Hide inactive items.
- Add pricing breakdown to the summary panel.

---

### Coming Soon / Upsell Preview (From AddOns_Upsell_Preview.md)
- Verify “Coming Soon” placeholders appear correctly in Booker Results page.
- Confirm admin-facing placeholder (Save as Last Minute Add-on) displays correctly.
- Future fields (`isPopular`, `isLastMinute`) must remain unused for now.

---

### Documentation Tasks
- Update /handover/ROADMAP_MVP.md to reflect new Add-ons tab.
- Add reference to Add-ons in VenueSetup_Enhancements.md.
- Consider creating /handover/CONFIG_EXAMPLES.md for sample JSON structures.

