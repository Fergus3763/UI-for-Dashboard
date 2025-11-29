// admin-ui/src/pages/Dashboard/Rooms/index.jsx

import React, { useEffect, useState, useCallback } from "react";
import RoomSetupTab from "./RoomSetupTab";

const CONFIG_KEY = "admin_ui_config";

const RoomsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [configData, setConfigData] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [addOns, setAddOns] = useState([]);

  const loadConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // NOTE:
      // This assumes load_config Netlify function expects a POST with { key }.
      // Align with existing implementation if different.
      const res = await fetch("/.netlify/functions/load_config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: CONFIG_KEY }),
      });

      if (!res.ok) {
        throw new Error(`load_config failed: ${res.status}`);
      }

      const json = await res.json();
      const data = json?.data || {};

      setConfigData(data);
      setRooms(Array.isArray(data.rooms) ? data.rooms : []);
      setAddOns(Array.isArray(data.addOns) ? data.addOns : []);
    } catch (err) {
      console.error("Error loading config:", err);
      setError("Failed to load configuration. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleSaveRooms = async (updatedRooms) => {
    if (!configData) return;

    setSaving(true);
    setError(null);

    try {
      const newConfigData = {
        ...configData,
        rooms: updatedRooms,
      };

      const res = await fetch("/.netlify/functions/save_config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: CONFIG_KEY,
          data: newConfigData,
        }),
      });

      if (!res.ok) {
        throw new Error(`save_config failed: ${res.status}`);
      }

      const json = await res.json();
      const savedData = json?.data || newConfigData;

      setConfigData(savedData);
      setRooms(Array.isArray(savedData.rooms) ? savedData.rooms : []);
      setAddOns(Array.isArray(savedData.addOns) ? savedData.addOns : addOns);

      return true;
    } catch (err) {
      console.error("Error saving rooms:", err);
      setError("Failed to save rooms. Please try again.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rooms-page">
        <h2>Room Setup</h2>
        <p>Loading configuration…</p>
      </div>
    );
  }

  return (
    <div className="rooms-page">
      <h2>Room Setup</h2>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
          {error}
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
