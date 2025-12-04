F/ admin-ui/src/pages/Dashboard/Rooms/index.jsx

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

    // Start from the original object so we do not throw anything away.
    const original = { ...room };

    // ---- Layouts and capacities ----
    const layouts = Array.isArray(original.layouts) ? original.layouts : [];

    let capacityMin = original.capacityMin ?? 0;
    let capacityMax = original.capacityMax ?? 0;

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

    // ---- Pricing (trust Room Setup's nested pricing as canonical) ----
    const pricingSource = original.pricing || {};

    const perPersonRaw =
      pricingSource.perPerson ??
      original.perPersonRate ??
      null;

    const perRoomRaw =
      pricingSource.perRoom ??
      original.flatRoomRate ??
      null;

    const ruleRaw =
      pricingSource.rule ??
      original.priceRule ??
      "higher";

    const pricing = {
      ...pricingSource,
      perPerson: perPersonRaw != null ? Number(perPersonRaw) || 0 : 0,
      perRoom: perRoomRaw != null ? Number(perRoomRaw) || 0 : 0,
      rule: ruleRaw,
    };

    // ---- Buffers (minutes) ----
    const bufferBeforeRaw =
      original.bufferBefore ??
      original.bufferBeforeMinutes ??
      0;

    const bufferAfterRaw =
      original.bufferAfter ??
      original.bufferAfterMinutes ??
      0;

    const bufferBefore = Number(bufferBeforeRaw) || 0;
    const bufferAfter = Number(bufferAfterRaw) || 0;

    // ---- Add-ons ----
    const includedAddOnIds = Array.isArray(original.includedAddOns)
      ? original.includedAddOns
      : Array.isArray(original.includedAddOnIds)
      ? original.includedAddOnIds
      : [];

    const optionalAddOnIds = Array.isArray(original.optionalAddOns)
      ? original.optionalAddOns
      : Array.isArray(original.optionalAddOnIds)
      ? original.optionalAddOnIds
      : [];

    return {
      // keep anything else that may exist on the room
      ...original,

      // core identifiers
      id:
        original.id ??
        (typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `room_${Math.random().toString(36).slice(2)}_${Date.now()}`),
      code: original.code ?? "",
      name: original.name ?? "",
      description: original.description ?? "",
      active: original.active ?? true,

      // arrays
      images: Array.isArray(original.images) ? original.images : [],
      features: Array.isArray(original.features) ? original.features : [],
      layouts,

      // derived capacities
      capacityMin,
      capacityMax,

      // canonical shapes
      pricing,
      bufferBefore,
      bufferAfter,
      includedAddOns: includedAddOnIds,
      includedAddOnIds,
      optionalAddOns: optionalAddOnIds,
      optionalAddOnIds,
    };
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
      // allow callers to treat "undefined" as success
      return true;
    } catch (err) {
      console.error("Error saving rooms:", err);
      setSaveRoomsError(err.message || "Failed to save rooms.");
      return false;
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
