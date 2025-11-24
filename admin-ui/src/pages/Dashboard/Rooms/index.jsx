// admin-ui/src/pages/Dashboard/Rooms/index.jsx
import React, { useEffect, useState } from "react";
import RoomSetupTab from "./RoomSetupTab";
import AddOnsTab from "../VenueSetup/Tabs/AddOnsTab";

const TABS = {
  ROOM_SETUP: "roomSetup",
  ADD_ONS: "addOns",
};

export default function Rooms() {
  const [activeTab, setActiveTab] = useState(TABS.ROOM_SETUP);

  const [rooms, setRooms] = useState([]);
  const [addOns, setAddOns] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [roomsSaving, setRoomsSaving] = useState(false);
  const [roomsError, setRoomsError] = useState(null);
  const [roomsMessage, setRoomsMessage] = useState(null);

  const [addOnsSaving, setAddOnsSaving] = useState(false);
  const [addOnsError, setAddOnsError] = useState(null);
  const [addOnsMessage, setAddOnsMessage] = useState(null);

  // Load config (rooms + addOns) on mount
  useEffect(() => {
    let isMounted = true;

    async function loadConfig() {
      setLoading(true);
      setLoadError(null);

      try {
        const response = await fetch("/.netlify/functions/load_config");
        if (!response.ok) {
          throw new Error(
            `Failed to load configuration (status ${response.status})`
          );
        }

        const json = await response.json();
        const data = json && json.data ? json.data : {};

        const loadedRooms = Array.isArray(data.rooms) ? data.rooms : [];
        const loadedAddOns = Array.isArray(data.addOns) ? data.addOns : [];

        if (!isMounted) return;

        setRooms(loadedRooms);
        setAddOns(loadedAddOns);
      } catch (err) {
        console.error("Error loading Rooms configuration:", err);
        if (!isMounted) return;
        setLoadError(
          "Could not load room configuration. Please try again or contact support."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  // Save handler for ROOMS – posts { rooms: [...] }
  const handleSaveRooms = async (nextRooms) => {
    const payloadRooms = Array.isArray(nextRooms) ? nextRooms : rooms;

    setRoomsSaving(true);
    setRoomsError(null);
    setRoomsMessage(null);

    try {
      const response = await fetch("/.netlify/functions/save_config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rooms: payloadRooms }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to save room configuration (status ${response.status})`
        );
      }

      setRooms(payloadRooms);
      setRoomsMessage("Rooms saved successfully.");
    } catch (err) {
      console.error("Error saving Rooms:", err);
      setRoomsError("Could not save rooms. Please try again.");
    } finally {
      setRoomsSaving(false);
      setTimeout(() => {
        setRoomsMessage(null);
      }, 4000);
    }
  };

  // Save handler for ADD-ONS – posts { addOns: [...] } (unchanged behaviour)
  const handleSaveAddOns = async (nextAddOns) => {
    const payloadAddOns = Array.isArray(nextAddOns) ? nextAddOns : addOns;

    setAddOnsSaving(true);
    setAddOnsError(null);
    setAddOnsMessage(null);

    try {
      const response = await fetch("/.netlify/functions/save_config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ addOns: payloadAddOns }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to save Add-Ons configuration (status ${response.status})`
        );
      }

      setAddOns(payloadAddOns);
      setAddOnsMessage("Add-Ons saved successfully.");
    } catch (err) {
      console.error("Error saving Add-Ons:", err);
      setAddOnsError("Could not save Add-Ons. Please try again.");
    } finally {
      setAddOnsSaving(false);
      setTimeout(() => {
        setAddOnsMessage(null);
      }, 4000);
    }
  };

  const renderTabsNav = () => (
    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
      <button
        type="button"
        onClick={() => setActiveTab(TABS.ROOM_SETUP)}
        style={{
          padding: "0.5rem 1rem",
          borderRadius: "4px",
          border: "1px solid #ccc",
          backgroundColor:
            activeTab === TABS.ROOM_SETUP ? "#f0f0f0" : "#ffffff",
          cursor: "pointer",
        }}
      >
        Room Setup
      </button>
      <button
        type="button"
        onClick={() => setActiveTab(TABS.ADD_ONS)}
        style={{
          padding: "0.5rem 1rem",
          borderRadius: "4px",
          border: "1px solid #ccc",
          backgroundColor: activeTab === TABS.ADD_ONS ? "#f0f0f0" : "#ffffff",
          cursor: "pointer",
        }}
      >
        Add-Ons
      </button>
    </div>
  );

  const renderLoadStatus = () => {
    if (loading) {
      return (
        <div style={{ marginBottom: "1rem" }}>Loading configuration…</div>
      );
    }
    if (loadError) {
      return (
        <div
          style={{
            marginBottom: "1rem",
            padding: "0.75rem 1rem",
            border: "1px solid #e57373",
            backgroundColor: "#ffebee",
            borderRadius: "4px",
            color: "#b71c1c",
          }}
        >
          {loadError}
        </div>
      );
    }
    return null;
  };

  const renderActiveTab = () => {
    if (activeTab === TABS.ADD_ONS) {
      return (
        <>
          {addOnsError && (
            <div
              style={{
                marginBottom: "1rem",
                padding: "0.75rem 1rem",
                border: "1px solid #e57373",
                backgroundColor: "#ffebee",
                borderRadius: "4px",
                color: "#b71c1c",
              }}
            >
              {addOnsError}
            </div>
          )}
          {addOnsMessage && (
            <div
              style={{
                marginBottom: "1rem",
                padding: "0.75rem 1rem",
                border: "1px solid #81c784",
                backgroundColor: "#e8f5e9",
                borderRadius: "4px",
                color: "#1b5e20",
              }}
            >
              {addOnsMessage}
            </div>
          )}
          <AddOnsTab
            addOns={addOns}
            setAddOns={setAddOns}
            onSave={handleSaveAddOns}
            saving={addOnsSaving}
          />
        </>
      );
    }

    // Room Setup tab
    return (
      <>
        {roomsError && (
          <div
            style={{
              marginBottom: "1rem",
              padding: "0.75rem 1rem",
              border: "1px solid #e57373",
              backgroundColor: "#ffebee",
              borderRadius: "4px",
              color: "#b71c1c",
            }}
          >
            {roomsError}
          </div>
        )}
        {roomsMessage && (
          <div
            style={{
              marginBottom: "1rem",
              padding: "0.75rem 1rem",
              border: "1px solid #81c784",
              backgroundColor: "#e8f5e9",
              borderRadius: "4px",
              color: "#1b5e20",
            }}
          >
            {roomsMessage}
          </div>
        )}
        <RoomSetupTab
          rooms={rooms}
          setRooms={setRooms}
          onSave={handleSaveRooms}
          saving={roomsSaving}
        />
      </>
    );
  };

  return (
    <div style={{ padding: "1.5rem" }}>
      <h1 style={{ marginBottom: "0.5rem" }}>Rooms</h1>
      <p style={{ marginBottom: "1rem", maxWidth: "640px" }}>
        Manage your meeting and event rooms and the Add-Ons that can be attached
        to them. The Room Setup tab defines the room inventory; the Add-Ons tab
        manages the shared add-on catalogue.
      </p>

      {renderTabsNav()}
      {renderLoadStatus()}
      {!loading && !loadError && renderActiveTab()}
    </div>
  );
}
