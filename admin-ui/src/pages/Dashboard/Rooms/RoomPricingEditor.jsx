// admin-ui/src/pages/Dashboard/Rooms/RoomPricingEditor.jsx

import React from "react";

const RoomPricingEditor = ({ pricing, onChange }) => {
  const updateField = (field, value) => {
    onChange({ ...pricing, [field]: value });
  };

  const handleNumberChange = (field, rawValue) => {
    const value =
      rawValue === "" ? 0 : Math.max(0, parseFloat(rawValue) || 0);
    updateField(field, value);
  };

  return (
    <div className="room-pricing-editor">
      <div
        className="pricing-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
        }}
      >
        <div className="form-group">
          <label>Per-Person Rate (€)</label>
          <input
            type="number"
            min={0}
            step="1"
            value={pricing.perPerson ?? 0}
            onChange={(e) => handleNumberChange("perPerson", e.target.value)}
            placeholder="e.g. 20"
          />
          <small>
            Default base pricing mode. Example: €20 per person.
          </small>
        </div>

        <div className="form-group">
          <label>Per-Room / Event Rate (€)</label>
          <input
            type="number"
            min={0}
            step="1"
            value={pricing.perRoom ?? 0}
            onChange={(e) => handleNumberChange("perRoom", e.target.value)}
            placeholder="e.g. 100"
          />
          <small>
            Flat price for the room per booking, regardless of headcount.
          </small>
        </div>

        <div className="form-group">
          <label>Pricing Rule</label>
          <select
            value={pricing.rule || "higher"}
            onChange={(e) => updateField("rule", e.target.value)}
          >
            <option value="higher">Higher of per-person or per-room</option>
            <option value="lower">Lower of per-person or per-room</option>
          </select>
          <small>
            Pricing rule: Choose whether the guest is charged the higher or
            lower result between your per-person rate and your per-room flat
            rate.
          </small>
        </div>
      </div>
    </div>
  );
};

export default RoomPricingEditor;
