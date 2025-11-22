VALIDATION — Supabase Schema & Data (HUB #6)

Used for verifying import correctness after running 001_schema.sql and seeding CSVs.

1. Table Row Count Checks
select 'vat', count(*) from vat;
select 'catalog', count(*) from catalog;
select 'rooms', count(*) from rooms;
select 'durations', count(*) from durations;
select 'room_catalog_map', count(*) from room_catalog_map;


Expected values come from /data/db/.

2. Foreign Key Checks
select * from room_catalog_map
where room_id not in (select id from rooms);

select * from room_catalog_map
where catalog_item_id not in (select id from catalog);

3. JSON Structure Checks
select id, jsonb_typeof(features_json) from rooms limit 20;
select id, jsonb_typeof(rate_overrides_json) from room_catalog_map limit 20;

4. Blackout Table Check
select id, room_id, starts_at, ends_at from blackout_periods limit 10;


Validation v0.9 — HUB #6
