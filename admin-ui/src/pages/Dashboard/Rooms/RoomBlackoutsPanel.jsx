// admin-ui/src/pages/Dashboard/Rooms/RoomBlackoutsPanel.jsx
// Blackout manager for a single room, using the blackout_periods API.

import React, { useEffect, useState } from "react";

export default function RoomBlackoutsPanel({ room }) {
  const [blackouts, setBlackouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    reason: "",
  });

  const roomId = room && (room.code || room.id || "").trim();

  // Load blackouts whenever the active room changes
  useEffect(() => {
    if (!roomId) {
      setBlackouts([]);
      return;
    }

    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      setMessage(null);
      try {
        const res = await fetch(
          `/.netlify/functions/blackout_periods?roomId=${encodeURIComponent(
            roomId
          )}`
        );
        if (!res.ok) {
          throw new Error(`Failed to load blackouts (status ${res.status})`);
        }
        const data = await res.json();
        if (!cancelled) {
          setBlackouts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Error loading blackouts", err);
        if (!cancelled) setError("Could not load blackout periods.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [roomId]);

  function updateFormField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  function combineDateTime(date, time) {
    if (!date || !time) return null;
    // Browser-local → ISO; API and DB treat as UTC per contract.
    const iso = new Date(`${date}T${time}:00`).toISOString();
    return iso;
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!roomId) return;

    const startsAt = combineDateTime(form.startDate, form.startTime);
    const endsAt = combineDateTime(form.endDate, form.endTime);

    if (!startsAt || !endsAt) {
      setError("Start and end date/time are required.");
      return;
    }
    if (new Date(startsAt) >= new Date(endsAt)) {
      setError("End must be after start.");
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/.netlify/functions/blackout_periods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          startsAt,
          endsAt,
          title: form.reason || "Admin blackout",
        }),
      });
      if (!res.ok) {
        throw new Error(`Failed to create blackout (status ${res.status})`);
      }
      // Expect API to return created row
      const created = await res.json();
      setBlackouts((prev) => [...prev, created]);
      setForm({
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        reason: "",
      });
      setMessage("Blackout created.");
    } catch (err) {
      console.error("Error creating blackout", err);
      setError("Could not create blackout period.");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 4000);
    }
  }

  async function handleDelete(id) {
    if (!id) return;
    if (!window.confirm("Remove this blackout period?")) return;

    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(
        `/.netlify/functions/blackout_periods/${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        throw new Error(`Failed to delete blackout (status ${res.status})`);
      }
      setBlackouts((prev) => prev.filter((b) => b.id !== id));
      setMessage("Blackout removed.");
    } catch (err) {
      console.error("Error deleting blackout", err);
      setError("Could not delete blackout period.");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 4000);
    }
  }

  if (!room) {
    return (
      <section style={{ marginTop: "2rem" }}>
        <h3>Blackout periods</h3>
        <p>Select a room to manage its blackout periods.</p>
      </section>
    );
  }

  if (!roomId) {
    return (
      <section style={{ marginTop: "2rem" }}>
        <h3>Blackout periods</h3>
        <p>
          This room does not yet have a code or id. Please add a{" "}
          <strong>Code</strong> and save the room before managing blackout
          periods.
        </p>
      </section>
    );
  }

  return (
    <section style={{ marginTop: "2rem" }}>
      <h3>
        Blackout periods for <strong>{room.name || room.code}</strong>
      </h3>
      <p style={{ maxWidth: "640px" }}>
        Use this section to block out dates and times when this room cannot be
        booked. These blackouts will be applied by the availability engine and
        the Booker so guests cannot select these slots.
      </p>

      {loading && <p>Loading blackout periods…</p>}
      {error && (
        <p style={{ color: "#b71c1c", marginTop: "0.5rem" }}>{error}</p>
      )}
      {message && (
        <p style={{ color: "#1b5e20", marginTop: "0.5rem" }}>{message}</p>
      )}

      {/* Existing blackouts table */}
      {blackouts.length === 0 && !loading ? (
        <p>No blackout periods defined yet for this room.</p>
      ) : (
        <table
          style={{
            marginTop: "1rem",
            borderCollapse: "collapse",
            width: "100%",
          }}
        >
          <thead>
            <tr>
              <th
                style={{ borderBottom: "1px solid #ddd", textAlign: "left" }}
              >
                From
              </th>
              <th
                style={{ borderBottom: "1px solid #ddd", textAlign: "left" }}
              >
                To
              </th>
              <th
                style={{ borderBottom: "1px solid #ddd", textAlign: "left" }}
              >
                Reason
              </th>
              <th
                style={{ borderBottom: "1px solid #ddd", textAlign: "left" }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {blackouts.map((b) => (
              <tr key={b.id}>
                <td style={{ padding: "0.25rem 0.5rem" }}>
                  {formatDateTime(b.starts_at || b.startsAt)}
                </td>
                <td style={{ padding: "0.25rem 0.5rem" }}>
                  {formatDateTime(b.ends_at || b.endsAt)}
                </td>
                <td style={{ padding: "0.25rem 0.5rem" }}>{b.title || b.reason}</td>
                <td style={{ padding: "0.25rem 0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => handleDelete(b.id)}
                    disabled={saving}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Create form */}
      <form
        onSubmit={handleCreate}
        style={{
          marginTop: "1.5rem",
          padding: "1rem",
          border: "1px solid #ddd",
          borderRadius: "4px",
        }}
      >
        <h4 style={{ marginTop: 0 }}>Add blackout period</h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "0.75rem",
            alignItems: "flex-end",
          }}
        >
          <div>
            <label>
              Start date
              <br />
              <input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  updateFormField("startDate", e.target.value)
                }
              />
            </label>
          </div>
          <div>
            <label>
              Start time
              <br />
              <input
                type="time"
                value={form.startTime}
                onChange={(e) =>
                  updateFormField("startTime", e.target.value)
                }
              />
            </label>
          </div>
          <div>
            <label>
              End date
              <br />
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => updateFormField("endDate", e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              End time
              <br />
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => updateFormField("endTime", e.target.value)}
              />
            </label>
          </div>
        </div>

        <div style={{ marginTop: "0.75rem" }}>
          <label>
            Reason / label
            <br />
            <input
              type="text"
              placeholder="Renovation, private event, maintenance…"
              value={form.reason}
              onChange={(e) => updateFormField("reason", e.target.value)}
              style={{ width: "100%" }}
            />
          </label>
        </div>

        <button
          type="submit"
          style={{ marginTop: "0.75rem" }}
          disabled={saving || !roomId}
        >
          {saving ? "Saving…" : "Add blackout"}
        </button>
      </form>
    </section>
  );
}

function formatDateTime(value) {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
  } catch {
    return value;
  }
}
