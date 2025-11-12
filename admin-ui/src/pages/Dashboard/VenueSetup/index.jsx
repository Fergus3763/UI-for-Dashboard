// HUB#5: Venue Setup with tabs (Venue + Booking Policy / Terms)
// Keeps existing Supabase persistence for `venue` via Netlify functions.
// Booking Policy is local-only for now (persistence added in a follow-up task).

import React, { useEffect, useState } from "react";
import AdminTabs from "../../components/AdminTabs";
import BookingPolicyTab from "./Tabs/BookingPolicyTab";

// ---- existing helpers ----
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
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [initialised, setInitialised] = useState(false);

  // NEW (HUB#5): booking policy (local state only for now)
  const [bookingPolicy, setBookingPolicy] = useState({
    termsText: "",
    holdTimeMinutes: { small: 30, medium: 60, large: 120 },
    reservationFee: { enabled: false, percentage: 0, minimum: 0 },
  });

  // NEW (HUB#5): tabs state
  const [activeTab, setActiveTab] = useState("venue");

  function setField(patch) {
    setVenue((v) => ({ ...v, ...patch }));
  }

  function validate(v) {
    const e = {};
    if (!v.name || !v.name.trim()) {
      e.name = "Venue name is required";
    }
    return e;
  }

  // Load existing config from Supabase (unchanged)
  useEffect(() => {
    let cancelled = false;

    async function doLoad() {
      try {
        const res = await fetch("/.netlify/functions/load_config", { method: "GET" });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const json = await res.json();
        if (cancelled) return;

        if (json && json.data && json.data.venue) {
          setVenue({ ...newVenue(), ...json.data.venue });
        }
        // Later: if (json?.data?.bookingPolicy) setBookingPolicy(json.data.bookingPolicy);

        setInitialised(true);
      } catch (err) {
        console.error(err);
        setInitialised(true);
      }
    }

    doLoad();
    return () => {
      cancelled = true;
    };
  }, []);

  // Save (unchanged: only saves `venue`)
  async function doSave() {
    const e = validate(venue);
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    setSaveMessage(null);
    try {
      const payload = { venue }; // keep backend contract identical
      const res = await fetch("/.netlify/functions/save_config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json();
      setSaveMessage(json.ok ? "Saved" : "Save completed");
    } catch (err) {
      console.error(err);
      setSaveMessage("Save failed");
    } finally {
      setSaving(false);
    }
  }

  // ---- existing venue form ----
  function renderVenueForm() {
    return (
      <div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontWeight: 600 }}>Venue name</label>
          <input
            type="text"
            value={venue.name}
            onChange={(e) => setField({ name: e.target.value })}
            style={{ width: "100%", padding: 8 }}
          />
          {errors.name && <div style={{ color: "red" }}>{errors.name}</div>}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontWeight: 600 }}>Address</label>
          <input
            type="text"
            value={venue.address}
            onChange={(e) => setField({ address: e.target.value })}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ display: "block", fontWeight: 600 }}>Email</label>
            <input
              type="email"
              value={venue.email}
              onChange={(e) => setField({ email: e.target.value })}
              style={{ width: "100%", padding: 8 }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontWeight: 600 }}>Phone</label>
            <input
              type="tel"
              value={venue.phone}
              onChange={(e) => setField({ phone: e.target.value })}
              style={{ width: "100%", padding: 8 }}
            />
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <label style={{ display: "block", fontWeight: 600 }}>Notes</label>
          <textarea
            value={venue.notes}
            onChange={(e) => setField({ notes: e.target.value })}
            style={{ width: "100%", minHeight: 100, padding: 8 }}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <button onClick={doSave} disabled={saving} style={{ padding: "8px 12px" }}>
            {saving ? "Saving..." : "Save"}
          </button>
          {saveMessage && <span style={{ marginLeft: 12 }}>{saveMessage}</span>}
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "venue", label: "Venue", content: renderVenueForm() },
    {
      key: "booking",
      label: "Booking Policy / Terms",
      content: (
        <div>
          <div
            style={{
              padding: 12,
              background: "#fff7e6",
              border: "1px solid #ffe58f",
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            <strong>Note:</strong> This section is scaffolded in HUB #5.
            Saving to Supabase will be added in a dedicated task. Entries below
            are not yet persisted.
          </div>
          <BookingPolicyTab policy={bookingPolicy} onChange={setBookingPolicy} />
        </div>
      ),
    },
  ];

  if (!initialised) return <div>Loading…</div>;

  return (
    <div>
      <h1>Venue Setup</h1>
      <AdminTabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />
    </div>
  );
}
