// admin-ui/src/pages/Dashboard/Rooms/RoomListPanel.jsx

import React from "react";

const RoomListPanel = ({
  rooms,
  selectedRoomId,
  onSelectRoom,
  onNewRoom,
  onDeleteRoom,
}) => {
  return (
    <aside
      className="room-list-panel"
      style={{
        width: "260px",
        borderRight: "1px solid #ddd",
        paddingRight: "1rem",
      }}
    >
      <div
        className="room-list-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.75rem",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "1rem" }}>Rooms</h3>
        <button type="button" onClick={onNewRoom}>
          + New
        </button>
      </div>

      <ul
        className="room-list"
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          maxHeight: "400px",
          overflowY: "auto",
        }}
      >
        {rooms.map((room) => {
          const isSelected = room.id === selectedRoomId;
          return (
            <li
              key={room.id}
              onClick={() => onSelectRoom(room.id)}
              style={{
                padding: "0.5rem 0.75rem",
                marginBottom: "0.25rem",
                cursor: "pointer",
                borderRadius: "4px",
                backgroundColor: isSelected ? "#eef4ff" : "transparent",
                border: isSelected ? "1px solid #4b6fff" : "1px solid #eee",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {room.code || "(no code)"}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#555" }}>
                    {room.name || "(Unnamed room)"}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    padding: "0.1rem 0.4rem",
                    borderRadius: "999px",
                    backgroundColor: room.active ? "#e3f8e5" : "#f5e3e3",
                    color: room.active ? "#195b26" : "#8b2222",
                  }}
                >
                  {room.active ? "Active" : "Inactive"}
                </span>
              </div>
            </li>
          );
        })}

        {!rooms.length && (
          <li style={{ fontSize: "0.9rem", color: "#666" }}>
            No rooms yet. Click “New” to create one.
          </li>
        )}
      </ul>

      <div style={{ marginTop: "1rem" }}>
        <button
          type="button"
          onClick={onDeleteRoom}
          disabled={!selectedRoomId}
          style={{ width: "100%" }}
        >
          Delete Selected
        </button>
      </div>
    </aside>
  );
};

export default RoomListPanel;
