# 002 — Supabase UI Seed Instructions

## Import order (must follow)
1. `vat` ← `/data/db/VAT.csv`
2. `catalog` ← `/data/db/Catalog.csv`
3. `rooms` ← `/data/db/Rooms.csv`
4. `durations` ← `/data/db/Durations.csv`
5. `room_catalog_map` ← `/data/db/RoomCatalogMap.csv`

## One-time setup
- Supabase → **SQL Editor** → run `001_schema.sql`.
- Supabase → **Table Editor** → open each table → **Import data** (UTF-8, comma).

## Column mapping (camelCase → snake_case)

**Catalog.csv → catalog**
id→id, name→name, heading→heading, vatCategory→vat_category,
ratePerHour→rate_per_hour, rateHalfDay→rate_half_day, rateDay→rate_day,
ratePerPerson→rate_per_person, ratePerBooking→rate_per_booking,
includedDefault→included_default, includedCondition→included_condition, notes→notes

**Rooms.csv → rooms**
id, venueId→venue_id, name, code (unique), description, sizeSqm→size_sqm,
heightM→height_m, accessible, featuresJSON→features_json (JSON),
imagesJSON→images_json (JSON), layoutsJSON→layouts_json (JSON),
baseRateHour→base_rate_hour, baseRateHalfDay→base_rate_half_day, baseRateDay→base_rate_day

**Durations.csv → durations**
code (PK), label, hours

**RoomCatalogMap.csv → room_catalog_map**
id, roomId→room_id, catalogItemId→catalog_item_id, visibility, basisOverride→basis_override,
rateOverridesJSON→rate_overrides_json (JSON), minQty→min_qty, maxQty→max_qty,
defaultQty→default_qty, autoSuggest→auto_suggest

**VAT.csv → vat**
id, name, ratePercent→rate_percent, appliesToJSON→applies_to_json (JSON)

## JSON quoting (CSV)
- Object: `"{""Per Booking"":90}"`
- Array: `"[""F&B"",""AV""]"`

After import, run the SQL in `VALIDATION.md` and paste your counts.
