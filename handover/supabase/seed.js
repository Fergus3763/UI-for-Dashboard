// /handover/supabase/seed.js
// Optional one-command seeding (CommonJS).
// Usage:
//   cd handover/supabase
//   npm i @supabase/supabase-js csv-parse dotenv
//   node seed.js

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { parse } = require('csv-parse/sync');
require('dotenv').config();

const ROOT = path.resolve(__dirname, '..', '..');
const DATA_DIR = path.join(ROOT, 'data', 'db');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

function readCsv(name) {
  const text = fs.readFileSync(path.join(DATA_DIR, name), 'utf8');
  return parse(text, { columns: true, skip_empty_lines: true });
}
const toJson = v => (v ? JSON.parse(v) : null);
const toBool = v => v ? ['true','t','1','y','yes'].includes(String(v).toLowerCase()) : null;
const toNum  = v => v === '' || v == null ? null : (Number.isFinite(Number(v)) ? Number(v) : null);

async function upsert(table, rows, conflictCol='id') {
  if (!rows.length) return;
  const { error } = await supabase.from(table).upsert(rows, { onConflict: conflictCol });
  if (error) { console.error(`Upsert ${table} failed:`, error.message); process.exit(1); }
  console.log(`Upserted ${rows.length} into ${table}`);
}

(async () => {
  await upsert('vat', readCsv('VAT.csv').map(r => ({
    id:r.id, name:r.name, rate_percent:toNum(r.ratePercent), applies_to_json: r.appliesToJSON ? toJson(r.appliesToJSON) : null
  })));

  await upsert('catalog', readCsv('Catalog.csv').map(r => ({
    id:r.id, name:r.name, heading:r.heading, vat_category:r.vatCategory,
    rate_per_hour:toNum(r.ratePerHour), rate_half_day:toNum(r.rateHalfDay), rate_day:toNum(r.rateDay),
    rate_per_person:toNum(r.ratePerPerson), rate_per_booking:toNum(r.ratePerBooking),
    included_default:toBool(r.includedDefault), included_condition:r.includedCondition||null, notes:r.notes||null
  })));

  await upsert('rooms', readCsv('Rooms.csv').map(r => ({
    id:r.id, venue_id:r.venueId, name:r.name, code:r.code, description:r.description,
    size_sqm:toNum(r.sizeSqm), height_m:toNum(r.heightM), accessible:toBool(r.accessible),
    features_json:r.featuresJSON?toJson(r.featuresJSON):null,
    images_json:r.imagesJSON?toJson(r.imagesJSON):null,
    layouts_json:r.layoutsJSON?toJson(r.layoutsJSON):null,
    base_rate_hour:toNum(r.baseRateHour), base_rate_half_day:toNum(r.baseRateHalfDay), base_rate_day:toNum(r.baseRateDay)
  })));

  await upsert('durations', readCsv('Durations.csv').map(r => ({
    code:r.code, label:r.label, hours:toNum(r.hours)
  })), 'code');

  await upsert('room_catalog_map', readCsv('RoomCatalogMap.csv').map(r => ({
    id:r.id, room_id:r.roomId, catalog_item_id:r.catalogItemId,
    visibility:r.visibility, basis_override:r.basisOverride,
    rate_overrides_json:r.rateOverridesJSON?toJson(r.rateOverridesJSON):null,
    min_qty:toNum(r.minQty), max_qty:toNum(r.maxQty), default_qty:toNum(r.defaultQty),
    auto_suggest:toBool(r.autoSuggest)
  })));

  console.log('Seed complete ✅');
})();
