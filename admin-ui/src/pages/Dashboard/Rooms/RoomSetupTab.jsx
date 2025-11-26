// admin-ui/src/pages/Dashboard/Rooms/RoomSetupTab.jsx
// Room configuration UI + embedded blackout manager for the selected room.

import React, { useEffect, useState } from "react";
import RoomBlackoutsPanel from "./RoomBlackoutsPanel";

function createEmptyRoom() {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `room_${Date.now()}`;
  return {
    id,
    code: "",
    name: "",
    description: "",
    capacityMin: 1,
    capacityMax: 20,
    active: true,
  };
}

// Auto-generate next room code in the form RM-001, RM-002, …
function generateNextRoomCode(existingRooms) {
  const prefix = "RM-";
  const numbers = (existingRooms || [])
    .map((r) => (typeof r.code === "string" ? r.code.trim() : ""))
    .map((code) => {
      const match = code.match(/^RM-(\d{3})$/);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((n) => n !== null);

  const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  const padded = String(nextNumber).padStart(3, "0");
  return `${prefix}${padded}`;
}

export default function RoomSetupTab({
  rooms,
  setRooms,
  onSave,
  saving,
  error,
  message,
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(createEmptyRoom());
  const [validationError, setValidationError] = useState(null);

  // Ensure we always have at least one room in view
  useEffect(() => {
    if (!rooms || rooms.length === 0) {
      const initial = [createEmptyRoom()];
      setRooms(initial);
      setSelectedId(initial[0].id);
      setForm(initial[0]);
      return;
    }

    if (!selectedId) {
      setSelectedId(rooms[0].id);
      setForm(rooms[0]);
      return;
    }

    const match = rooms.find((r) => r.id === selectedId);
    if (match) {
      setForm(match);
    } else {
      setSelectedId(rooms[0].id);
      setForm(rooms[0]);
    }
  }, [rooms, selectedId, setRooms]);

  function updateFormField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleSelectRoom(id) {
    if (id === selectedId) return;
    setSelectedId(id);
    const match = rooms.find((r) => r.id === id);
    if (match) {
      setForm(match);
      setValidationError(null);
    }
  }

  function handleNewRoom() {
    const next = createEmptyRoom();
    const nextRooms = [...rooms, next];
    setRooms(nextRooms);
    setSelectedId(next.id);
    setForm(next);
    setValidationError(null);
  }

  function handleDeleteRoom(id) {
    if (!window.confirm("Delete this room?")) return;
    const remaining = rooms.filter((r) => r.id !== id);
    setRooms(remaining);
    if (remaining.length === 0) {
      const next = createEmptyRoom();
      setRooms([next]);
      setSelectedId(next.id);
      setForm(next);
    } else {
      setSelectedId(remaining[0].id);
      setForm(remaining[0]);
    }
  }

  function validate(room, allRooms) {
    if (!room.code.trim()) return "Code is required.";
    if (!room.name.trim()) return "Name is required.";

    // Code must be unique within the rooms array
    const duplicate = (allRooms || []).some(
      (r) => r.id !== room.id && r.code && r.code.trim() === room.code.trim()
    );
    if (duplicate) return "Code must be unique across rooms.";

    const min = Number(room.capacityMin || 0);
    const max = Number(room.capacityMax || 0);
    if (!Number.isFinite(min) || min < 1)
      return "Minimum capacity must be at least 1.";
    if (!Number.isFinite(max) || max < min)
      return "Maximum capacity must be greater than or equal to minimum.";
    return null;
  }

  function handleSaveClick() {
    // Apply auto-code rule if Code is blank: generate RM-XXX
    let updatedRoom = { ...form };
    if (!updatedRoom.code || !updatedRoom.code.trim()) {
      updatedRoom = {
        ...updatedRoom,
        code: generateNextRoomCode(rooms),
      };
    }

    const updatedRooms = rooms.map((r) =>
      r.id === updatedRoom.id ? updatedRoom : r
    );

    const err = validate(updatedRoom, updatedRooms);
    if (err) {
      setValidationError(err);
      return;
    }

    setRooms(updatedRooms);
    setValidationError(null);
    if (onSave) onSave(updatedRooms);
  }

  const activeRoom =
    rooms && rooms.length > 0
      ? rooms.find((r) => r.id === selectedId) || rooms[0]
      : null;

  return (
    <div>
      <h2>Room Setup</h2>
      <p style={{ maxWidth: "640px" }}>
        Define the meeting and event rooms that the hotel offers. These rooms
        and their capacities will later drive availability and pricing in the
        customer-facing Booker. Room codes follow the pattern{" "}
        <code>RM-001</code>, <code>RM-002</code>, and so on. If you leave the
        Code blank, the system will generate the next available code for you.
      </p>

      {/* Status messages from parent save */}
      {error && (
        <div
          style={{
            marginBottom: "0.75rem",
            padding: "0.75rem 1rem",
            border: "1px solid #e57373",
            backgroundColor: "#ffebee",
            borderRadius: "4px",
            color: "#b71c1c",
          }}
        >
          {error}
        </div>
      )}
      {message && (
        <div
          style={{
            marginBottom: "0.75rem",
            padding: "0.75rem 1rem",
            border: "1px solid #81c784",
            backgroundColor: "#e8f5e9",
            borderRadius: "4px",
            color: "#1b5e20",
          }}
        >
          {message}
        </div>
      )}
      {validationError && (
        <div
          style={{
            marginBottom: "0.75rem",
            padding: "0.75rem 1rem",
            border: "1px solid #e57373",
            backgroundColor: "#fff3f3",
            borderRadius: "4px",
            color: "#b71c1c",
          }}
        >
          {validationError}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          gap: "1.5rem",
          alignItems: "flex-start",
          marginTop: "1rem",
        }}
      >
        {/* Room list */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.5rem",
            }}
          >
            <h3 style={{ margin: 0 }}>Rooms</h3>
            <button type="button" onClick={handleNewRoom}>
              + New room
            </button>
          </div>
          {rooms && rooms.length > 0 ? (
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            >
              {rooms.map((room) => (
                <li
                  key={room.id}
                  style={{
                    padding: "0.5rem 0.75rem",
                    borderBottom: "1px solid #eee",
                    backgroundColor:
                      room.id === selectedId ? "#f5f5f5" : "transparent",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                  onClick={() => handleSelectRoom(room.id)}
                >
                  <span>
                    <strong>{room.code || "No code"}</strong> –{" "}
                    {room.name || "Unnamed room"}
                    {!room.active && (
                      <span
                        style={{ marginLeft: "0.25rem", color: "#b71c1c" }}
                      >
                        (inactive)
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRoom(room.id);
                    }}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No rooms defined yet.</p>
          )}
        </div>

        {/* Room form */}
        <div>
          <h3 style={{ marginTop: 0 }}>Room details</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "0.75rem",
            }}
          >
            <div>
              <label>
                Code *
                <br />
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => updateFormField("code", e.target.value)}
                  placeholder="RM-001"
                  style={{ width: "100%" }}
                />
              </label>
            </div>
            <div>
              <label>
                Name *
                <br />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateFormField("name", e.target.value)}
                  placeholder="Boardroom"
                  style={{ width: "100%" }}
                />
              </label>
            </div>
            <div>
              <label>
                Minimum capacity *
                <br />
                <input
                  type="number"
                  min="1"
                  value={form.capacityMin}
                  onChange={(e) =>
                    updateFormField("capacityMin", e.target.value)
                  }
                  style={{ width: "100%" }}
                />
              </label>
            </div>
            <div>
              <label>
                Maximum capacity *
                <br />
                <input
                  type="number"
                  min="1"
                  value={form.capacityMax}
                  onChange={(e) =>
                    updateFormField("capacityMax", e.target.value)
                  }
                  style={{ width: "100%" }}
                />
              </label>
            </div>
          </div>

          <div style={{ marginTop: "0.75rem" }}>
            <label>
              Description
              <br />
              <textarea
                value={form.description}
                onChange={(e) =>
                  updateFormField("description", e.target.value)
                }
                rows={3}
                style={{ width: "100%" }}
              />
            </label>
          </div>

          <div style={{ marginTop: "0.5rem" }}>
            <label>
              <input
                type="checkbox"
                checked={!!form.active}
                onChange={(e) => updateFormField("active", e.target.checked)}
              />{" "}
              Active (visible to Booker)
            </label>
          </div>

          <button
            type="button"
            onClick={handleSaveClick}
            disabled={saving}
            style={{ marginTop: "0.75rem" }}
          >
            {saving ? "Saving…" : "Save rooms"}
          </button>
        </div>
      </div>

      {/* Blackout management for the active room */}
      <RoomBlackoutsPanel room={activeRoom} />
    </div>
  );
}
