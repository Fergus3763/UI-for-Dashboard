import { useState } from "react";

function newClass() {
  return {
    id: crypto.randomUUID(),
    name: "",
    rate_percent: "",
    applies_to: { ROOMS: true, FNB: true, AV: true, LABOUR: true, THIRD_PARTY: true },
    effective_from: "",
    notes: "",
  };
}

export default function VAT() {
  const [classes, setClasses] = useState([newClass()]);
  const [errors, setErrors] = useState({});

  const setOne = (id, patch) => setClasses((list) => list.map(c => c.id === id ? { ...c, ...patch } : c));
  const addClass = () => setClasses((l) => [...l, newClass()]);
  const removeClass = (id) => setClasses((l) => l.filter(c => c.id !== id));

  function validate(c) {
    const e = {};
    if (!c.name.trim()) e.name = "VAT class name is required";
    if (String(c.rate_percent).trim() === "") e.rate = "VAT rate is required";
    return e;
  }
  const nOrNull = (v) => (String(v).trim() === "" ? null : Number(v));

  function normalize(c) {
    return {
      name: c.name,
      rate_percent: nOrNull(c.rate_percent),
      applies_to: Object.entries(c.applies_to).filter(([,v]) => v).map(([k]) => k),
      effective_from: c.effective_from || null,
      notes: c.notes || "",
    };
  }

  function saveOne(id) {
    const c = classes.find(x => x.id === id);
    const e = validate(c);
    setErrors((prev) => ({ ...prev, [id]: e }));
    if (Object.keys(e).length) return;
    console.log("VAT:SAVE_ONE", normalize(c));
    alert(`Saved VAT class: ${c.name || "(unnamed)"}`);
  }

  function saveAll() {
    const nextErr = {};
    classes.forEach((c) => { const e = validate(c); if (Object.keys(e).length) nextErr[c.id] = e; });
    setErrors(nextErr);
    if (Object.keys(nextErr).length) return;
    console.log("VAT:SAVE_ALL", classes.map(normalize));
    alert(`Saved ${classes.length} VAT class(es).`);
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>VAT — Admin</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={saveAll}>Save All (VAT)</button>
          <button onClick={addClass}>Add VAT Class</button>
        </div>
      </header>

      {classes.map((c, idx) => {
        const e = errors[c.id] || {};
        return (
          <section key={c.id} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0 }}>VAT Class {idx + 1}</h2>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => saveOne(c.id)}>Save</button>
                <button onClick={() => removeClass(c.id)}>Delete</button>
              </div>
            </div>

            <div style={grid2}>
              <div>
                <label style={label}>Name *</label>
                <input value={c.name} onChange={(e) => setOne(c.id, { name: e.target.value })} placeholder="Standard" />
                {e.name && <p style={err}>{e.name}</p>}
              </div>
              <div>
                <label style={label}>Rate % *</label>
                <input type="number" min="0" step="0.01"
                  value={c.rate_percent} onChange={(e) => setOne(c.id, { rate_percent: e.target.value })} />
                {e.rate && <p style={err}>{e.rate}</p>}
              </div>
            </div>

            <div style={grid5}>
              {["ROOMS","FNB","AV","LABOUR","THIRD_PARTY"].map((k) => (
                <label key={k} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input type="checkbox"
                    checked={c.applies_to[k]} onChange={(e) => setOne(c.id, { applies_to: { ...c.applies_to, [k]: e.target.checked } })} />
                  {k.replace("_"," ")}
                </label>
              ))}
            </div>

            <div style={grid2}>
              <div>
                <label style={label}>Effective from (optional)</label>
                <input type="date" value={c.effective_from}
                  onChange={(e) => setOne(c.id, { effective_from: e.target.value })} />
              </div>
              <div>
                <label style={label}>Notes</label>
                <input value={c.notes} onChange={(e) => setOne(c.id, { notes: e.target.value })} placeholder="Policy notes" />
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
const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "10px 0" };
const grid5 = { display: "grid", gridTemplateColumns: "repeat(5, max-content)", gap: 16, margin: "10px 0" };

