// BookingPolicyTab.jsx — HUB #5
// Controlled form for Terms, Hold Times, and Reservation Fee.
// Used by VenueSetup.jsx; persistence is a follow-up task.

import React from "react";

export default function BookingPolicyTab({ policy, onChange }) {
  const safe = policy || {
    termsText: "",
    holdTimeMinutes: { small: 30, medium: 60, large: 120 },
    reservationFee: { enabled: false, percentage: 0, minimum: 0 },
  };

  const update = (field, value) => onChange({ ...safe, [field]: value });

  return (
    <div>
      <section style={{ marginBottom: 16 }}>
        <h3>Standard Terms & Conditions</h3>
        <textarea
          style={{ width: "100%", minHeight: 120 }}
          value={safe.termsText}
          placeholder="Enter your standard meeting-room terms and conditions here."
          onChange={(e) => update("termsText", e.target.value)}
        />
      </section>

      <section style={{ marginBottom: 16 }}>
        <h3>Reservation Hold Time (minutes)</h3>
        <p>How long an unpaid booking remains reserved before expiring.</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div>
            <label>1–4 people</label>
            <input
              type="number"
              min="1"
              value={safe.holdTimeMinutes.small}
              onChange={(e) =>
                update("holdTimeMinutes", {
                  ...safe.holdTimeMinutes,
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
              value={safe.holdTimeMinutes.medium}
              onChange={(e) =>
                update("holdTimeMinutes", {
                  ...safe.holdTimeMinutes,
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
              value={safe.holdTimeMinutes.large}
              onChange={(e) =>
                update("holdTimeMinutes", {
                  ...safe.holdTimeMinutes,
                  large: Number(e.target.value),
                })
              }
            />
          </div>
        </div>
      </section>

      <section>
        <h3>Reservation Fee</h3>
        <label>
          <input
            type="checkbox"
            checked={safe.reservationFee.enabled}
            onChange={(e) =>
              update("reservationFee", {
                ...safe.reservationFee,
                enabled: e.target.checked,
              })
            }
          />{" "}
          Charge a reservation fee?
        </label>

        {safe.reservationFee.enabled && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
            <div>
              <label>Percentage (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={safe.reservationFee.percentage}
                onChange={(e) =>
                  update("reservationFee", {
                    ...safe.reservationFee,
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
                value={safe.reservationFee.minimum}
                onChange={(e) =>
                  update("reservationFee", {
                    ...safe.reservationFee,
                    minimum: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
