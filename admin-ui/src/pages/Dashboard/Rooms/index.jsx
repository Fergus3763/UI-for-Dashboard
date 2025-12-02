// admin-ui/src/pages/Dashboard/Rooms/index.jsx

import React, { useEffect, useMemo, useState } from "react";
import RoomSetupTab from "./RoomSetupTab";
import AddOnsTab from "../VenueSetup/Tabs/AddOnsTab";

const RoomsPage = () => {
  const [config, setConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [configError, setConfigError] = useState(null);

  const [savingRooms, setSavingRooms] = useState(false);
  const [saveRoomsError, setSaveRoomsError] = useState(null);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  const [savingConfig, setSavingConfig] = useState(false);
  const [saveConfigError, setSaveConfigError] = useState(null);

  const [activeTab, setActiveTab] = useState("ROOMS");

  // Convenience selectors
  const rooms = useMemo(
    () => (Array.isArray(config?.rooms) ? config.rooms : []),
    [config]
  );
  const addOns = useMemo(
    () => (Array.isArray(config?.addOns) ? config.addOns : []),
    [config]
  );

  // Load config once on mount
  const loadConfig = async () => {
    setLoadingConfig(true);
    setConfigError(null);

    try {
      const res = await fetch("/.netlify/functions/load_config");
      if (!res.ok) {
        throw new Error(`load_config failed: ${res.status}`);
      }

      const json = await res.json();
      // Real shape is: { ok, id, data }
      const data = json?.data || {};

      setConfig(data);
    } catch (err) {
      console.error("Error loading config:", err);
      setConfigError(err.message || "Failed to load configuration.");
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  // Save only rooms[]
  const handleSaveRooms = async (nextRooms) => {
    if (!config) return false;

    setSavingRooms(true);
    setSaveRoomsError(null);

    try {
      const res = await fetch("/.netlify/functions/save_config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rooms: nextRooms }),
      });

      if (!res.ok) {
        throw new Error(`save_config failed: ${res.status}`);
      }

      const json = await res.json();
      if (json?.error) {
        throw new Error(json.error);
      }

      // keep local config in sync
      setConfig((prev) => ({
        ...(prev || {}),
        rooms: nextRooms,
      }));

      setLastSavedAt(new Date());
      return true;
    } catch (err) {
      console.error("Error saving rooms:", err);
      setSaveRoomsError(err.message || "Failed to save rooms.");
      return false;
    } finally {
      setSavingRooms(false);
    }
  };

  // Save only addOns[] (for the Add-Ons tab)
  const handleSaveFullConfig = async (nextConfig) => {
    setSavingConfig(true);
    setSaveConfigError(null);

    try {
      const nextAddOns = Array.isArray(nextConfig.addOns)
        ? nextConfig.addOns
        : [];

      const res = await fetch("/.netlify/functions/save_config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addOns: nextAddOns }),
      });

      if (!res.ok) {
        throw new Error(`save_config failed: ${res.status}`);
      }

      const json = await res.json();
      if (json?.error) {
        throw new Error(json.error);
      }

      setConfig((prev) => ({
        ...(prev || {}),
        addOns: nextAddOns,
      }));
    } catch (err) {
      console.error("Error saving add-ons:", err);
      setSaveConfigError(err.message || "Failed to save add-ons.");
    } finally {
      setSavingConfig(false);
    }
  };

  // Loading / error guard rails
  if (loadingConfig) {
    return <div>Loading configuration…</div>;
  }

  if (configError) {
    return (
      <div>
        <p>Failed to load configuration. Please try again.</p>
        <pre style={{ color: "red" }}>{configError}</pre>
      </div>
    );
  }

  return (
    <div>
      <h1>Room Setup</h1>

      {saveRoomsError && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          Error saving rooms: {saveRoomsError}
        </div>
      )}

      {lastSavedAt && (
        <div style={{ color: "green", marginBottom: "1rem" }}>
          Rooms saved at{" "}
          {lastSavedAt.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </div>
      )}

      {/* Tabs header */}
      <div style={{ marginTop: "1.5rem" }}>
        <div style={{ borderBottom: "1px solid #ccc", marginBottom: "1rem" }}>
          <button
            type="button"
            onClick={() => setActiveTab("ROOMS")}
            style={{
              padding: "0.5rem 1rem",
              border: "none",
              borderBottom:
                activeTab === "ROOMS"
                  ? "3px solid #000"
                  : "3px solid transparent",
              background: "transparent",
              cursor: "pointer",
              fontWeight: activeTab === "ROOMS" ? "bold" : "normal",
            }}
          >
            Room Setup
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ADDONS")}
            style={{
              padding: "0.5rem 1rem",
              border: "none",
              borderBottom:
                activeTab === "ADDONS"
                  ? "3px solid #000"
                  : "3px solid transparent",
              background: "transparent",
              cursor: "pointer",
              fontWeight: activeTab === "ADDONS" ? "bold" : "normal",
            }}
          >
            Add-Ons
          </button>
        </div>

        {/* Room Setup tab */}
        {activeTab === "ROOMS" && (
          <RoomSetupTab
            rooms={rooms}
            addOns={addOns}
            onSaveRooms={handleSaveRooms}
            saving={savingRooms}
          />
        )}

        {/* Add-Ons tab (reused from Venue) */}
        {activeTab === "ADDONS" && (
          <AddOnsTab
            config={config}
            onConfigChange={setConfig}
            onSaveConfig={handleSaveFullConfig}
            saving={savingConfig}
            error={saveConfigError}
          />
        )}
      </div>
    </div>
  );
};

export default RoomsPage;
