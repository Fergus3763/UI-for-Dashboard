// BookingPolicyTab.jsx — HUB #5
// Allows hotels to define Terms & Conditions, reservation hold times, and optional reservation fees.
// Data is stored inside config.bookingPolicy and saved through existing Netlify functions.

import React from "react";

export default function BookingPolicyTab({ config, setConfig }) {
  const policy = config.bookingPolicy || {
    termsText: "",
    holdTimeMinutes: { small: 30, medium: 60, large: 120 },
    reservationFee: { enabled: false, percentage: 0, minimum: 0 },
  };

  const update = (field, value) => {
    setConfig({
      ...config,
      bookingPolicy: { ...policy, [field]: value },
    });
  };

  return (
    <div className="booking-policy-tab">
      <h2>Booking Policy & Terms</h2>

      <section>
        <h3>Standard Terms & Conditions</h3>
        <textarea
          style={{ width: "100%", minHeight: "120px" }}
          value={policy.termsText || ""}
          placeholder="Enter your standard meeting-room terms and conditions here."
          onChange={(e) => update("termsText", e.target.value)}
        />
      </section>

      <section>
        <h3>Reservation Hold Time (minutes)</h3>
        <p>Define how long an unpaid booking remains reserved before expiring.</p>

        <label>1–4 people</label>
        <input
          type="number"
          min="1"
          value={policy.holdTimeMinutes.small}
          onChange={(e) =>
            update("holdTimeMinutes", {
              ...policy.holdTimeMinutes,
              small: Number(e.target.value),
            })
          }
        />

        <label>5–10 people</label>
        <input
          type="number"
          min="1"
          value={policy.holdTimeMinutes.medium}
          onChange={(e) =>
            update("holdTimeMinutes", {
              ...policy.holdTimeMinutes,
              medium: Number(e.target.value),
            })
          }
        />

        <label>11–20 people</label>
        <input
          type="number"
          min="1"
          value={policy.holdTimeMinutes.large}
          onChange={(e) =>
            update("holdTimeMinutes", {
              ...policy.holdTimeMinutes,
              large: Number(e.target.value),
            })
          }
        />
      </section>

      <section>
        <h3>Reservation Fee</h3>
        <label>
          <input
            type="checkbox"
            checked={policy.reservationFee.enabled}
            onChange={(e) =>
              update("reservationFee", {
                ...policy.reservationFee,
                enabled: e.target.checked,
              })
            }
          />{" "}
          Charge a reservation fee?
        </label>

        {policy.reservationFee.enabled && (
          <div>
            <label>Percentage (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={policy.reservationFee.percentage}
              onChange={(e) =>
                update("reservationFee", {
                  ...policy.reservationFee,
                  percentage: Number(e.target.value),
                })
              }
            />

            <label>Minimum Fee (€)</label>
            <input
              type="number"
              min="0"
              value={policy.reservationFee.minimum}
              onChange={(e) =>
                update("reservationFee", {
                  ...policy.reservationFee,
                  minimum: Number(e.target.value),
                })
              }
            />
          </div>
        )}
      </section>
    </div>
  );
}
