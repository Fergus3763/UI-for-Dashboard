# Supabase Validation — MVP Seed

This section records the official results of the database validation for the MVP seed. Paste-only instructions below ensure repeatability and clarity.
## Row Counts (paste result table below)

-- Run in Supabase SQL editor:
select 'vat' as table_name, count(*) as row_count from vat
union all select 'catalog', count(*) from catalog
union all select 'rooms', count(*) from rooms
union all select 'durations', count(*) from durations
union all select 'room_catalog_map', count(*) from room_catalog_map
order by table_name;

**Result pasted here:**
## Summary Dashboard (paste result table below)
| table_name       | row_count |
| ---------------- | --------- |
| catalog          | 6         |
| durations        | 3         |
| room_catalog_map | 5         |
| rooms            | 3         |
| vat              | 2         |
| issue                    | cnt |
| ------------------------ | --- |
| duplicates_in_rooms_code | 0   |
| missing_catalog_refs     | 0   |
| missing_room_refs        | 0   |
| rooms_with_zero_mappings | 0   |
| vat_mismatch_in_catalog  | 0   |
✅ Validation check passed — all summary counts = 0
