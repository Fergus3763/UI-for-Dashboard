// admin-ui/src/pages/Dashboard/Rooms/RoomSetupTab.jsx

import React, { useEffect, useMemo, useState } from "react";
import RoomListPanel from "./RoomListPanel";
import RoomForm from "./RoomForm";
import RoomCalendarPanel from "./RoomCalendarPanel";

const generateUUID = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback (not cryptographically secure, but fine for IDs here)
  return `room_${Math.random().toString(36).slice(2)}_${Date.now()}`;
};

const ROOM_CODE_PREFIX = "RM-";

const extractRoomCodeNumber = (code) => {
  if (!code || typeof code !== "string") return null;
  const match = code.match(/^RM-(\d{3})$/i);
  if (!match) return null;
  return parseInt(match[1], 10);
};

const generateNextRoomCode = (rooms) => {
  const numericParts = rooms
    .map((r) => extractRoomCodeNumber(r.code))
    .filter((n) => typeof n === "number" && !Number.isNaN(n));

  const maxNumber = numericParts.length ? Math.max(...numericParts) : 0;
  const nextNumber = maxNumber + 1;
  const padded = String(nextNumber).padStart(3, "0");
  return `${ROOM_CODE_PREFIX}${padded}`;
};

const isCodeUnique = (rooms, code, roomId) => {
  if (!code) return false;
  return !rooms.some((r) => r.code === code && r.id !== roomId);
};

