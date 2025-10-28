/* ============================================================================
  VALIDATION — Supabase seed & integrity checks
  How to use:
  1) Run the "SUMMARY DASHBOARD" block — copy result into VALIDATION.md
  2) Run "ROW COUNTS" — copy result into VALIDATION.md
  3) If any summary counts > 0, run the matching DETAIL QUERY block(s),
     paste the small result tables into VALIDATION.md, and fix or note.
============================================================================ */

/* ---------------------------------------------------------------------------
  SUMMARY DASHBOARD (one table)
--------------------------------------------------------------------------- */
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

/* ---------------------------------------------------------------------------
  ROW COUNTS (paste result to VALIDATION.md)
--------------------------------------------------------------------------- */
select 'vat' as table_name, count(*) as row_count from vat
union all select 'catalog', count(*) from catalog
union all select 'rooms', count(*) from rooms
union all select 'durations', count(*) from durations
union all select 'room_catalog_map', count(*) from room_catalog_map
order by table_name;

/* ---------------------------------------------------------------------------
  DETAIL QUERIES — run only if the summary shows a non-zero count
--------------------------------------------------------------------------- */

/* 1) Duplicate room codes (should be empty) */
select code, count(*) as dup_count
from rooms
group by code
having count(*) > 1
order by dup_count desc, code;

/* 2) Missing room references in room_catalog_map (should be empty) */
select m.id as map_id, m.room_id, m.catalog_item_id
from room_catalog_map m
left join rooms r on r.id = m.room_id
where r.id is null
order by m.id;

/* 3) Missing catalog references in room_catalog_map (should be empty) */
select m.id as map_id, m.room_id, m.catalog_item_id
from room_catalog_map m
left join catalog c on c.id = m.catalog_item_id
where c.id is null
order by m.id;

/* 4) VAT mismatches (catalog.vat_category that do not exist in vat.name) */
select c.id, c.name, c.vat_category
from catalog c
left join vat v on v.name = c.vat_category
where v.name is null
order by c.id;

/* 5) Rooms with zero mappings (should be 0 in production) */
select r.id as room_id, r.code, r.name
from rooms r
left join room_catalog_map m on m.room_id = r.id
group by r.id, r.code, r.name
having count(m.id) = 0
order by r.id;

/* ---------------------------------------------------------------------------
  QUICK REPORTS (useful for HUB/UI validation snapshots)
--------------------------------------------------------------------------- */

/* A) Included vs Optional per room */
select r.id as room_id,
       sum(case when m.visibility = 'included' then 1 else 0 end) as included_items,
       sum(case when m.visibility = 'optional' then 1 else 0 end) as optional_items
from rooms r
left join room_catalog_map m on m.room_id = r.id
group by r.id
order by r.id;

/* B) Items per (VAT band × Heading) */
select c.vat_category as vat_band,
       c.heading,
       count(*) as items
from catalog c
group by c.vat_category, c.heading
order by vat_band, heading;

/* C) Items per basis (from mapping overrides, where present) */
select coalesce(m.basis_override::text, '— none —') as basis_used,
       count(*) as items
from room_catalog_map m
group by basis_used
order by items desc, basis_used;
