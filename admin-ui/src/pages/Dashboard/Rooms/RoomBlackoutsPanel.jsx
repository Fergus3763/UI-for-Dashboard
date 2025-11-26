// admin-ui/src/pages/Dashboard/Rooms/RoomBlackoutsPanel.jsx
// Blackout manager for the currently selected room.
// This component talks to the blackout_periods Netlify Function only.
// It NEVER talks to Supabase directly.

import React, { useEffect, useState } from "react";

function formatDateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

export default function RoomBlackoutsPanel({ room }) {
  const roomKey = room?.code || room?.id || null;

  const [blackouts, setBlackouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({
    startsAt: "",
    endsAt: "",
    title: "",
  });

  // Load blackouts whenever the selected room changes
  useEffect(() => {
    if (!roomKey) {
      setBlackouts([]);
      return;
    }

    let cancelled = false;

    async function loadBlackouts() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/.netlify/functions/blackout_periods?roomId=${encodeURIComponent(
            roomKey
          )}`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to load blackouts (status ${response.status})`
          );
        }

        const json = await response.json();
        const items = Array.isArray(json.data) ? json.data : [];

        if (!cancelled) {
          setBlackouts(items);
        }
      } catch (err) {
        console.error("Error loading blackouts:", err);
        if (!cancelled) {
          setError(
            "Could not load blackout periods for this room. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadBlackouts();

    return () => {
      cancelled = true;
    };
  }, [roomKey]);

  function updateFormField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleAddBlackout() {
    setError(null);
    setMessage(null);

    if (!roomKey) {
      setError(
        "Please select a room and assign a Code before adding blackout periods."
      );
      return;
    }

    if (!form.startsAt || !form.endsAt) {
      setError("Start and end date/time are required.");
      return;
    }

    const startDate = new Date(form.startsAt);
    const endDate = new Date(form.endsAt);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      setError("Please enter valid start and end date/time values.");
      return;
    }

    if (endDate <= startDate) {
      setError("End time must be after start time.");
      return;
    }

    const payload = {
      roomId: roomKey,
      startsAt: startDate.toISOString(),
      endsAt: endDate.toISOString(),
      title: form.title && form.title.trim()
        ? form.title.trim()
        : "Admin blackout",
    };

    setSaving(true);

    try {
      const response = await fetch("/.netlify/functions/blackout_periods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to save blackout (status ${response.status})`
        );
      }

      const json = await response.json();

      if (!json.ok || !json.data) {
        throw new Error(json.error || "Unknown error from blackout API");
      }

      // Append the new blackout to the list
      setBlackouts((prev) => [...prev, json.data]);

      // Reset form
      setForm({
        startsAt: "",
        endsAt: "",
        title: "",
      });

      setMessage("Blackout added.");
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      console.error("Error saving blackout:", err);
      setError("Could not save blackout. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!room) {
    return (
      <div style={{ marginTop: "2rem" }}>
        <h3>Blackout periods</h3>
        <p style={{ maxWidth: "640px" }}>
          Select a room to view and manage blackout periods.
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "2rem" }}>
      <h3>Blackout periods</h3>
      <p style={{ maxWidth: "640px" }}>
        These periods block the room from being offered to guests during the
        selected times. This panel uses the room{" "}
        <strong>Code</strong> (for example <code>RM-001</code>) to link to the
        database. Make sure the Code matches the room identifier used in your
        system.
      </p>

      <div
        style={{
          marginBottom: "0.75rem",
        }}
      >
        <strong>Current room:</strong>{" "}
        {room.name || "Unnamed room"}{" "}
        {room.code ? `(${room.code})` : "(no code set)"}
      </div>

      {error && (
        <div
          style={{
            marginBottom: "0.75rem",
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

      {message && (
        <div
          style={{
            marginBottom: "0.75rem",
            padding: "0.75rem 1rem",
            border: "1px solid #81c784",
            backgroundColor: "#e8f5e9",
            borderRadius: "4px",
            color: "#1b5e20",
          }}
        >
          {message}
        </div>
      )}

      {loading ? (
        <div style={{ marginBottom: "1rem" }}>Loading blackout periods…</div>
      ) : (
        <>
          {blackouts.length === 0 ? (
            <p style={{ marginBottom: "1rem" }}>
              No blackout periods defined for this room yet.
            </p>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: "1rem",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid #ddd",
                      padding: "0.5rem",
                    }}
                  >
                    Title
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid #ddd",
                      padding: "0.5rem",
                    }}
                  >
                    Starts
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid #ddd",
                      padding: "0.5rem",
                    }}
                  >
                    Ends
                  </th>
                </tr>
              </thead>
              <tbody>
                {blackouts.map((b) => (
                  <tr key={b.id}>
                    <td
                      style={{
                        borderBottom: "1px solid #eee",
                        padding: "0.5rem",
                      }}
                    >
                      {b.title || "Blackout"}
                    </td>
                    <td
                      style={{
                        borderBottom: "1px solid #eee",
                        padding: "0.5rem",
                      }}
                    >
                      {formatDateTime(b.startsAt)}
                    </td>
                    <td
                      style={{
                        borderBottom: "1px solid #eee",
                        padding: "0.5rem",
                      }}
                    >
                      {formatDateTime(b.endsAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      <div
        style={{
          marginTop: "1rem",
          paddingTop: "1rem",
          borderTop: "1px solid #ddd",
        }}
      >
        <h4 style={{ marginTop: 0 }}>Add blackout</h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 2fr 2fr auto",
            gap: "0.5rem",
            alignItems: "flex-end",
            maxWidth: "100%",
          }}
        >
          <div>
            <label>
              Starts at
              <br />
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => updateFormField("startsAt", e.target.value)}
                style={{ width: "100%" }}
              />
            </label>
          </div>
          <div>
            <label>
              Ends at
              <br />
              <input
                type="datetime-local"
                value={form.endsAt}
                onChange={(e) => updateFormField("endsAt", e.target.value)}
                style={{ width: "100%" }}
              />
            </label>
          </div>
          <div>
            <label>
              Title (optional)
              <br />
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateFormField("title", e.target.value)}
                placeholder="e.g. Maintenance"
                style={{ width: "100%" }}
              />
            </label>
          </div>
          <div>
            <button
              type="button"
              onClick={handleAddBlackout}
              disabled={saving}
              style={{
                padding: "0.5rem 1rem",
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Saving…" : "Add blackout"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