const RoomSetupTab = ({ rooms, addOns, onSaveRooms, saving }) => {
  const [draftRooms, setDraftRooms] = useState(() => rooms || []);
  const [selectedRoomId, setSelectedRoomId] = useState(
    rooms && rooms.length ? rooms[0].id : null
  );
  const [validationError, setValidationError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // UI-only: collapsible explainer (collapsed by default; never disappears)
  const [explainerExpanded, setExplainerExpanded] = useState(false);

  useEffect(() => {
    // When the rooms prop changes (e.g. after a successful save or page load),
    // sync the local draft state once.
    setDraftRooms(rooms || []);

    // If the currently selected room no longer exists, fall back to the first room.
    if (!rooms || !rooms.length) {
      setSelectedRoomId(null);
    } else if (!rooms.find((r) => r.id === selectedRoomId)) {
      setSelectedRoomId(rooms[0].id);
    }
    // IMPORTANT: do NOT depend on selectedRoomId here, or we will keep
    // resetting local edits whenever selection changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms]);

  const selectedRoom = useMemo(
    () => draftRooms.find((r) => r.id === selectedRoomId) || null,
    [draftRooms, selectedRoomId]
  );

  const handleSelectRoom = (roomId) => {
    setSelectedRoomId(roomId);
    setValidationError(null);
    setSaveSuccess(false);
  };

  const handleNewRoom = () => {
    const newRoom = {
      id: generateUUID(),
      code: generateNextRoomCode(draftRooms),
      name: "",
      description: "",
      active: true,
      images: [],
      features: [],
      layouts: [],
      bufferBefore: 0,
      bufferAfter: 0,
      pricing: {
        perPerson: 0,
        perRoom: 0,
        rule: "higher",
      },
      includedAddOns: [],
      optionalAddOns: [],
    };

    const newRooms = [...draftRooms, newRoom];
    setDraftRooms(newRooms);
    setSelectedRoomId(newRoom.id);
    setValidationError(null);
    setSaveSuccess(false);
  };

  const handleDeleteRoom = () => {
    if (!selectedRoom) return;
    const updated = draftRooms.filter((r) => r.id !== selectedRoom.id);
    setDraftRooms(updated);
    if (updated.length) {
      setSelectedRoomId(updated[0].id);
    } else {
      setSelectedRoomId(null);
    }
    setValidationError(null);
    setSaveSuccess(false);
  };

  const handleUpdateRoom = (updatedRoom) => {
    setDraftRooms((prev) =>
      prev.map((r) => (r.id === updatedRoom.id ? updatedRoom : r))
    );
    setValidationError(null);
    setSaveSuccess(false);
  };

  const validateBeforeSave = () => {
    // Ensure all codes are present and unique
    const codes = new Map();
    for (const room of draftRooms) {
      if (!room.code || typeof room.code !== "string" || !room.code.trim()) {
        return "Each room must have a room code.";
      }
      const trimmed = room.code.trim();
      if (codes.has(trimmed)) {
        return `Room code "${trimmed}" is duplicated. Codes must be unique.`;
      }
      codes.set(trimmed, true);
    }
    return null;
  };

  const handleSave = async () => {
    setSaveSuccess(false);
    const error = validateBeforeSave();
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError(null);
    try {
      const ok = await onSaveRooms(draftRooms);
      if (ok !== false) {
        setSaveSuccess(true);
      }
    } catch (err) {
      console.error("Save error from parent:", err);
      setValidationError("Failed to save rooms. Please try again.");
    }
  };

  const handleCodeChangeWithAutoGeneration = (room, newCode) => {
    let updatedCode = newCode;

    // If admin clears code, auto-generate a new one when saving this field.
    if (!updatedCode || !updatedCode.trim()) {
      updatedCode = generateNextRoomCode(
        draftRooms.filter((r) => r.id !== room.id)
      );
    }

    const updatedRoom = { ...room, code: updatedCode.trim() };

    if (!isCodeUnique(draftRooms, updatedRoom.code, room.id)) {
      setValidationError(
        `Room code "${updatedRoom.code}" is already in use. Please choose a unique code.`
      );
    } else {
      setValidationError(null);
    }

    handleUpdateRoom(updatedRoom);
  };

  return (
    <div>
      {/* Collapsible explainer (UI-only; collapsed by default; never disappears) */}
      <div
        style={{
          marginBottom: "1rem",
          borderRadius: 14,
          border: "1px solid rgba(59, 130, 246, 0.22)",
          background: "rgba(59, 130, 246, 0.06)",
          padding: 14,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 17,
                lineHeight: "20px",
                fontWeight: 880,
                color: "rgba(30, 64, 175, 0.95)",
              }}
            >
              Why this page exists
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 12,
                lineHeight: "16px",
                color: "rgba(17, 24, 39, 0.68)",
              }}
            >
              A short, self-guided explanation (read-only guidance).
            </div>
          </div>

          <button
            type="button"
            onClick={() => setExplainerExpanded((v) => !v)}
            style={{
              border: "1px solid rgba(59, 130, 246, 0.32)",
              background: "rgba(59, 130, 246, 0.10)",
              color: "rgba(30, 64, 175, 0.95)",
              borderRadius: 12,
              padding: "10px 12px",
              fontWeight: 820,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
            aria-expanded={explainerExpanded}
          >
            {explainerExpanded ? "Collapse ▴" : "Expand ▾"}
          </button>
        </div>

        {explainerExpanded ? (
          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            <div>
              <div style={{ fontWeight: 860, color: "rgba(17, 24, 39, 0.92)" }}>
                Why this page exists
              </div>
              <div
                style={{
                  marginTop: 6,
                  color: "rgba(17, 24, 39, 0.70)",
                  lineHeight: "18px",
                }}
              >
                This is where you define the physical reality of your meeting
                rooms.
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 860, color: "rgba(17, 24, 39, 0.92)" }}>
                What data you configure here
              </div>
              <div
                style={{
                  marginTop: 6,
                  color: "rgba(17, 24, 39, 0.70)",
                  lineHeight: "18px",
                }}
              >
                Room names, layouts, capacities, pricing rules, and availability
                characteristics.
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 860, color: "rgba(17, 24, 39, 0.92)" }}>
                How this data is used
              </div>
              <div
                style={{
                  marginTop: 6,
                  color: "rgba(17, 24, 39, 0.70)",
                  lineHeight: "18px",
                }}
              >
                Room definitions power pricing, eligibility for online booking,
                RFQ routing, and what Booker can see and select.
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 860, color: "rgba(17, 24, 39, 0.92)" }}>
                Why this matters
              </div>
              <div
                style={{
                  marginTop: 6,
                  color: "rgba(17, 24, 39, 0.70)",
                  lineHeight: "18px",
                }}
              >
                Accurate room setup is the foundation of trusted pricing and
                confident automation.
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="room-setup" style={{ display: "flex", gap: "1.5rem" }}>
        <RoomListPanel
          rooms={draftRooms}
          selectedRoomId={selectedRoomId}
          onSelectRoom={handleSelectRoom}
          onNewRoom={handleNewRoom}
          onDeleteRoom={handleDeleteRoom}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          {!selectedRoom && (
            <div className="room-setup-empty">
              <p>No rooms defined yet.</p>
              <button type="button" onClick={handleNewRoom}>
                New Room
              </button>
            </div>
          )}

          {selectedRoom && (
            <>
              {validationError && (
                <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
                  {validationError}
                </div>
              )}
              {saveSuccess && !saving && (
                <div className="alert alert-success" style={{ marginBottom: "1rem" }}>
                  Room configuration saved.
                </div>
              )}

              <RoomForm
                room={selectedRoom}
                addOns={addOns}
                onChange={handleUpdateRoom}
                onCodeChange={handleCodeChangeWithAutoGeneration}
              />

              {/* 👇 HUB #8-approved calendar mount point */}
              <RoomCalendarPanel room={selectedRoom} />

              {/* ✅ Anchor target for "Jump to Save" */}
              <div
                id="rooms-save-anchor"
                className="room-setup-actions"
                style={{ marginTop: "1.5rem", textAlign: "right" }}
              >
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !draftRooms.length}
                >
                  {saving ? "Saving…" : "Save All Rooms"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomSetupTab;
