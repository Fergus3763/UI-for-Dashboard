import { useState } from "react";

/**
 * MVP assumption: the actual items live in their own tabs.
 * Here we curate which ones to show as upsells and at which stage.
 * Stages: FNB_STAGE, AV_STAGE, REVIEW_STAGE
 */
const STAGES = ["FNB_STAGE","AV_STAGE","REVIEW_STAGE"];

function newRule() {
  return {
    id: crypto.randomUUID(),
    label: "",                 // human label shown to booker
    ref_cost_centre: "FNB",    // FNB | AV | LABOUR | THIRD_PARTY
    ref_item_name: "",         // free text for MVP (later: select from list)
    stage: "REVIEW_STAGE",     // where to surface the upsell
    priority: 1,               // lower = earlier
    enabled: true,
    // optional guardrails
    min_attendees: "",
    max_attendees: "",
  };
}

export default function AddOnsUpsells() {
  const [rules, setRules] = useState([newRule()]);
  const [errors, setErrors] = useState({});

  const setRule = (id, patch) => setRules((list) => list.map(r => r.id === id ? { ...r, ...patch } : r));
  const addRule = () => setRules((l) => [...l, newRule()]);
  const removeRule = (id) => setRules((l) => l.filter(r => r.id !== id));

  function validate(r) {
    const e = {};
    if (!r.label.trim()) e.label = "Label is required";
    if (!r.ref_item_name.trim()) e.item = "Reference item is required";
    return e;
  }

  const nOrNull = (v) => (String(v).trim() === "" ? null : Number(v));

  function normalize(r) {
    return {
      label: r.label,
      ref_cost_centre: r.ref_cost_centre,
      ref_item_name: r.ref_item_name,
      stage: r.stage,
      priority: Number(r.priority || 1),
      enabled: !!r.enabled,
      min_attendees: nOrNull(r.min_attendees),
      max_attendees: nOrNull(r.max_attendees),
    };
  }

  function saveOne(id) {
    const r = rules.find(x => x.id === id);
    const e = validate(r);
    setErrors((prev) => ({ ...prev, [id]: e }));
    if (Object.keys(e).length) return;
    console.log("ADDONS:SAVE_ONE", normalize(r));
    alert(`Saved upsell rule: ${r.label || "(unnamed)"}`);
  }

  function saveAll() {
    const nextErr = {};
    rules.forEach((r) => { const e = validate(r); if (Object.keys(e).length) nextErr[r.id] = e; });
    setErrors(nextErr);
    if (Object.keys(nextErr).length) return;
    console.log("ADDONS:SAVE_ALL", rules.map(normalize));
    alert(`Saved ${rules.length} upsell rule(s).`);
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>Add-Ons &amp; Upsells — Admin</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={saveAll}>Save All (Upsells)</button>
          <button onClick={addRule}>Add Upsell Rule</button>
        </div>
      </header>

      {rules.map((r, idx) => {
        const e = errors[r.id] || {};
        return (
          <section key={r.id} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0 }}>Rule {idx + 1}</h2>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => saveOne(r.id)}>Save</button>
                <button onClick={() => removeRule(r.id)}>Delete</button>
              </div>
            </div>

            <div style={grid2}>
              <div>
                <label style={label}>Label *</label>
                <input value={r.label} onChange={(e) => setRule(r.id, { label: e.target.value })} placeholder="e.g., Add pastries for morning meetings" />
                {e.label && <p style={err}>{e.label}</p>}
              </div>
              <div>
                <label style={label}>Stage</label>
                <select value={r.stage} onChange={(e) => setRule(r.id, { stage: e.target.value })}>
                  {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div style={grid3}>
              <div>
                <label style={label}>Cost Centre</label>
                <select value={r.ref_cost_centre} onChange={(e) => setRule(r.id, { ref_cost_centre: e.target.value })}>
                  {["FNB","AV","LABOUR","THIRD_PARTY"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={label}>Reference Item *</label>
                <input value={r.ref_item_name} onChange={(e) => setRule(r.id, { ref_item_name: e.target.value })} placeholder="e.g., Coffee & Pastries AM" />
                {e.item && <p style={err}>{e.item}</p>}
              </div>
              <div>
                <label style={label}>Priority</label>
                <input type="number" min="1" value={r.priority} onChange={(e) => setRule(r.id, { priority: e.target.value })} />
              </div>
            </div>

            <div style={grid3}>
              <div>
                <label style={label}>Enabled</label>
                <input type="checkbox" checked={r.enabled} onChange={(e) => setRule(r.id, { enabled: e.target.checked })} />
              </div>
              <div>
                <label style={label}>Min Attendees (optional)</label>
                <input type="number" min="1" value={r.min_attendees} onChange={(e) => setRule(r.id, { min_attendees: e.target.value })} />
              </div>
              <div>
                <label style={label}>Max Attendees (optional)</label>
                <input type="number" min="1" value={r.max_attendees} onChange={(e) => setRule(r.id, { max_attendees: e.target.value })} />
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

const card = { border: "1px solid #e5e7eb", padding: 16, borderRadius: 12, margin: "16px 0", background: "#fff" };
const label = { fontWeight: 600 };
const err = { color: "#b91c1c", marginTop: 6 };
const grid2 = { display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, margin: "10px 0" };
const grid3 = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, margin: "10px 0" };

