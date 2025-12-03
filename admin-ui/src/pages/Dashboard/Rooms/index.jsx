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

  const rooms = useMemo(() => (config?.rooms ?? []), [config]);
  const addOns = useMemo(() => (config?.addOns ?? []), [config]);

  // ---------- Normalisation helpers ----------

  const normaliseRoom = (room) => {
    if (!room) return null;

    const pricing = room.pricing || {};
    const perPersonRate =
      room.perPersonRate != null
        ? Number(room.perPersonRate)
        : pricing.perPerson != null
        ? Number(pricing.perPerson)
        : null;

    const flatRoomRate =
      room.flatRoomRate != null
        ? Number(room.flatRoomRate)
        : pricing.perRoom != null
        ? Number(pricing.perRoom)
        : null;

    const priceRule = room.priceRule || pricing.rule || null;

    const layouts = Array.isArray(room.layouts) ? room.layouts : [];

    let capacityMin = room.capacityMin ?? 0;
    let capacityMax = room.capacityMax ?? 0;

    if (layouts.length) {
      const mins = layouts
        .map((l) => Number(l.capacityMin ?? l.min ?? 0))
        .filter((n) => !Number.isNaN(n) && n > 0);
      const maxs = layouts
        .map((l) => Number(l.capacityMax ?? l.max ?? 0))
        .filter((n) => !Number.isNaN(n) && n > 0);

      if (mins.length) capacityMin = Math.min(...mins);
      if (maxs.length) capacityMax = Math.max(...maxs);
    }

    return {
      id: room.id ?? crypto.randomUUID(),
      code: room.code ?? "",
      name: room.name ?? "",
      description: room.description ?? "",
      active: room.active ?? true,

      images: Array.isArray(room.images) ? room.images : [],
      features: Array.isArray(room.features) ? room.features : [],
      layouts,
      capacityMin,
      capacityMax,

      perPersonRate,
      flatRoomRate,
      priceRule,

      bufferBeforeMinutes: room.bufferBeforeMinutes ?? room.bufferBefore ?? 0,
      bufferAfterMinutes: room.bufferAfterMinutes ?? room.bufferAfter ?? 0,

      includedAddOnIds: Array.isArray(room.includedAddOnIds)
        ? room.includedAddOnIds
        : Array.isArray(room.includedAddOns)
        ? room.includedAddOns
        : [],
      optionalAddOnIds: Array.isArray(room.optionalAddOnIds)
        ? room.optionalAddOnIds
        : [],
    };
  };

  const normaliseConfig = (raw) => {
    const data = raw || {};
    return {
      ...data,
      rooms: Array.isArray(data.rooms)
        ? data.rooms.map((r) => normaliseRoom(r)).filter(Boolean)
        : [],
      addOns: Array.isArray(data.addOns) ? data.addOns : [],
    };
  };

  // ---------- Load config ----------

  const loadConfig = async () => {
    setLoadingConfig(true);
    setConfigError(null);

    try {
      const res = await fetch("/.netlify/functions/load_config");
      if (!res.ok) throw new Error(`load_config failed: ${res.status}`);

      const payload = await res.json();
      const raw = payload?.data ?? payload;

      setConfig(normaliseConfig(raw));
    } catch (err) {
      console.error("Error loading room config:", err);
      setConfigError(err.message || "Failed to load configuration.");
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  // ---------- Save rooms ----------

  const handleSaveRooms = async (nextRooms) => {
    if (!config) return;

    setSavingRooms(true);
    setSaveRoomsError(null);

    try {
      const res = await fetch("/.netlify/functions/save_config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: CONFIG_KEY,
          rooms: nextRooms,
        }),
      });

      if (!res.ok) throw new Error(`save_config failed: ${res.status}`);

      const payload = await res.json();
      if (payload?.error) throw new Error(payload.error);

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

  // ---------- Save add-ons (AddOnsTab) ----------

  const handleSaveFullConfig = async (nextConfig) => {
    setSavingConfig(true);
    setSaveConfigError(null);

    try {
      const res = await fetch("/.netlify/functions/save_config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: CONFIG_KEY,
          addOns: nextConfig.addOns ?? [],
        }),
      });

      if (!res.ok) throw new Error(`save_config failed: ${res.status}`);

      const payload = await res.json();
      if (payload?.error) throw new Error(payload.error);

      setConfig((prev) => ({
        ...(prev || {}),
        addOns: nextConfig.addOns ?? [],
      }));
    } catch (err) {
      console.error("Error saving add-ons:", err);
      setSaveConfigError(err.message || "Failed to save add-ons.");
    } finally {
      setSavingConfig(false);
    }
  };

  // ---------- Render ----------

  if (loadingConfig) return <div>Loading configuration…</div>;

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

        {activeTab === "ROOMS" && (
          <RoomSetupTab
            rooms={rooms}
            addOns={addOns}
            onSaveRooms={handleSaveRooms}
            saving={savingRooms}
          />
        )}

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
