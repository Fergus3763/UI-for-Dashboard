🗂️ Data Model — Meeting Room SaaS (Stage 1 MVP)

This folder holds the core data tables used by the WorXInn Meeting Room SaaS MVP.
These CSVs are the single source of truth for room pricing, add-ons, VAT, and duration rules — powering the automated
Search → Customise → Pay → Arrive flow.

📁 Folder contents
File	Purpose
Catalog.csv	Master list of all chargeable or included items (F&B, AV, Labour, 3rd Party, Add-Ons).
Rooms.csv	Room definitions per venue with physical data (size, accessibility, layouts, base rates).
RoomCatalogMap.csv	Connects each room to its catalog items, defining visibility, pricing overrides, and quantities.
VAT.csv	Venue-defined VAT bands and rates. Items reference VAT by name, never hard-coded.
Durations.csv	Defines default block durations (Hour = 1 hr, Half-Day = 4 hr, Day = 8 hr).
Assumptions_and_Ambiguities_Report.txt	Notes on field renames, blanks, cross-reference checks, and open items.
🧮 Data model overview

Catalog
→ defines every sellable or included item.
Each has optional rates (Per Person, Per Hour, Half-Day, Day, Per Booking) and a VAT category.

Rooms
→ define the base rentable spaces with physical and pricing data.

RoomCatalogMap
→ acts as a link table connecting rooms to catalog items.
It controls which items are included, optional, or hidden, and stores per-room overrides.

VAT
→ defines percentage rates and the headings (e.g., F&B, AV) that each band can apply to.
Venues can rename or add bands; rates are never hard-coded.

Durations
→ provides reference hours for pricing calculations.

⚙️ Business rules (summary)

Charge basis → determines which rate applies:
Per Booking, Per Person, Per Hour, Half-Day, or Day.

Included vs Optional →

Included items price at €0 when inclusion conditions (like > 200 pax) are met.

Optional items can be selected by the booker and add to the total.

Base room rate → drawn from Rooms.csv using Durations.csv hours.
Additional items from the map are added according to their charge basis.

VAT → applied line-by-line from each item’s vatCategory rate.

🔍 Integrity checks (last run)

All CSV headers match the DataDictionary from Meeting_Rooms_Glossary_and_Dictionary.xlsx.

Rooms.code values are unique.

RoomCatalogMap foreign keys reference valid roomId and catalogItemId.

Numeric fields validated; blanks left where unknown.

VAT categories cross-referenced successfully.

🧾 Example price flow (simplified)
1. User selects “Conference Room A” for a Half-Day (4 hours)
2. Base rate pulled from Rooms.csv → baseRateHalfDay
3. Linked items from RoomCatalogMap loaded:
   - Included: Bottled Water (no cost if ≤ 200 pax)
   - Optional: Projector (€ 90 per booking)
   - Optional: Catering Lunch (€ 25 per person)
4. System evaluates conditions and quantities:
   total = base + selected items × quantities + VAT

🧱 Versioning & updates

Keep this folder UTF-8 and comma-delimited.

When adding new fields, append them (do not reorder existing).

For extra/source-only columns, prefix them with x_.

Commit changes with a short, descriptive message (e.g.,
“Update VAT.csv — added Reduced band”).

🪶 Credits

Created by the WorXInn Calculus / Data Normalization stream
to support the MVP UI and API integration.
Plain-English documentation maintained by Fergus (HUB #2).
