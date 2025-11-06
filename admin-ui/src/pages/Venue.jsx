import React, { useState } from "react";

export default function VenueAdmin() {
  const [venue, setVenue] = useState({
    name: "",
    address: "",
    contactName: "",
    contactEmail: "",
    timezone: "Europe/Dublin",
    notes: "",
  });

  const setField = (k, v) => setVenue((x) => ({ ...x, [k]: v }));

  const save = () => {
    console.log("VENUE:SAVE", venue);
    alert("Venue saved (console log only in MVP).");
  };

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1>Venue — Admin</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label>Name *</label>
          <input value={venue.name} onChange={(e) => setField("name", e.target.value)} placeholder="e.g., WorXInn Hotel Dublin" />
        </div>
        <div>
          <label>Timezone</label>
          <input value={venue.timezone} onChange={(e) => setField("timezone", e.target.value)} placeholder="Europe/Dublin" />
        </div>
        <div>
          <label>Address</label>
          <input value={venue.address} onChange={(e) => setField("address", e.target.value)} placeholder="Street, City, Postcode" />
        </div>
        <div>
          <label>Contact Name</label>
          <input value={venue.contactName} onChange={(e) => setField("contactName", e.target.value)} placeholder="Jane Doe" />
        </div>
        <div>
          <label>Contact Email</label>
          <input value={venue.contactEmail} onChange={(e) => setField("contactEmail", e.target.value)} placeholder="jane@example.com" />
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label>Notes</label>
        <textarea rows={4} value={venue.notes} onChange={(e) => setField("notes", e.target.value)} placeholder="Internal notes…" />
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={save}>Save Venue</button>
      </div>
    </div>
  );
}
