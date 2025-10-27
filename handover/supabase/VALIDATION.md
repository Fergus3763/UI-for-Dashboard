# VALIDATION — Supabase Load Checks

## Row counts
```sql
select 'vat' tbl, count(*) from vat
union all select 'catalog', count(*) from catalog
union all select 'rooms', count(*) from rooms
union all select 'durations', count(*) from durations
union all select 'room_catalog_map', count(*) from room_catalog_map;
[
  {
    "vat_band": "Reduced",
    "heading": "F&B",
    "items": 1
  },
  {
    "vat_band": "Reduced",
    "heading": "AV",
    "items": 1
  },
  {
    "vat_band": "Reduced",
    "heading": "3rd Party",
    "items": 1
  },
  {
    "vat_band": "Standard",
    "heading": "F&B",
    "items": 1
  },
  {
    "vat_band": "Standard",
    "heading": "AV",
    "items": 1
  },
  {
    "vat_band": "Standard",
    "heading": "Labour",
    "items": 1
  }
]
