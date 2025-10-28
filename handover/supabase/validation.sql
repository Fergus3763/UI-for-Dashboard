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

-- Run in Supabase SQL editor:
with
row_counts as (
  select 'vat' as tbl, count(*) as cnt from vat
  union all select 'catalog', count(*) from catalog
  union all select 'rooms', count(*) from rooms
  union all select 'durations', count(*) from durations
  union all select 'room_catalog_map', count(*) from room_catalog_map
),
dup_codes as (
  select count(*) as cnt
  from (
    select code
    from rooms
    group by code
    having count(*) > 1
  ) s
),
missing_room as (
  select count(*) as cnt
  from room_catalog_map m
  left join rooms r on r.id = m.room_id
  where r.id is null
),
missing_catalog as (
  select count(*) as cnt
  from room_catalog_map m
  left join catalog c on c.id = m.catalog_item_id
  where c.id is null
),
vat_mismatch as (
  select count(*) as cnt
  from catalog c
  left join vat v on v.name = c.vat_category
  where v.name is null
),
zero_map as (
  select count(*) as cnt
  from (
    select r.id
    from rooms r
    left join room_catalog_map m on m.room_id = r.id
    group by r.id
    having count(m.id) = 0
  ) s
)
select 'duplicates_in_rooms_code' as check, cnt from dup_codes
union all select 'missing_room_refs', cnt from missing_room
union all select 'missing_catalog_refs', cnt from missing_catalog
union all select 'vat_mismatch_in_catalog', cnt from vat_mismatch
union all select 'rooms_with_zero_mappings', cnt from zero_map
order by check;

**Result pasted here:**
## Detail Queries (run only if any count above > 0)

### Duplicate room codes
select code, count(*) as dup_count
from rooms
group by code
having count(*) > 1
order by dup_count desc;

### Missing room references in room_catalog_map
select m.*
from room_catalog_map m
left join rooms r on r.id = m.room_id
where r.id is null
limit 100;

### Missing catalog references in room_catalog_map
select m.*
from room_catalog_map m
left join catalog c on c.id = m.catalog_item_id
where c.id is null
limit 100;

### VAT mismatches in catalog
select c.id, c.name, c.vat_category
from catalog c
left join vat v on v.name = c.vat_category
where v.name is null
limit 100;

### Rooms with zero mappings
select r.id, r.code, r.name
from rooms r
left join room_catalog_map m on m.room_id = r.id
group by r.id, r.code, r.name
having count(m.id) = 0
order by r.code;
