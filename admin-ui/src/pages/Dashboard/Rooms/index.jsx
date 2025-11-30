// admin-ui/src/pages/Dashboard/Rooms/index.jsx

import React, { useEffect, useMemo, useState } from "react";
import RoomSetupTab from "./RoomSetupTab";

const CONFIG_KEY = "default";

const RoomsPage = () => {
  const [config, setConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [configError, setConfigError] = useState(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  const rooms = useMemo(() => (config?.rooms ?? []), [config]);
  const addOns = useMemo(() => (config?.addOns ?? []), [config]);

  const normaliseRoom = (room) => {
    const withDefaults = {
      id: room.id ?? crypto.randomUUID(),
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
      flatRoomRate: room.flatRoomRate != null ? Number(room.flatRoomRate) : null,
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

    // Derive capacity from layouts if they exist
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
    return {
      ...raw,
      rooms: Array.isArray(raw.rooms)
        ? raw.rooms.map((room) => normaliseRoom(room))
        : [],
      addOns: Array.isArray(raw.addOns) ? raw.addOns : [],
    };
  };

  const loadConfig = async () => {
    setLoadingConfig(true);
    setConfigError(null);

    try {
      // Call existing load_config Netlify function with a simple GET.
      // It returns the current config JSON (optionally wrapped in { data }).
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

  const handleSaveRooms = async (nextRooms) => {
    if (!config) return;

    setSaving(true);
    setSaveError(null);

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
        ...prev,
        rooms: nextRooms,
      }));

      setLastSavedAt(new Date());
    } catch (err) {
      console.error("Error saving rooms:", err);
      setSaveError(err.message || "Failed to save rooms.");
    } finally {
      setSaving(false);
    }
  };

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

      {saveError && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          Error saving rooms: {saveError}
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

      <RoomSetupTab
        rooms={rooms}
        addOns={addOns}
        onSaveRooms={handleSaveRooms}
        saving={saving}
      />
    </div>
  );
};

export default RoomsPage;
