// admin-ui/src/pages/Dashboard/Rooms/RoomLayoutsEditor.jsx

import React from "react";

const PREDEFINED_LAYOUT_TYPES = [
  "Boardroom",
  "U-Shape",
  "Theatre",
  "Classroom",
  "Banquet",
];

const LayoutRow = ({ label, layout, onChange }) => {
  const min = layout?.min ?? "";
  const max = layout?.max ?? "";

  const handleMinChange = (value) => {
    const parsed = value === "" ? "" : Math.max(0, parseInt(value, 10) || 0);
    onChange({ ...layout, min: parsed === "" ? 0 : parsed });
  };

  const handleMaxChange = (value) => {
    const parsed = value === "" ? "" : Math.max(0, parseInt(value, 10) || 0);
    onChange({ ...layout, max: parsed === "" ? 0 : parsed });
  };

  return (
    <div
      className="layout-row"
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr 1fr",
        gap: "0.5rem",
        alignItems: "center",
        marginBottom: "0.5rem",
      }}
    >
      <div>{label}</div>
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
    </div>
  );
};

const RoomLayoutsEditor = ({ layouts, onChange }) => {
  const getByType = (type) => layouts.find((l) => l.type === type);

  const updateLayoutByType = (type, updated) => {
    let next = [...layouts];
    const existingIndex = next.findIndex((l) => l.type === type);
    if (existingIndex === -1) {
      next.push({ type, min: updated.min || 0, max: updated.max || 0 });
    } else {
      next[existingIndex] = { ...next[existingIndex], ...updated, type };
    }
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
      next[globalIndex] = { ...next[globalIndex], ...updated, type: "Custom" };
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
      { type: "Custom", name, min: 0, max: 0 },
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
          gridTemplateColumns: "2fr 1fr 1fr",
          gap: "0.5rem",
          fontWeight: 600,
          marginBottom: "0.5rem",
        }}
      >
        <div>Layout Type</div>
        <div>Min Capacity</div>
        <div>Max Capacity</div>
      </div>

      {/* Predefined layouts */}
      {PREDEFINED_LAYOUT_TYPES.map((type) => (
        <LayoutRow
          key={type}
          label={type}
          layout={getByType(type) || { type, min: 0, max: 0 }}
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
            gridTemplateColumns: "2fr 1fr 1fr auto",
            gap: "0.5rem",
            alignItems: "center",
            marginBottom: "0.5rem",
          }}
        >
          <div>
            <input
              type="text"
              value={layout.name || ""}
              onChange={(e) =>
                handleCustomChange(index, { name: e.target.value })
              }
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
                  min: Math.max(0, parseInt(e.target.value, 10) || 0),
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
                  max: Math.max(0, parseInt(e.target.value, 10) || 0),
                })
              }
              placeholder="Max"
            />
          </div>
          <div>
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
