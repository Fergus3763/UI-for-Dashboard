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

/**
 * Field name remains: onlineBookingUpTo
 * Semantics now: RFQ above X (only applies when X > 0)
 *
 * - null/undefined/"" => treated as 0 (fully online)
 * - 0 => fully online
 * - >0 => RFQ applies when attendees > value (and value is clamped to [min,max])
 */
function getRFQAbove(layout) {
  const min = toNonNegativeInt(layout?.min);
  const max = toNonNegativeInt(layout?.max);
  const raw = layout?.onlineBookingUpTo;

  if (raw === null || raw === undefined || raw === "") return 0;

  const n = toNonNegativeInt(raw);
  if (n <= 0) return 0;

  return clamp(n, min, max);
}

function isRFQExplicitlySet(layout) {
  const raw = layout?.onlineBookingUpTo;
  const n =
    raw === null || raw === undefined || raw === "" ? 0 : toNonNegativeInt(raw);
  return n > 0;
}

const LayoutRow = ({ label, layout, onChange }) => {
  const min = layout?.min ?? 0;
  const max = layout?.max ?? 0;

  const rfqAbove = getRFQAbove(layout);
  const showRFQBadge = isRFQExplicitlySet(layout);

  // Input display:
  // - blank by default (online-first)
  // - show number only if explicitly set (>0), otherwise blank
  const onlineInputValue = showRFQBadge
    ? String(rfqAbove)
    : "";

  const handleMinChange = (value) => {
    const nextMin = toNonNegativeInt(value);
    const nextMax = toNonNegativeInt(layout?.max);

    // Only clamp if explicitly set (>0); otherwise keep as-is (null/0)
    const raw = layout?.onlineBookingUpTo;
    const rawN =
      raw === null || raw === undefined || raw === "" ? 0 : toNonNegativeInt(raw);

    let nextRFQ = raw;
    if (rawN > 0) {
      nextRFQ = clamp(rawN, nextMin, nextMax);
    }

    onChange({
      ...layout,
      min: nextMin,
      max: nextMax,
      onlineBookingUpTo: nextRFQ,
    });
  };

  const handleMaxChange = (value) => {
    const nextMin = toNonNegativeInt(layout?.min);
    const nextMax = toNonNegativeInt(value);

    // Only clamp if explicitly set (>0); otherwise keep as-is (null/0)
    const raw = layout?.onlineBookingUpTo;
    const rawN =
      raw === null || raw === undefined || raw === "" ? 0 : toNonNegativeInt(raw);

    let nextRFQ = raw;
    if (rawN > 0) {
      nextRFQ = clamp(rawN, nextMin, nextMax);
    }

    onChange({
      ...layout,
      min: nextMin,
      max: nextMax,
      onlineBookingUpTo: nextRFQ,
    });
  };

  const handleRFQAboveChange = (value) => {
    const nextMin = toNonNegativeInt(layout?.min);
    const nextMax = toNonNegativeInt(layout?.max);

    // Blank = online-first default (store null)
    if (value === "") {
      onChange({ ...layout, onlineBookingUpTo: null });
      return;
    }

    const parsed = toNonNegativeInt(value);

    // 0 means fully online (keep 0 explicitly if entered)
    if (parsed <= 0) {
      onChange({ ...layout, onlineBookingUpTo: 0 });
      return;
    }

    // >0 means RFQ above this number, clamped to [min,max]
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
          onChange={(e) => handleRFQAboveChange(e.target.value)}
          placeholder="(fully online)"
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
              RFQ above {rfqAbove}
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

    const base =
      existingIndex === -1 ? { type, min: 0, max: 0, onlineBookingUpTo: null } : next[existingIndex];

    const merged = { ...base, ...updated, type };

    const nextMin = toNonNegativeInt(merged.min);
    const nextMax = toNonNegativeInt(merged.max);

    // Preserve online-first default:
    // - null/0 stays null/0
    // - >0 is clamped into [min,max]
    let raw = merged.onlineBookingUpTo;
    if (raw === undefined) raw = null;

    const rawN =
      raw === null || raw === undefined || raw === "" ? 0 : toNonNegativeInt(raw);

    const nextRFQ = rawN > 0 ? clamp(rawN, nextMin, nextMax) : raw;

    const finalLayout = {
      ...merged,
      min: nextMin,
      max: nextMax,
      onlineBookingUpTo: nextRFQ,
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

      let raw = merged.onlineBookingUpTo;
      if (raw === undefined) raw = null;

      const rawN =
        raw === null || raw === undefined || raw === "" ? 0 : toNonNegativeInt(raw);

      const nextRFQ = rawN > 0 ? clamp(rawN, nextMin, nextMax) : raw;

      next[globalIndex] = {
        ...merged,
        min: nextMin,
        max: nextMax,
        onlineBookingUpTo: nextRFQ,
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

    onChange([...layouts, { type: "Custom", name, min: 0, max: 0, onlineBookingUpTo: null }]);
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
        <div>RFQ above</div>
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

      {customLayouts.map((layout, index) => {
        const rfqAbove = getRFQAbove(layout);
        const explicit = isRFQExplicitlySet(layout);

        return (
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
                value={explicit ? String(rfqAbove) : ""}
                onChange={(e) => {
                  const v = e.target.value;

                  if (v === "") {
                    handleCustomChange(index, { onlineBookingUpTo: null });
                    return;
                  }

                  const parsed = toNonNegativeInt(v);
                  if (parsed <= 0) {
                    handleCustomChange(index, { onlineBookingUpTo: 0 });
                    return;
                  }

                  const nextMin = toNonNegativeInt(layout.min);
                  const nextMax = toNonNegativeInt(layout.max);

                  handleCustomChange(index, {
                    onlineBookingUpTo: clamp(parsed, nextMin, nextMax),
                  });
                }}
                placeholder="(fully online)"
              />

              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                Bookings above this number will require manual confirmation (RFQ).
              </div>

              {explicit ? (
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
                    RFQ above {rfqAbove}
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
        );
      })}

      <button type="button" onClick={handleAddCustom}>
        + Add Custom Layout
      </button>
    </div>
  );
};

export default RoomLayoutsEditor;
