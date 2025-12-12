// admin-ui/src/pages/Dashboard/Rooms/index.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import RoomSetupTab from "./RoomSetupTab";
import AddOnsCreateEdit from "./AddOnsCreateEdit";
import AddOnsCatalogueAssignment from "./AddOnsCatalogueAssignment";

const CONFIG_KEY = "default";

// Room normaliser
// Canonical room schema uses: pricing{perPerson,perRoom,rule}, bufferBefore/After (minutes), includedAddOns, optionalAddOns.
// This function converts any legacy pricing/buffer/add-on fields into the canonical schema.
// Canonical fields always win over legacy if both are present.
// All unknown fields are preserved via ...room so config stays forwards/backwards compatible.
// The normaliser exists to keep Room Setup, Room Overview, and backend config in permanent sync.
const normaliseRoom = (room) => {
  if (!room || typeof room !== "object") return null;

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

  // ---- Pricing (canonical: pricing { perPerson, perRoom, rule }) ----
  const pricingSource = original.pricing || {};

  const perPersonRaw =
    pricingSource.perPerson ??
    original.perPersonRate ??
    original.perPerson ??
    null;

  const perRoomRaw =
    pricingSource.perRoom ??
    original.perRoomRate ??
    original.flatRoomRate ??
    original.perRoom ??
    null;

  const ruleRaw =
    pricingSource.rule ??
    original.priceRule ??
    original.pricingRule ??
    "higher";

  const toNumberOrNull = (value) => {
    if (value === "" || value === null || value === undefined) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };

  const pricing = {
    ...pricingSource,
    perPerson: toNumberOrNull(perPersonRaw),
    perRoom: toNumberOrNull(perRoomRaw),
    rule: ruleRaw === "lower" ? "lower" : "higher",
  };

  // ---- Buffers (minutes, canonical: bufferBefore / bufferAfter) ----
  const bufferBeforeRaw =
    original.bufferBefore ??
    original.buffer_before ??
    original.buffer_before_mins ??
    original.bufferBeforeMinutes ??
    null;

  const bufferAfterRaw =
    original.bufferAfter ??
    original.buffer_after ??
    original.buffer_after_mins ??
    original.bufferAfterMinutes ??
    null;

  const toNonNegativeInt = (value) => {
    if (value === "" || value === null || value === undefined) return 0;
    const n = parseInt(value, 10);
    return Number.isNaN(n) || n < 0 ? 0 : n;
  };

  const bufferBefore = toNonNegativeInt(bufferBeforeRaw);
  const bufferAfter = toNonNegativeInt(bufferAfterRaw);

  // ---- Add-ons (canonical: includedAddOns / optionalAddOns as string ID arrays) ----
  const toIdArray = (value) => {
    if (!Array.isArray(value)) return [];
    return value
      .map((item) => {
        if (typeof item === "string") return item;
        if (typeof item === "number") return String(item);
        if (item && typeof item === "object") {
          const id =
            item.id ??
            item.code ??
            item.slug ??
            item.value ??
            item.name ??
            null;
          return id ? String(id) : null;
        }
        return null;
      })
      .filter(Boolean);
  };

  const includedFromCanonical = toIdArray(original.includedAddOns);
  const includedFromLegacy = toIdArray(original.includedAddOnIds);
  const includedIds = includedFromCanonical.length
    ? includedFromCanonical
    : includedFromLegacy;

  const optionalFromCanonical = toIdArray(original.optionalAddOns);
  const optionalFromLegacy = toIdArray(original.optionalAddOnIds);
  const optionalIds = optionalFromCanonical.length
    ? optionalFromCanonical
    : optionalFromLegacy;

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
    includedAddOns: includedIds,
    optionalAddOns: optionalIds,
  };
};

