import { useState } from "react";

const PRICING_MODELS = [
  "TIME_TIERED",        // hourly / half-day / day
  "PER_PERSON",
  "PER_ITEM",
  "PER_PERSON_PER_DAY",
  "PER_ROOM_PER_DAY",
];

function newItem() {
  return {
    id: crypto.randomUUID(),
    name: "",
    pricing_model: "PER_ITEM",
    hourly_rate: "",
    half_day_rate: "",
    day_rate: "",
    unit_price: "",
    allow_qty: true,
    default_qty: 1,
    unit_label: "unit(s)",
    // AV-specific hints (optional metadata)
    source: "ON_SITE", // ON_SITE | THIRD_PARTY
    power: "",
    setup_time_minutes: "",
    // commercial flags
    inclusive: false,
    inclusive_threshold_attendees: "",
    upsell_eligible: true,
    tax_class: "Standard",
    notes: "",
  };
}

export default function AV() {
  const [items, setItems] = useState([newItem()]);
  const [errors, setErrors] = useState({}); // { [id]: { name?:string, price?:string } }

  function setItem(id, patch) {
    setItems((list) => list.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }
  function addItem() { setItems((list) => [...list, newItem()]); }
  function removeItem(id) { setItems((list) => list.filter((x) => x.id !== id)); }

  function validate(it) {
    const e = {};
    if (!it.name.trim()) e.name = "Item name is required";
    if (it.pricing_model === "TIME_TIERED") {
      if (![it.hourly_rate, it.half_day_rate, it.day_rate].some(v => String(v).trim() !== "")) {
        e.price = "Enter at least one of Hourly / Half-Day / Day";
      }
    } else {
      if (String(it.unit_price).trim() === "") e.price = "Unit price is required";
    }
    return e;
  }

  function saveOne(id) {
    const it = items.find((x) => x.id === id);
    const e = validate(it);
    setErrors((prev) => ({ ...prev, [id]: e }));
    if (Object.keys(e).length) return;

    const payload = normalize(it);
    console.log("AV:SAVE_ONE", payload);
    alert(`Saved AV item: ${it.name || "(unnamed)"} (MVP stub — see console)`);
  }

  function saveAll() {
    const nextErr = {};
    items.forEach((it) => {
      const e = validate(it);
      if (Object.keys(e).length) nextErr[it.id] = e;
    });
    setErrors(nextErr);
    if (Object.keys(nextErr).length) return;

    const payload = items.map(normalize);
    console.log("AV:SAVE_ALL", payload);
    alert(`Saved ${items.length} AV item(s). (MVP stub — see console)`);
  }

  function normalize(it) {
    return {
      name: it.name,
      pricing_model: it.pricing_model,
      hourly_rate: nOrNull(it.hourly_rate),
      half_day_rate: nOrNull(it.half_day_rate),
      day_rate: nOrNull(it.day_rate),
      unit_price: nOrNull(it.unit_price),
      allow_qty: !!it.allow_qty,
      default_qty: Number(it.default_qty || 1),
      unit_label: it.unit_label || "unit(s)",
      source: it.source, // ON_SITE | THIRD_PARTY
      power: it.power || "",
      setup_time_minutes: String(it.setup_time_minutes).trim() === "" ? null : Number(it.setup_time_minutes),
      inclusive: !!it.inclusive,
      inclusive_threshold_attendees:
        String(it.inclusive_threshold_attendees).trim() === "" ? null : Number(it.inclusive_threshold_attendees),
      upsell_eligible: !!it.upsell_eligible,
      tax_class: it.tax_class || "Standard",
      notes: it.notes || "",
      cost_centre: "AV",
    };
  }

  function nOrNull(v) {
    return String(v).trim() === "" ? null : Number(v);
  }

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>AV — Admin</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={saveAll}>Save All (AV)</button>
          <button onClick={addItem}>Add another AV item</button>
        </div>
      </header>

      {items.map((it, idx) => {
        const e = errors[it.id] || {};
        const isTime = it.pricing_model === "TIME_TIERED";
        return (
          <section key={it.id} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0 }}>AV Item {idx + 1}</h2>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => saveOne(it.id)}>Save</button>
                <button type="button" onClick={() => removeItem(it.id)}>Delete</button>
              </div>
            </div>

            <div style={grid2}>
              <div>
                <label style={label}>Item Name *</label>
                <input
                  type="text"
                  value={it.name}
                  onChange={(e) => setItem(it.id, { name: e.target.value })}
                  placeholder="e.g., Projector 4K"
                />
                {e.name && <p style={err}>{e.name}</p>}
              </div>

              <div>
                <label style={label}>Pricing Model *</label>
                <select
                  value={it.pricing_model}
                  onChange={(e) => setItem(it.id, { pricing_model: e.target.value })}
                >
                  {PRICING_MODELS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Rates */}
            {isTime ? (
              <div style={grid3}>
                <div>
                  <label style={label}>Hourly (optional)</label>
                  <input type="number" min="0" step="0.01"
                    value={it.hourly_rate} onChange={(e) => setItem(it.id, { hourly_rate: e.target.value })} />
                </div>
                <div>
                  <label style={label}>Half-Day (optional)</label>
                  <input type="number" min="0" step="0.01"
                    value={it.half_day_rate} onChange={(e) => setItem(it.id, { half_day_rate: e.target.value })} />
                </div>
                <div>
                  <label style={label}>Day (optional)</label>
                  <input type="number" min="0" step="0.01"
                    value={it.day_rate} onChange={(e) => setItem(it.id, { day_rate: e.target.value })} />
                </div>
              </div>
            ) : (
              <div style={grid1}>
                <div>
                  <label style={label}>Unit Price *</label>
                  <input type="number" min="0" step="0.01"
                    value={it.unit_price} onChange={(e) => setItem(it.id, { unit_price: e.target.value })} />
                  {errors[it.id]?.price && <p style={err}>{errors[it.id].price}</p>}
                </div>
                <div>
                  <label style={label}>Allow Quantity</label>
                  <input type="checkbox"
                    checked={it.allow_qty}
                    onChange={(e) => setItem(it.id, { allow_qty: e.target.checked })} />
                </div>
                <div>
                  <label style={label}>Default Quantity</label>
                  <input type="number" min="1"
                    value={it.default_qty} onChange={(e) => setItem(it.id, { default_qty: e.target.value })} />
                </div>
                <div>
                  <label style={label}>Unit Label</label>
                  <input type="text"
                    value={it.unit_label} onChange={(e) => setItem(it.id, { unit_label: e.target.value })} />
                </div>
              </div>
            )}
            {isTime && errors[it.id]?.price && <p style={err}>{errors[it.id].price}</p>}

            {/* AV metadata */}
            <div style={grid1}>
              <div>
                <label style={label}>Source</label>
                <select
                  value={it.source}
                  onChange={(e) => setItem(it.id, { source: e.target.value })}
                >
                  <option value="ON_SITE">On-site</option>
                  <option value="THIRD_PARTY">Third-party</option>
                </select>
              </div>
              <div>
                <label style={label}>Power (notes)</label>
                <input
                  type="text"
                  placeholder="e.g., 230V / 5A"
                  value={it.power}
                  onChange={(e) => setItem(it.id, { power: e.target.value })}
                />
              </div>
              <div>
                <label style={label}>Setup time (min)</label>
                <input
                  type="number" min="0"
                  value={it.setup_time_minutes}
                  onChange={(e) => setItem(it.id, { setup_time_minutes: e.target.value })}
                />
              </div>
            </div>

            {/* Flags */}
            <div style={grid1}>
              <div>
                <label style={label}>Inclusive (included in base price)</label>
                <input
                  type="checkbox"
                  checked={it.inclusive}
                  onChange={(e) => setItem(it.id, { inclusive: e.target.checked })}
                />
              </div>
              <div>
                <label style={label}>Inclusive Threshold (attendees)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="leave blank for always"
                  value={it.inclusive_threshold_attendees}
                  onChange={(e) => setItem(it.id, { inclusive_threshold_attendees: e.target.value })}
                />
              </div>
              <div>
                <label style={label}>Upsell Eligible</label>
                <input
                  type="checkbox"
                  checked={it.upsell_eligible}
                  onChange={(e) => setItem(it.id, { upsell_eligible: e.target.checked })}
                />
              </div>
              <div>
                <label style={label}>Tax Class</label>
                <select
                  value={it.tax_class}
                  onChange={(e) => setItem(it.id, { tax_class: e.target.value })}
                >
                  <option>Standard</option>
                  <option>Reduced</option>
                  <option>Zero</option>
                </select>
              </div>
            </div>

            <div>
              <label style={label}>Notes</label>
              <textarea
                rows={2}
                value={it.notes}
                onChange={(e) => setItem(it.id, { notes: e.target.value })}
                placeholder="Optional notes"
              />
            </div>
          </section>
        );
      })}
    </div>
  );
}

const card = {
  border: "1px solid #e5e7eb",
  padding: 16,
  borderRadius: 12,
  margin: "16px 0",
  background: "#fff",
};

const label = { fontWeight: 600 };
const err = { color: "#b91c1c", marginTop: 6 };

const grid1 = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: 12,
  margin: "10px 0",
};
const grid2 = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr",
  gap: 12,
  margin: "10px 0",
};
const grid3 = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 12,
  margin: "10px 0",
};

