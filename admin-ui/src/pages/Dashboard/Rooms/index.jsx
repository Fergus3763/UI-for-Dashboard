// admin-ui/src/pages/Dashboard/Rooms/index.jsx

import React, { useEffect, useMemo, useState } from "react";
import RoomSetupTab from "./RoomSetupTab";
import AddOnsTab from "../VenueSetup/Tabs/AddOnsTab";

const CONFIG_KEY = "default";

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

  const rooms = useMemo(() => config?.rooms ?? [], [config]);
  const addOns = useMemo(() => config?.addOns ?? [], [config]);

  // ----- Normalisation helpers ------------------------------------------------

  const normaliseRoom = (room) => {
    const withDefaults = {
      id: room.id ?? (crypto.randomUUID ? crypto.randomUUID() : `room_${Date.now()}`),
      code: room.code ?? "",
      name: room.name ?? "",
      description: room.description ?? "",
      active: room.active ?? true,
      capacityMin: room.capacityMin ?? 0,
      capacityMax: room.capacityMax ?? 0,
      images: Array.isArray(room.images) ? room.images : [],
      layouts: Array.isArray(room.layouts) ? room.layouts : [],
      perPersonRate:
        room.perPersonRate != null ? Number(room.perPersonRate) : null,
      flatRoomRate:
        room.flatRoomRate != null ? Number(room.flatRoomRate) : null,
      priceRule: room.priceRule ?? null,
      bufferBeforeMinutes: room.bufferBeforeMinutes ?? 0,
      bufferAfterMinutes: room.bufferAfterMinutes ?? 0,
      includedAddOnIds: Array.isArray(room.includedAddOnIds)
        ? room.includedAddOnIds
        : [],
      optionalAddOnIds: Array.isArray(room.optionalAddOnIds)
        ? room.optionalAddOnIds
        : [],
    };

    // Derive overall capacity from layouts if they exist
    if (withDefaults.layouts.length > 0) {
      const mins = withDefaults.layouts
        .map((l) => Number(l.capacityMin ?? 0))
        .filter((n) => !Number.isNaN(n) && n > 0);
      const maxs = withDefaults.layouts
        .map((l) => Number(l.capacityMax ?? 0))
        .filter((n) => !Number.isNaN(n) && n > 0);

      if (mins.length > 0) {
        withDefaults.capacityMin = Math.min(...mins);
      }
      if (maxs.length > 0) {
        withDefaults.capacityMax = Math.max(...maxs);
      }
    }

    return withDefaults;
  };

  const normaliseConfig = (raw) => {
    if (!raw || typeof raw !== "object") return { rooms: [], addOns: [] };

    return {
      ...raw,
      rooms: Array.isArray(raw.rooms)
        ? raw.rooms.map((room) => normaliseRoom(room))
        : [],
      addOns: Array.isArray(raw.addOns) ? raw.addOns : [],
    };
  };

  // ----- Load config ----------------------------------------------------------

  const loadConfig = async () => {
    setLoadingConfig(true);
    setConfigError(null);

    try {
      const res = await fetch("/.netlify/functions/load_config");
      if (!res.ok) {
        throw new Error(`load_config failed: ${res.status}`);
      }

      const payload = await res.json();
      const rawConfig = payload?.data ?? payload;
      const normalised = normaliseConfig(rawConfig);

      setConfig(normalised);
    } catch (err) {
      console.error("Error loading config:", err);
      setConfigError(err.message || "Failed to load configuration.");
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    loadConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----- Save handlers --------------------------------------------------------

  // Save just the rooms array (Room Setup tab)
  const handleSaveRooms = async (nextRooms) => {
    if (!config) return;

    setSavingRooms(true);
    setSaveRoomsError(null);

    try {
      const payload = {
        key: CONFIG_KEY,
        rooms: nextRooms,
      };

      const res = await fetch("/.netlify/functions/save_config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`save_config failed: ${res.status}`);
      }

      const payloadJson = await res.json();
      if (payloadJson?.error) {
        throw new Error(payloadJson.error);
      }

      setConfig((prev) => ({
        ...(prev || {}),
        rooms: nextRooms,
      }));

      setLastSavedAt(new Date());
    } catch (err) {
      console.error("Error saving rooms:", err);
      setSaveRoomsError(err.message || "Failed to save rooms.");
    } finally {
      setSavingRooms(false);
    }
  };

  // Save full config from Add-Ons tab (at minimum addOns; may also touch rooms)
  const handleSaveFullConfig = async (nextConfig) => {
    const safeConfig = nextConfig || config;
    if (!safeConfig) return;

    setSavingConfig(true);
    setSaveConfigError(null);

    try {
      const payload = {
        key: CONFIG_KEY,
        // allow the Add-Ons tab to update both addOns and rooms if needed
        addOns: Array.isArray(safeConfig.addOns) ? safeConfig.addOns : [],
        rooms: Array.isArray(safeConfig.rooms) ? safeConfig.rooms : rooms,
      };

      const res = await fetch("/.netlify/functions/save_config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`save_config failed: ${res.status}`);
      }

      const json = await res.json();
      if (json?.error) {
        throw new Error(json.error);
      }

      // Keep local state in sync
      setConfig((prev) =>
        normaliseConfig({
          ...(prev || {}),
          ...safeConfig,
          addOns: payload.addOns,
          rooms: payload.rooms,
        })
      );
    } catch (err) {
      console.error("Error saving full config (add-ons):", err);
      setSaveConfigError(err.message || "Failed to save add-ons.");
    } finally {
      setSavingConfig(false);
    }
  };

  // ----- Render ---------------------------------------------------------------

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
        <div
          style={{
            borderBottom: "1px solid #ccc",
            marginBottom: "1rem",
            display: "flex",
            gap: "0.5rem",
          }}
        >
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

        {/* Room Setup tab content */}
        {activeTab === "ROOMS" && (
          <RoomSetupTab
            rooms={rooms}
            addOns={addOns}
            onSaveRooms={handleSaveRooms}
            saving={savingRooms}
          />
        )}

        {/* Add-Ons tab content (reused existing AddOnsTab) */}
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
