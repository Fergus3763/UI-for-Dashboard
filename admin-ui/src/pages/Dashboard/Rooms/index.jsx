
// admin-ui/src/pages/Dashboard/Rooms/index.jsx
import React, { useEffect, useState } from "react";
import AddOnsTab from "../VenueSetup/Tabs/AddOnsTab";

const TABS = {
  ROOM_SETUP: "roomSetup",
  ADD_ONS: "addOns",
};

export default function Rooms() {
  const [activeTab, setActiveTab] = useState(TABS.ADD_ONS);
  const [addOns, setAddOns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveMessage, setSaveMessage] = useState(null);

  // Load config on mount
  useEffect(() => {
    let isMounted = true;

    async function loadConfig() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/.netlify/functions/load_config");
        if (!response.ok) {
          throw new Error(`Failed to load configuration (status ${response.status})`);
        }
        const json = await response.json();
        const data = json && json.data ? json.data : {};
        const loadedAddOns = Array.isArray(data.addOns) ? data.addOns : [];
        if (!isMounted) return;
        setAddOns(loadedAddOns);
      } catch (err) {
        if (!isMounted) return;
        console.error("Error loading config:", err);
        setError("Could not load configuration. Please try again or contact support.");
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

  // Save handler – accepts optional nextAddOns to avoid stale state issues
  const handleSave = async (nextAddOns) => {
    const payloadAddOns = Array.isArray(nextAddOns) ? nextAddOns : addOns;

    setSaving(true);
    setError(null);
    setSaveMessage(null);

    try {
      const response = await fetch("/.netlify/functions/save_config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ addOns: payloadAddOns }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save configuration (status ${response.status})`);
      }

      setSaveMessage("Add-Ons saved successfully.");
    } catch (err) {
      console.error("Error saving Add-Ons:", err);
      setError("Could not save Add-Ons. Please try again.");
    } finally {
      setSaving(false);
      // Clear save message after a short delay
      setTimeout(() => {
        setSaveMessage(null);
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
          backgroundColor: activeTab === TABS.ROOM_SETUP ? "#f0f0f0" : "#ffffff",
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

  const renderStatus = () => {
    if (loading) {
      return <div style={{ marginBottom: "1rem" }}>Loading configuration…</div>;
    }

    return (
      <>
        {error && (
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
            {error}
          </div>
        )}
        {saveMessage && (
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
            {saveMessage}
          </div>
        )}
      </>
    );
  };

  const renderActiveTab = () => {
    if (activeTab === TABS.ROOM_SETUP) {
      return (
        <div>
          <h2>Room Setup</h2>
          <p>
            Room setup configuration will go here. For this phase, only the Add-Ons Editor is
            implemented under Rooms.
          </p>
        </div>
      );
    }

    return (
      <AddOnsTab
        addOns={addOns}
        setAddOns={setAddOns}
        onSave={handleSave}
        saving={saving}
      />
    );
  };

  return (
    <div style={{ padding: "1.5rem" }}>
      <h1 style={{ marginBottom: "0.5rem" }}>Rooms</h1>
      <p style={{ marginBottom: "1rem", maxWidth: "640px" }}>
        Manage room-related settings. The Add-Ons tab holds the master list of Add-Ons that can be
        attached to room bookings.
      </p>

      {renderTabsNav()}
      {renderStatus()}
      {renderActiveTab()}
    </div>
  );
}
