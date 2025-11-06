import { useState } from "react";

/** Simple weekday helper */
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const newHours = () => DAYS.map(d => ({ day: d, open: false, from: "09:00", to: "17:00" }));

function normalize(v) {
  return {
    name: v.name.trim(),
    address: v.address.trim() || null,
    city: v.city.trim() || null,
    country: v.country.trim() || null,
    timezone: v.timezone || "Europe/Dublin",
    contact_email: v.contact_email.trim() || null,
    contact_phone: v.contact_phone.trim() || null,
    notes: v.notes.trim() || null,
    hours: v.hours.map(h => ({
      day: h.day,
      open: !!h.open,
      from: h.open ? h.from : null,
      to:   h.open ? h.to   : null,
    })),
  };
}

export default function Venue() {
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    country: "",
    timezone: "Europe/Dublin",
    contact_email: "",
    contact_phone: "",
    notes: "",
    hours: newHours(),
  });
  const [errors, setErrors] = useState({});

  const set = patch => setForm(f => ({ ...f, ...patch }));
  const setHour = (i, patch) =>
    setForm(f => ({ ...f, hours: f.hours.map((h, idx) => (idx === i ? { ...h, ...patch } : h)) }));

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Venue name is required";
    return e;
  }

  function save() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    const payload = normalize(form);
    console.log("VENUE:SAVE", payload);
    alert("Venue saved (see console payload).");
  }

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>Venue — Admin</h1>
        <button onClick={save}>Save Venue</button>
      </header>

      {/* Basics */}
      <section style={card}>
        <h2 style={{ marginTop: 0 }}>Basics</h2>
        <div style={grid2}>
          <div>
            <label style={label}>Venue Name *</label>
            <input
              value={form.name}
              onChange={(e) => set({ name: e.target.value })}
              placeholder="e.g., Airport Business Park Hub"
            />
            {errors.name && <p style={err}>{errors.name}</p>}
          </div>
          <div>
            <label style={label}>Timezone</label>
            <select
              value={form.timezone}
              onChange={(e) => set({ timezone: e.target.value })}
            >
              <option value="Europe/Dublin">Europe/Dublin</option>
              <option value="Europe/London">Europe/London</option>
              <option value="Europe/Madrid">Europe/Madrid</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>

        <div style={grid3}>
          <div>
            <label style={label}>Address</label>
            <input value={form.address} onChange={(e) => set({ address: e.target.value })} />
          </div>
          <div>
            <label style={label}>City</label>
            <input value={form.city} onChange={(e) => set({ city: e.target.value })} />
          </div>
          <div>
            <label style={label}>Country</label>
            <input value={form.country} onChange={(e) => set({ country: e.target.value })} />
          </div>
        </div>
      </section>

      {/* Contacts */}
      <section style={card}>
        <h2 style={{ marginTop: 0 }}>Contacts</h2>
        <div style={grid2}>
          <div>
            <label style={label}>Contact Email</label>
            <input
              type="email"
              value={form.contact_email}
              onChange={(e) => set({ contact_email: e.target.value })}
              placeholder="venue@example.com"
            />
          </div>
          <div>
            <label style={label}>Contact Phone</label>
            <input
              value={form.contact_phone}
              onChange={(e) => set({ contact_phone: e.target.value })}
              placeholder="+353…"
            />
          </div>
        </div>
        <div>
          <label style={label}>Admin Notes</label>
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => set({ notes: e.target.value })}
            placeholder="Operational notes, parking, access, etc."
          />
        </div>
      </section>

      {/* Opening Hours */}
      <section style={card}>
        <h2 style={{ marginTop: 0 }}>Opening Hours</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
          {form.hours.map((h, i) => (
            <div key={h.day} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 8 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>{h.day}</div>
              <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={h.open}
                  onChange={(e) => setHour(i, { open: e.target.checked })}
                />
                Open
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 6 }}>
                <input type="time" value={h.from} disabled={!h.open}
                  onChange={(e) => setHour(i, { from: e.target.value })} />
                <input type="time" value={h.to} disabled={!h.open}
                  onChange={(e) => setHour(i, { to: e.target.value })} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const card  = { border: "1px solid #e5e7eb", padding: 16, borderRadius: 12, margin: "16px 0", background: "#fff" };
const label = { fontWeight: 600 };
const err   = { color: "#b91c1c", marginTop: 6 };
const grid2 = { display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, margin: "10px 0" };
const grid3 = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, margin: "10px 0" };