// Removes legacy fields so only canonical + unknown fields are saved.
const canonicaliseRoomForSave = (room) => {
  const normalised = normaliseRoom(room);

  const {
    // legacy pricing
    perPersonRate,
    perRoomRate,
    flatRoomRate,
    priceRule,
    pricingPerPerson,
    pricingPerRoom,
    pricingRule,

    // legacy buffers
    bufferBeforeMinutes,
    bufferAfterMinutes,
    buffer_before,
    buffer_after,
    buffer_before_mins,
    buffer_after_mins,

    // legacy add-ons
    includedAddOnIds,
    optionalAddOnIds,
    included_add_ons,
    included_addons,
    optional_add_ons,
    optional_addons,

    ...rest
  } = normalised;

  return rest;
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

const RoomsPage = () => {
  const location = useLocation();

  const [config, setConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [configError, setConfigError] = useState(null);

  const [savingRooms, setSavingRooms] = useState(false);
  const [saveRoomsError, setSaveRoomsError] = useState(null);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  const [savingConfig, setSavingConfig] = useState(false);
  const [saveConfigError, setSaveConfigError] = useState(null);

  const [activeTab, setActiveTab] = useState("ROOMS");
  const [activeAddOnsTab, setActiveAddOnsTab] = useState("CREATE_EDIT");

  const rooms = useMemo(() => (config?.rooms ?? []), [config]);
  const addOns = useMemo(() => (config?.addOns ?? []), [config]);

  // ---------- Deep-linking via query string (UI/navigation only) ----------
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const view = params.get("view");

    if (!view) return;

    if (view === "room-setup") {
      setActiveTab("ROOMS");
      return;
    }

    if (view === "addons-create") {
      setActiveTab("ADDONS");
      setActiveAddOnsTab("CREATE_EDIT");
      return;
    }

    if (view === "addons-catalogue") {
      setActiveTab("ADDONS");
      setActiveAddOnsTab("CATALOGUE");
    }
  }, [location.search]);

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
      const canonicalRooms = Array.isArray(nextRooms)
        ? nextRooms.map(canonicaliseRoomForSave)
        : [];

      const res = await fetch("/.netlify/functions/save_config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: CONFIG_KEY,
          rooms: canonicalRooms,
        }),
      });

      if (!res.ok) throw new Error(`save_config failed: ${res.status}`);

      const payload = await res.json();
      if (payload?.error) throw new Error(payload.error);

      setConfig((prev) => ({
        ...(prev || {}),
        rooms: canonicalRooms,
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

  // ---------- Save full config for add-ons ----------

  const handleSaveFullConfig = async (nextConfig) => {
    setSavingConfig(true);
    setSaveConfigError(null);

    try {
      // Send the full config object along with the key,
      // so save_config can persist addOns in the same way
      // it handles venue/bookingPolicy/rooms.
      const res = await fetch("/.netlify/functions/save_config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: CONFIG_KEY,
          ...nextConfig,
        }),
      });

      if (!res.ok) throw new Error(`save_config failed: ${res.status}`);

      const payload = await res.json();
      if (payload?.error) throw new Error(payload.error);

      // Update local config state to reflect what was just sent.
      setConfig((prev) => ({
        ...(prev || {}),
        ...nextConfig,
      }));
    } catch (err) {
      console.error("Error saving add-ons:", err);
      setSaveConfigError(err.message || "Failed to save add-ons.");
    } finally {
      setSavingConfig(false);
    }
  };

  // Wrapper so subtabs can just pass updated addOns[]
  const handleSaveAddOns = (nextAddOns) => {
    return handleSaveFullConfig({
      ...(config || {}),
      addOns: nextAddOns ?? [],
    });
  };

  // ---------- Update room assignments for a single add-on ----------

  const handleUpdateRoomAssignments = (roomId, assignmentPatch) => {
    setConfig((prev) => {
      const prevConfig = prev || {};
      const prevRooms = Array.isArray(prevConfig.rooms)
        ? prevConfig.rooms
        : [];

      const normaliseIds = (value) =>
        Array.isArray(value) ? value.map((v) => String(v)) : [];

      const nextRooms = prevRooms.map((room) => {
        if (!room || room.id !== roomId) return room;

        const existingIncluded = normaliseIds(room.includedAddOns);
        const existingOptional = normaliseIds(room.optionalAddOns);

        const patchIncluded = normaliseIds(assignmentPatch.includedAddOns);
        const patchOptional = normaliseIds(assignmentPatch.optionalAddOns);

        const included = patchIncluded.length ? patchIncluded : existingIncluded;
        const optionalRaw = patchOptional.length
          ? patchOptional
          : existingOptional;

        // Enforce exclusivity: anything in included must NOT appear in optional.
        const includedSet = new Set(included);
        const optional = optionalRaw.filter((id) => !includedSet.has(id));

        return {
          ...room,
          includedAddOns: included,
          optionalAddOns: optional,
        };
      });

      return {
        ...prevConfig,
        rooms: nextRooms,
      };
    });
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

      {saveConfigError && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          Error saving add-ons: {saveConfigError}
        </div>
      )}

      <div style={{ marginTop: "1.5rem" }}>
        {/* Top-level tabs: Room Setup vs Add-Ons */}
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
          <div>
            {/* Subtabs inside Add-Ons */}
            <div
              style={{
                borderBottom: "1px solid #e2e8f0",
                marginBottom: "1rem",
              }}
            >
              <button
                type="button"
                onClick={() => setActiveAddOnsTab("CREATE_EDIT")}
                style={{
                  padding: "0.4rem 0.8rem",
                  border: "none",
                  borderBottom:
                    activeAddOnsTab === "CREATE_EDIT"
                      ? "3px solid #000"
                      : "3px solid transparent",
                  background: "transparent",
                  cursor: "pointer",
                  fontWeight:
                    activeAddOnsTab === "CREATE_EDIT" ? "bold" : "normal",
                  fontSize: "0.9rem",
                  marginRight: "0.5rem",
                }}
              >
                Create &amp; Edit
              </button>
              <button
                type="button"
                onClick={() => setActiveAddOnsTab("CATALOGUE")}
                style={{
                  padding: "0.4rem 0.8rem",
                  border: "none",
                  borderBottom:
                    activeAddOnsTab === "CATALOGUE"
                      ? "3px solid #000"
                      : "3px solid transparent",
                  background: "transparent",
                  cursor: "pointer",
                  fontWeight:
                    activeAddOnsTab === "CATALOGUE" ? "bold" : "normal",
                  fontSize: "0.9rem",
                }}
              >
                Catalogue &amp; Assignment
              </button>
            </div>

            {activeAddOnsTab === "CREATE_EDIT" && (
              <AddOnsCreateEdit
                addOns={addOns}
                setAddOns={(next) =>
                  setConfig((prev) => ({ ...(prev || {}), addOns: next ?? [] }))
                }
                onSaveAddOns={handleSaveAddOns}
                saving={savingConfig}
              />
            )}

            {activeAddOnsTab === "CATALOGUE" && (
              <AddOnsCatalogueAssignment
                rooms={rooms}
                addOns={addOns}
                onSaveAddOns={handleSaveAddOns}
                onUpdateRoomAssignments={handleUpdateRoomAssignments}
                saving={savingConfig}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomsPage;
