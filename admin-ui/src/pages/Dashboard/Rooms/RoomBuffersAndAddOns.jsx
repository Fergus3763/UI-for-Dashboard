// admin-ui/src/pages/Dashboard/Rooms/RoomBuffersAndAddOns.jsx

import React from "react";

const RoomBuffersAndAddOns = ({
  bufferBefore,
  bufferAfter,
  includedAddOns,
  addOns,
  onChange,
}) => {
  const handleBufferChange = (field, rawValue) => {
    const value =
      rawValue === "" ? 0 : Math.max(0, parseInt(rawValue, 10) || 0);
    onChange({ [field]: value });
  };

  const toggleAddOn = (id) => {
    const set = new Set(includedAddOns || []);
    if (set.has(id)) {
      set.delete(id);
    } else {
      set.add(id);
    }
    onChange({ includedAddOns: Array.from(set) });
  };

  return (
    <div className="room-buffers-addons">
      <div
        className="buffers-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        <div className="form-group">
          <label>Buffer Before (minutes)</label>
          <input
            type="number"
            min={0}
            value={bufferBefore ?? 0}
            onChange={(e) => handleBufferChange("bufferBefore", e.target.value)}
            placeholder="e.g. 30"
          />
        </div>
        <div className="form-group">
          <label>Buffer After (minutes)</label>
          <input
            type="number"
            min={0}
            value={bufferAfter ?? 0}
            onChange={(e) => handleBufferChange("bufferAfter", e.target.value)}
            placeholder="e.g. 30"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Included Add-Ons</label>
        <p style={{ fontSize: "0.9rem", color: "#555" }}>
          Select which add-ons are automatically included with this room.
        </p>
        <div
          className="addons-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "0.5rem",
          }}
        >
          {(addOns || []).map((addOn) => {
            const id = addOn.id || addOn.code || addOn.slug || addOn.name;
            if (!id) return null;
            const label =
              addOn.name ||
              addOn.label ||
              addOn.title ||
              addOn.code ||
              String(id);

            const checked = (includedAddOns || []).includes(id);

            return (
              <label
                key={id}
                style={{ display: "inline-flex", alignItems: "center" }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleAddOn(id)}
                  style={{ marginRight: "0.4rem" }}
                />
                {label}
              </label>
            );
          })}

          {(!addOns || !addOns.length) && (
            <span style={{ fontSize: "0.9rem", color: "#777" }}>
              No add-ons configured yet.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomBuffersAndAddOns;
