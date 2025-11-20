// admin-ui/src/pages/Dashboard/Rooms/RoomSetupTab.jsx
// NOTE: Room Setup tab component. Receives rooms, setRooms and onSave from Rooms/index.jsx.
// This component does not make API calls; it only manages local UI state.

import React, { useMemo, useState } from "react";

function createId() {
  return (
    Date.now().toString(36) + Math.random().toString(36).substring(2, 10)
  ).toUpperCase();
}

function normaliseRoom(room) {
  return {
    id: room.id || createId(),
    code: room.code || "",
    name: room.name || "",
    description: room.description || "",
    capacityMin:
      typeof room.capacityMin === "number" && room.capacityMin >= 1
        ? room.capacityMin
        : 1,
    capacityMax:
      typeof room.capacityMax === "number" && room.capacityMax >= 1
        ? room.capacityMax
        : 1,
    active: typeof room.active === "boolean" ? room.active : true,
  };
}

function getNextRoomCode(rooms) {
  let maxNumber = 0;
  (rooms || []).forEach((r) => {
    if (typeof r.code !== "string") return;
    const match = r.code.match(/R-(\d+)$/);
    if (!match) return;
    const num = parseInt(match[1], 10);
    if (!Number.isNaN(num) && num > maxNumber) {
      maxNumber = num;
    }
  });
  const next = maxNumber + 1;
  return `R-${String(next).padStart(3, "0")}`;
}

