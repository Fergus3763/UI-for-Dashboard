# PERSISTENCE

## Table
```sql
create table if not exists public.admin_ui_config (
  id text primary key,
  data jsonb,
  updated_at timestamptz default now()
);
