// BookingPolicyTab.jsx — HUB #5
// Controlled form for Terms, Privacy Statement, Hold Times, Reservation Fee, and Additional Documents.

import React from "react";

export default function BookingPolicyTab({ config, setConfig }) {
  const policy = (config && config.bookingPolicy) || {
    termsText: "",
    privacyStatement: "",
    holdTimeMinutes: { small: 30, medium: 60, large: 120 },
    reservationFee: { enabled: false, percentage: 0, minimum: 0 },
    documents: [],
  };

  const update = (field, value) =>
    setConfig({ bookingPolicy: { ...policy, [field]: value } });

  const docs = Array.isArray(policy.documents) ? policy.documents : [];

  const updateDoc = (idx, patch) => {
    const next = docs.map((d, i) => (i === idx ? { ...d, ...patch } : d));
    update("documents", next);
  };

  const addDoc = () => update("documents", [...docs, { title: "", url: "" }]);

  const removeDoc = (idx) => {
    const next = docs.filter((_, i) => i !== idx);
    update("documents", next);
  };

  return (
    <div>
      {/* Terms & Conditions */}
      <section style={{ marginBottom: 16 }}>
        <h3>Standard Terms & Conditions</h3>
        <textarea
          style={{ width: "100%", minHeight: 120 }}
          value={policy.termsText || ""}
          placeholder="Enter your standard meeting-room terms and conditions here."
          onChange={(e) => update("termsText", e.target.value)}
        />
      </section>

      {/* Privacy Statement */}
      <section style={{ marginBottom: 16 }}>
        <h3>Privacy Statement</h3>
        <textarea
          style={{ width: "100%", minHeight: 120 }}
          value={policy.privacyStatement || ""}
          placeholder="Enter your venue's privacy/data statement (or link to full policy)."
          onChange={(e) => update("privacyStatement", e.target.value)}
        />
      </section>

      {/* Hold time */}
      <section style={{ marginBottom: 16 }}>
        <h3>Reservation Hold Time (minutes)</h3>
        <p>How long an unpaid booking remains reserved before expiring.</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div>
            <label>1–4 people</label>
            <input
              type="number"
              min="1"
              value={policy.holdTimeMinutes?.small ?? 30}
              onChange={(e) =>
                update("holdTimeMinutes", {
                  ...policy.holdTimeMinutes,
                  small: Number(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label>5–10 people</label>
            <input
              type="number"
              min="1"
              value={policy.holdTimeMinutes?.medium ?? 60}
              onChange={(e) =>
                update("holdTimeMinutes", {
                  ...policy.holdTimeMinutes,
                  medium: Number(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label>11–20 people</label>
            <input
              type="number"
              min="1"
              value={policy.holdTimeMinutes?.large ?? 120}
              onChange={(e) =>
                update("holdTimeMinutes", {
                  ...policy.holdTimeMinutes,
                  large: Number(e.target.value),
                })
              }
            />
          </div>
        </div>
      </section>

      {/* Reservation Fee */}
      <section style={{ marginBottom: 16 }}>
        <h3>Reservation Fee</h3>
        <label>
          <input
            type="checkbox"
            checked={policy.reservationFee?.enabled || false}
            onChange={(e) =>
              update("reservationFee", {
                ...policy.reservationFee,
                enabled: e.target.checked,
              })
            }
          />{" "}
          Charge a reservation fee?
        </label>

        {policy.reservationFee?.enabled && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
            <div>
              <label>Percentage (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={policy.reservationFee?.percentage ?? 0}
                onChange={(e) =>
                  update("reservationFee", {
                    ...policy.reservationFee,
                    percentage: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label>Minimum Fee (€)</label>
              <input
                type="number"
                min="0"
                value={policy.reservationFee?.minimum ?? 0}
                onChange={(e) =>
                  update("reservationFee", {
                    ...policy.reservationFee,
                    minimum: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
        )}
      </section>

      {/* Additional Documents */}
      <section>
        <h3>Additional Documents</h3>
        <p>Add named links to any extra policies (PDFs/pages hosted elsewhere).</p>

        {docs.length === 0 && <div style={{ marginBottom: 8 }}>No documents added.</div>}

        {docs.map((doc, idx) => (
          <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto", gap: 8, alignItems: "end", marginBottom: 8 }}>
            <div>
              <label>Title</label>
              <input
                type="text"
                value={doc.title || ""}
                onChange={(e) => updateDoc(idx, { title: e.target.value })}
                style={{ width: "100%", padding: 6 }}
              />
            </div>
            <div>
              <label>URL</label>
              <input
                type="url"
                value={doc.url || ""}
                placeholder="https://example.com/policies/privacy.pdf"
                onChange={(e) => updateDoc(idx, { url: e.target.value })}
                style={{ width: "100%", padding: 6 }}
              />
            </div>
            <button type="button" onClick={() => removeDoc(idx)} style={{ padding: "6px 10px" }}>
              Remove
            </button>
          </div>
        ))}

        <button type="button" onClick={addDoc} style={{ marginTop: 8, padding: "6px 10px" }}>
          + Add Additional Document
        </button>
      </section>
    </div>
  );
}