export default function RoomSetupTab({
  rooms,
  setRooms,
  onSave,
  saving = false,
}) {
  const [editingId, setEditingId] = useState(null); // null, "new", or existing id
  const [formState, setFormState] = useState({
    id: null,
    code: "",
    name: "",
    description: "",
    capacityMin: "1",
    capacityMax: "1",
    active: true,
  });
  const [formErrors, setFormErrors] = useState({});

  const normalisedRooms = useMemo(
    () => (Array.isArray(rooms) ? rooms : []).map(normaliseRoom),
    [rooms]
  );

  const startNewRoom = () => {
    const suggestedCode = getNextRoomCode(normalisedRooms);
    setEditingId("new");
    setFormErrors({});
    setFormState({
      id: null,
      code: suggestedCode,
      name: "",
      description: "",
      capacityMin: "1",
      capacityMax: "1",
      active: true,
    });
  };

  const startEditRoom = (room) => {
    const n = normaliseRoom(room);
    setEditingId(n.id);
    setFormErrors({});
    setFormState({
      id: n.id,
      code: n.code,
      name: n.name,
      description: n.description || "",
      capacityMin: String(n.capacityMin),
      capacityMax: String(n.capacityMax),
      active: n.active,
    });
  };

  const handleDeleteRoom = (roomId) => {
    const nextRooms = (rooms || []).filter((r) => r.id !== roomId);
    setRooms(nextRooms);
    if (typeof onSave === "function") {
      onSave(nextRooms);
    }
    if (editingId === roomId) {
      setEditingId(null);
      setFormState((prev) => ({
        ...prev,
        id: null,
        code: "",
        name: "",
        description: "",
        capacityMin: "1",
        capacityMax: "1",
        active: true,
      }));
    }
  };

  const handleFieldChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const errors = {};
    const trimmedCode = (formState.code || "").trim();
    const trimmedName = (formState.name || "").trim();
    const min = parseInt(formState.capacityMin, 10);
    const max = parseInt(formState.capacityMax, 10);

    if (!trimmedCode) {
      errors.code = "Code is required.";
    }

    if (!trimmedName) {
      errors.name = "Name is required.";
    }

    if (Number.isNaN(min) || min < 1) {
      errors.capacityMin = "Minimum capacity must be a number greater than or equal to 1.";
    }

    if (Number.isNaN(max)) {
      errors.capacityMax = "Maximum capacity must be a number.";
    } else if (!errors.capacityMin && max < min) {
      errors.capacityMax = "Maximum capacity must be greater than or equal to minimum capacity.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const buildRoomFromForm = () => {
    const min = parseInt(formState.capacityMin, 10);
    const max = parseInt(formState.capacityMax, 10);

    return {
      id: formState.id || createId(),
      code: (formState.code || "").trim(),
      name: (formState.name || "").trim(),
      description: formState.description || "",
      capacityMin: Number.isNaN(min) || min < 1 ? 1 : min,
      capacityMax: Number.isNaN(max) || max < 1 ? 1 : max,
      active: !!formState.active,
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const builtRoom = buildRoomFromForm();

    let nextRooms;
    if (editingId && editingId !== "new") {
      nextRooms = (rooms || []).map((r) =>
        r.id === editingId ? builtRoom : r
      );
    } else {
      nextRooms = [...(rooms || []), builtRoom];
    }

    setRooms(nextRooms);

    if (typeof onSave === "function") {
      onSave(nextRooms);
    }

    setEditingId(null);
    setFormErrors({});
    setFormState({
      id: null,
      code: "",
      name: "",
      description: "",
      capacityMin: "1",
      capacityMax: "1",
      active: true,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormErrors({});
    setFormState({
      id: null,
      code: "",
      name: "",
      description: "",
      capacityMin: "1",
      capacityMax: "1",
      active: true,
    });
  };

  const renderRoomsTable = () => {
    if (!normalisedRooms.length) {
      return (
        <p style={{ fontStyle: "italic" }}>
          No rooms defined yet. Click &ldquo;New room&rdquo; to add your first
          room.
        </p>
      );
    }

    return (
      <div style={{ overflowX: "auto", marginBottom: "1.25rem" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.9rem",
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Code</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Capacity (Min–Max)</th>
              <th style={thStyle}>Active?</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {normalisedRooms.map((room) => (
              <tr key={room.id}>
                <td style={tdStyle}>{room.code}</td>
                <td style={tdStyle}>{room.name}</td>
                <td style={tdStyle}>
                  {room.capacityMin} – {room.capacityMax}
                </td>
                <td style={tdStyle}>{room.active ? "Yes" : "No"}</td>
                <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                  <button
                    type="button"
                    onClick={() => startEditRoom(room)}
                    style={smallButtonStyle}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteRoom(room.id)}
                    style={{ ...smallButtonStyle, marginLeft: "0.5rem" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderForm = () => {
    if (!editingId) {
      return null;
    }

    const { code, name, description, capacityMin, capacityMax, active } =
      formState;

    const isNew = editingId === "new";

    return (
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "4px",
          padding: "1rem",
          marginBottom: "1.25rem",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "0.75rem" }}>
          {isNew ? "New room" : "Edit room"}
        </h3>
        <form onSubmit={handleSubmit}>
          {/* Code & Name */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "0.75rem" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>
                Code *
                <input
                  type="text"
                  value={code}
                  onChange={(e) => handleFieldChange("code", e.target.value)}
                  style={inputStyle}
                />
              </label>
              {formErrors.code && (
                <div style={errorTextStyle}>{formErrors.code}</div>
              )}
              <div style={{ fontSize: "0.8rem", color: "#555" }}>
                Short identifier for the room, for example R-001.
              </div>
            </div>

            <div style={{ flex: 2 }}>
              <label style={labelStyle}>
                Name *
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  style={inputStyle}
                />
              </label>
              {formErrors.name && (
                <div style={errorTextStyle}>{formErrors.name}</div>
              )}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: "0.75rem" }}>
            <label style={labelStyle}>
              Description
              <textarea
                value={description}
                onChange={(e) =>
                  handleFieldChange("description", e.target.value)
                }
                style={{ ...inputStyle, minHeight: "70px", resize: "vertical" }}
              />
            </label>
          </div>

          {/* Capacity & Active */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "0.75rem" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>
                Capacity – Min *
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={capacityMin}
                  onChange={(e) =>
                    handleFieldChange("capacityMin", e.target.value)
                  }
                  style={inputStyle}
                />
              </label>
              {formErrors.capacityMin && (
                <div style={errorTextStyle}>{formErrors.capacityMin}</div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>
                Capacity – Max *
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={capacityMax}
                  onChange={(e) =>
                    handleFieldChange("capacityMax", e.target.value)
                  }
                  style={inputStyle}
                />
              </label>
              {formErrors.capacityMax && (
                <div style={errorTextStyle}>{formErrors.capacityMax}</div>
              )}
            </div>
            <div style={{ flex: 1, paddingTop: "1.5rem" }}>
              <label style={{ ...labelStyle, display: "inline-flex", gap: "0.25rem" }}>
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) =>
                    handleFieldChange("active", e.target.checked)
                  }
                />
                Active
              </label>
              <div style={{ fontSize: "0.8rem", color: "#555" }}>
                Inactive rooms stay in config but are hidden from the Booker.
              </div>
            </div>
          </div>

          {/* Form actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "0.4rem 0.9rem",
                borderRadius: "4px",
                border: "1px solid #1976d2",
                backgroundColor: "#1976d2",
                color: "#ffffff",
                cursor: saving ? "default" : "pointer",
                fontSize: "0.9rem",
              }}
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              style={{
                padding: "0.4rem 0.9rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
                backgroundColor: "#ffffff",
                cursor: saving ? "default" : "pointer",
                fontSize: "0.9rem",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div>
      <h2 style={{ marginTop: 0, marginBottom: "0.5rem" }}>Room Setup</h2>
      <p style={{ marginBottom: "1rem", maxWidth: "720px" }}>
        This configuration controls the meeting and event rooms that the Booker
        can use. Define each space once, including its code, name, capacity and
        whether it is currently active.
      </p>

      <div
        style={{
          marginBottom: "0.75rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ margin: 0 }}>Rooms</h3>
        <button
          type="button"
          onClick={startNewRoom}
          style={{
            padding: "0.4rem 0.9rem",
            borderRadius: "4px",
            border: "1px solid #1976d2",
            backgroundColor: "#1976d2",
            color: "#ffffff",
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          + New room
        </button>
      </div>

      {renderRoomsTable()}
      {renderForm()}
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  borderBottom: "1px solid #ddd",
  padding: "0.5rem",
  fontWeight: 600,
};

const tdStyle = {
  borderBottom: "1px solid #eee",
  padding: "0.5rem",
  verticalAlign: "top",
};

const labelStyle = {
  display: "block",
  fontSize: "0.85rem",
  fontWeight: 600,
  marginBottom: "0.25rem",
};

const inputStyle = {
  width: "100%",
  padding: "0.3rem 0.4rem",
  borderRadius: "3px",
  border: "1px solid #ccc",
  fontSize: "0.9rem",
  boxSizing: "border-box",
};

const errorTextStyle = {
  color: "#b71c1c",
  fontSize: "0.8rem",
  marginTop: "0.1rem",
};

const smallButtonStyle = {
  padding: "0.25rem 0.6rem",
  borderRadius: "3px",
  border: "1px solid #ccc",
  backgroundColor: "#ffffff",
  cursor: "pointer",
  fontSize: "0.8rem",
};
