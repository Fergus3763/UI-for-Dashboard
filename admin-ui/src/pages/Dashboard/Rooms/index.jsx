// admin-ui/src/pages/Dashboard/Rooms/index.jsx
import React, { useEffect, useState } from 'react';
import RoomSetupTab from './RoomSetupTab';
// IMPORTANT: reuse the AddOnsTab from VenueSetup
import AddOnsTab from '../VenueSetup/Tabs/AddOnsTab.jsx';

const RoomsPage = () => {
  const [config, setConfig] = useState(null);
  const [activeTab, setActiveTab] = useState('roomSetup');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await fetch('/.netlify/functions/load_config');
        const json = await res.json();
        setConfig(json);
      } catch (e) {
        console.error(e);
        setError('Could not load configuration.');
      }
    };
    loadConfig();
  }, []);

  const handleSave = async (updatedConfig) => {
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch('/.netlify/functions/save_config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedConfig),
      });

      if (!res.ok) {
        throw new Error('Save failed');
      }
      const json = await res.json();
      setConfig(json);
    } catch (e) {
      console.error(e);
      setError('Could not save configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!config) return <div>Loading…</div>;

  const rooms = config.data?.rooms || [];

  const updateRooms = (newRooms) => {
    setConfig((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        rooms: newRooms,
      },
    }));
  };

  const handleSaveClick = () => {
    handleSave(config);
  };

  return (
    <div>
      <h1>Rooms</h1>

      {/* Tabs header */}
      <div className="tabs">
        <button
          className={activeTab === 'roomSetup' ? 'active' : ''}
          onClick={() => setActiveTab('roomSetup')}
        >
          Room Setup
        </button>
        <button
          className={activeTab === 'addOns' ? 'active' : ''}
          onClick={() => setActiveTab('addOns')}
        >
          Add-Ons
        </button>
      </div>

      {/* Tabs content */}
      {activeTab === 'roomSetup' && (
        <RoomSetupTab rooms={rooms} onChangeRooms={updateRooms} />
      )}
      {activeTab === 'addOns' && (
        <AddOnsTab />
      )}

      <div style={{ marginTop: '1rem' }}>
        {error && <div className="error">{error}</div>}
        <button onClick={handleSaveClick} disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default RoomsPage;
