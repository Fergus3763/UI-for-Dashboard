import { useState } from "react";

function newVenue() {
  return {
    name: "",
    address: "",
    email: "",
    phone: "",
    main_image: null,
    more_images: [],
    notes: "",
  };
}

export default function VenueSetup() {
  const [venue, setVenue] = useState(newVenue());
  const [errors, setErrors] = useState({});

  function setField(patch) {
    setVenue((v) => ({ ...v, ...patch }));
  }

  function validate(v) {
    const e = {};
    if (!v.name.trim()) e.name = "Venue name is required";
    return e;
  }

  function save() {
    const e = validate(venue);
    setErrors(e);
    if (Object.keys(e).length) return;

    // Minimal normalization for now (MVP)
    const payload = {
      name: venue.name,
      address: venue.address,
      email: venue.email,
      phone: venue.phone,
      notes: venue.notes,
      // file inputs not posted yet; wired later to storage/upload
    };

    console.log("VENUE:SAVE", payload);
    alert(`Saved venue: ${venue.name || "(unnamed)"}`);
  }

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>Venue Setup — Admin</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={save}>Save</button>
        </div>
      </header>

      <section style={card}>
        <div style={grid2}>
          <div>
            <label style={label}>Venue Name *</label>
            <input
              value={venue.name}
              onChange={(e) => setField({ name: e.target.value })}
              placeholder="e.g., Airport Business Park — Hub"
            />
            {errors.name && <p style={err}>{errors.name}</p>}
          </div>
          <div>
            <label style={label}>Contact Email</label>
            <input
              value={venue.email}
              onChange={(e) => setField({ email: e.target.value })}
              placeholder="e.g., sales@example.com"
              type="email"
            />
          </div>
        </div>

        <div style={grid2}>
          <div>
            <label style={label}>Phone</label>
            <input
              value={venue.phone}
              onChange={(e) => setField({ phone: e.target.value })}
              placeholder="+353 1 234 5678"
            />
          </div>
          <div>
            <label style={label}>Main Image</label>
            <input
              type="file"
              onChange={(e) => setField({ main_image: e.target.files?.[0] || null })}
            />
          </div>
        </div>

        <div>
          <label style={label}>Add More Images</label>
          <input
            multiple
            type="file"
            onChange={(e) => setField({ more_images: Array.from(e.target.files || []) })}
          />
        </div>

        <div>
          <label style={label}>Address</label>
          <textarea
            rows={2}
            value={venue.address}
            onChange={(e) => setField({ address: e.target.value })}
            placeholder="Street, City, Postcode, Country"
          />
        </div>

        <div>
          <label style={label}>Notes</label>
          <textarea
            rows={2}
            value={venue.notes}
            onChange={(e) => setField({ notes: e.target.value })}
            placeholder="Optional administrative notes"
          />
        </div>

        <div style={{ marginTop: 8 }}>
          <button type="button" onClick={save}>Save</button>
        </div>
      </section>
    </div>
  );
}

const card  = { border: "1px solid #e5e7eb", padding: 16, borderRadius: 12, margin: "16px 0", background: "#fff" };
const label = { fontWeight: 600 };
const err   = { color: "#b91c1c", marginTop: 6 };
const grid2 = { display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, margin: "10px 0" };

