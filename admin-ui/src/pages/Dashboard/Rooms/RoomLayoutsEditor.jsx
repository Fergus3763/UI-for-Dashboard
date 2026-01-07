// admin-ui/src/pages/Dashboard/Rooms/RoomLayoutsEditor.jsx

import React from "react";

const PREDEFINED_LAYOUT_TYPES = [
  "Boardroom",
  "U-Shape",
  "Theatre",
  "Classroom",
  "Banquet",
];

function toNonNegativeInt(value) {
  if (value === "" || value === null || value === undefined) return 0;
  const n = parseInt(value, 10);
  return Number.isNaN(n) || n < 0 ? 0 : n;
}

function clamp(n, min, max) {
  const x = Number.isFinite(n) ? n : min;
  return Math.max(min, Math.min(max, x));
}

function getEffectiveOnlineUpTo(layout) {
  const max = toNonNegativeInt(layout?.max);
  const raw = layout?.onlineBookingUpTo;
  if (raw === null || raw === undefined || raw === "") return max;
  return clamp(toNonNegativeInt(raw), toNonNegativeInt(layout?.min), max);
}

const LayoutRow = ({ label, layout, onChange }) => {
  const min = layout?.min ?? 0;
  const max = layout?.max ?? 0;

  // onlineBookingUpTo: number | null
  const effectiveOnlineUpTo = getEffectiveOnlineUpTo(layout);
  const onlineInputValue =
    layout?.onlineBookingUpTo === null || layout?.onlineBookingUpTo === undefined
      ? String(max ?? 0) // default display = capacityMax
      : String(layout?.onlineBookingUpTo ?? "");

  const showRFQBadge =
    Number.isFinite(max) && Number.isFinite(effectiveOnlineUpTo)
      ? effectiveOnlineUpTo < max
      : false;

  const handleMinChange = (value) => {
    const nextMin = toNonNegativeInt(value);
    const nextMax = toNonNegativeInt(layout?.max);

    // Keep onlineBookingUpTo within [min, max] if set; otherwise remain null (default=max)
    const raw = layout?.onlineBookingUpTo;
    const nextOnline =
      raw === null || raw === undefined || raw === ""
        ? null
        : clamp(toNonNegativeInt(raw), nextMin, nextMax);

    onChange({
      ...layout,
      min: nextMin,
      max: nextMax,
      onlineBookingUpTo: nextOnline,
    });
  };

  const handleMaxChange = (value) => {
    const nextMin = toNonNegativeInt(layout?.min);
    const nextMax = toNonNegativeInt(value);

    // Keep onlineBookingUpTo within [min, max] if set; otherwise remain null (default=max)
    const raw = layout?.onlineBookingUpTo;
    const nextOnline =
      raw === null || raw === undefined || raw === ""
        ? null
        : clamp(toNonNegativeInt(raw), nextMin, nextMax);

    onChange({
      ...layout,
      min: nextMin,
      max: nextMax,
      onlineBookingUpTo: nextOnline,
    });
  };

  const handleOnlineUpToChange = (value) => {
    const nextMin = toNonNegativeInt(layout?.min);
    const nextMax = toNonNegativeInt(layout?.max);

    // Empty = null (meaning default = capacityMax)
    if (value === "") {
      onChange({ ...layout, onlineBookingUpTo: null });
      return;
    }

    const parsed = toNonNegativeInt(value);
    const clamped = clamp(parsed, nextMin, nextMax);

    onChange({ ...layout, onlineBookingUpTo: clamped });
  };

  return (
    <div
      className="layout-row"
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr 1fr 1.4fr",
        gap: "0.5rem",
        alignItems: "start",
        marginBottom: "0.5rem",
      }}
    >
      <div style={{ paddingTop: 6 }}>{label}</div>

      <div>
        <input
          type="number"
          min={0}
          value={min}
          onChange={(e) => handleMinChange(e.target.value)}
          placeholder="Min"
        />
      </div>

      <div>
        <input
          type="number"
          min={0}
          value={max}
          onChange={(e) => handleMaxChange(e.target.value)}
          placeholder="Max"
        />
      </div>

      <div>
        <input
          type="number"
          min={0}
          value={onlineInputValue}
          onChange={(e) => handleOnlineUpToChange(e.target.value)}
          placeholder="Online up to"
        />
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
          Bookings above this number will require manual confirmation (RFQ).
        </div>

        {showRFQBadge ? (
          <div style={{ marginTop: 6 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "3px 10px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                border: "1px solid rgba(59, 130, 246, 0.22)",
                background: "rgba(59, 130, 246, 0.10)",
                color: "rgba(30, 64, 175, 0.95)",
              }}
            >
              RFQ above {effectiveOnlineUpTo}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const RoomLayoutsEditor = ({ layouts, onChange }) => {
  const getByType = (type) => layouts.find((l) => l.type === type);

  const updateLayoutByType = (type, updated) => {
    let next = [...layouts];
    const existingIndex = next.findIndex((l) => l.type === type);

    const base = existingIndex === -1 ? { type, min: 0, max: 0 } : next[existingIndex];

    const merged = { ...base, ...updated, type };

    // Ensure onlineBookingUpTo is either null or clamped to [min, max]
    const nextMin = toNonNegativeInt(merged.min);
    const nextMax = toNonNegativeInt(merged.max);

    let nextOnline = merged.onlineBookingUpTo;
    if (nextOnline === undefined) nextOnline = null; // default = max
    if (nextOnline !== null) {
      nextOnline = clamp(toNonNegativeInt(nextOnline), nextMin, nextMax);
    }

    const finalLayout = {
      ...merged,
      min: nextMin,
      max: nextMax,
      onlineBookingUpTo: nextOnline,
    };

    if (existingIndex === -1) next.push(finalLayout);
    else next[existingIndex] = finalLayout;

    onChange(next);
  };

  const customLayouts = layouts.filter((l) => l.type === "Custom");

  const handleCustomChange = (index, updated) => {
    const custom = customLayouts[index];
    const globalIndex = layouts.findIndex(
      (l) =>
        l.type === "Custom" &&
        l.name === custom.name &&
        l.min === custom.min &&
        l.max === custom.max
    );

    const next = [...layouts];
    if (globalIndex !== -1) {
      const base = next[globalIndex];
      const merged = { ...base, ...updated, type: "Custom" };

      const nextMin = toNonNegativeInt(merged.min);
      const nextMax = toNonNegativeInt(merged.max);

      let nextOnline = merged.onlineBookingUpTo;
      if (nextOnline === undefined) nextOnline = null; // default = max
      if (nextOnline !== null) {
        nextOnline = clamp(toNonNegativeInt(nextOnline), nextMin, nextMax);
      }

      next[globalIndex] = {
        ...merged,
        min: nextMin,
        max: nextMax,
        onlineBookingUpTo: nextOnline,
      };
    }
    onChange(next);
  };

  const handleAddCustom = () => {
    const baseName = "Custom Layout";
    let name = baseName;
    let counter = 1;
    const names = new Set(customLayouts.map((l) => l.name || ""));
    while (names.has(name)) {
      name = `${baseName} ${counter++}`;
    }

    onChange([
      ...layouts,
      { type: "Custom", name, min: 0, max: 0, onlineBookingUpTo: null },
    ]);
  };

  const handleDeleteCustom = (index) => {
    const target = customLayouts[index];
    const next = layouts.filter((l) => l !== target);
    onChange(next);
  };

  return (
    <div className="room-layouts-editor">
      <div
        className="layout-header"
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1.4fr",
          gap: "0.5rem",
          fontWeight: 600,
          marginBottom: "0.5rem",
        }}
      >
        <div>Layout Type</div>
        <div>Min Capacity</div>
        <div>Max Capacity</div>
        <div>Online booking up to</div>
      </div>

      {/* Predefined layouts */}
      {PREDEFINED_LAYOUT_TYPES.map((type) => (
        <LayoutRow
          key={type}
          label={type}
          layout={getByType(type) || { type, min: 0, max: 0, onlineBookingUpTo: null }}
          onChange={(updated) => updateLayoutByType(type, updated)}
        />
      ))}

      {/* Custom layouts */}
      <div style={{ marginTop: "1rem", marginBottom: "0.5rem" }}>
        <strong>Custom Layouts</strong>
      </div>

      {customLayouts.map((layout, index) => (
        <div
          key={index}
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1.4fr auto",
            gap: "0.5rem",
            alignItems: "start",
            marginBottom: "0.5rem",
          }}
        >
          <div>
            <input
              type="text"
              value={layout.name || ""}
              onChange={(e) => handleCustomChange(index, { name: e.target.value })}
              placeholder="Custom layout name"
            />
          </div>

          <div>
            <input
              type="number"
              min={0}
              value={layout.min ?? 0}
              onChange={(e) =>
                handleCustomChange(index, {
                  min: toNonNegativeInt(e.target.value),
                })
              }
              placeholder="Min"
            />
          </div>

          <div>
            <input
              type="number"
              min={0}
              value={layout.max ?? 0}
              onChange={(e) =>
                handleCustomChange(index, {
                  max: toNonNegativeInt(e.target.value),
                })
              }
              placeholder="Max"
            />
          </div>

          <div>
            <input
              type="number"
              min={0}
              value={
                layout.onlineBookingUpTo === null || layout.onlineBookingUpTo === undefined
                  ? String(layout.max ?? 0)
                  : String(layout.onlineBookingUpTo ?? "")
              }
              onChange={(e) => {
                const v = e.target.value;
                if (v === "") {
                  handleCustomChange(index, { onlineBookingUpTo: null });
                  return;
                }
                const nextMin = toNonNegativeInt(layout.min);
                const nextMax = toNonNegativeInt(layout.max);
                handleCustomChange(index, {
                  onlineBookingUpTo: clamp(toNonNegativeInt(v), nextMin, nextMax),
                });
              }}
              placeholder="Online up to"
            />
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
              Bookings above this number will require manual confirmation (RFQ).
            </div>

            {getEffectiveOnlineUpTo(layout) < toNonNegativeInt(layout.max) ? (
              <div style={{ marginTop: 6 }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "3px 10px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                    border: "1px solid rgba(59, 130, 246, 0.22)",
                    background: "rgba(59, 130, 246, 0.10)",
                    color: "rgba(30, 64, 175, 0.95)",
                  }}
                >
                  RFQ above {getEffectiveOnlineUpTo(layout)}
                </span>
              </div>
            ) : null}
          </div>

          <div style={{ paddingTop: 2 }}>
            <button type="button" onClick={() => handleDeleteCustom(index)}>
              Delete
            </button>
          </div>
        </div>
      ))}

      <button type="button" onClick={handleAddCustom}>
        + Add Custom Layout
      </button>
    </div>
  );
};

export default RoomLayoutsEditor;
