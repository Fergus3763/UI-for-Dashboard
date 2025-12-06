// admin-ui/src/pages/Dashboard/Rooms/RoomCalendarPanel.jsx

import React, { useEffect, useMemo, useState } from "react";

const getDateOnlyString = (date) => {
  if (!(date instanceof Date)) return "";
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Normalise blackout periods from the blackout_periods API into
 * a Set of YYYY-MM-DD strings.
 *
 * Canonical blackout shape, based on RoomBlackoutsPanel:
 *   {
 *     id: string,
 *     roomId: string,
 *     title: string,
 *     startsAt: string (ISO),
 *     endsAt: string (ISO),
 *     ...
 *   }
 */
const buildBlackoutDateSet = (periods) => {
  const dates = new Set();

  if (!Array.isArray(periods)) {
    return dates;
  }

  periods.forEach((p) => {
    if (!p || typeof p !== "object") return;

    const startRaw = p.startsAt;
    const endRaw = p.endsAt || p.startsAt;

    if (!startRaw) return;

    const start = new Date(startRaw);
    const end = new Date(endRaw);

    if (Number.isNaN(start.getTime())) {
      return;
    }
    if (Number.isNaN(end.getTime())) {
      // If end is invalid, treat it as a single-day blackout
      const isoSingle = getDateOnlyString(start);
      if (isoSingle) dates.add(isoSingle);
      return;
    }

    // Expand the period, inclusive of start and end
    const current = new Date(start.getTime());
    while (current <= end) {
      const iso = getDateOnlyString(current);
      if (iso) dates.add(iso);
      current.setDate(current.getDate() + 1);
    }
  });

  return dates;
};

const RoomCalendarPanel = ({ room }) => {
  const roomKey = room?.code || room?.id || null;

  const [blackoutRaw, setBlackoutRaw] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Month-based list view (one month at a time)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const blackoutDates = useMemo(
    () => buildBlackoutDateSet(blackoutRaw),
    [blackoutRaw]
  );

  useEffect(() => {
    if (!roomKey) {
      setBlackoutRaw([]);
      setError(null);
      setLoading(false);
      return;
    }

    let isCancelled = false;

    async function fetchBlackouts() {
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
            `Failed to load blackout periods (${response.status})`
          );
        }

        const json = await response.json();
        const items = Array.isArray(json.data) ? json.data : [];

        if (!isCancelled) {
          setBlackoutRaw(items);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Error fetching blackout periods:", err);
          setError("Unable to load blackout periods for this room.");
          setBlackoutRaw([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    fetchBlackouts();

    return () => {
      isCancelled = true;
    };
  }, [roomKey]);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => {
      const year = prev.getFullYear();
      const month = prev.getMonth();
      return new Date(year, month - 1, 1);
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      const year = prev.getFullYear();
      const month = prev.getMonth();
      return new Date(year, month + 1, 1);
    });
  };

  const todayIso = getDateOnlyString(new Date());
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = useMemo(() => {
    const list = [];
    for (let day = 1; day <= daysInMonth; day += 1) {
      const dateObj = new Date(year, month, day);
      const iso = getDateOnlyString(dateObj);

      let status = "free";
      let label = "Free";

      if (blackoutDates.has(iso)) {
        status = "blocked-admin";
        label = "Blocked (Admin Blackout)";
      }

      // future: booking states (reserved / confirmed) can be layered here
      // e.g. by checking a bookedDates Set before blackouts.

      const isToday = iso === todayIso;

      list.push({
        dateObj,
        iso,
        status,
        label,
        isToday,
      });
    }
    return list;
  }, [blackoutDates, daysInMonth, month, todayIso, year]);

  const statusStyleMap = {
    free: {
      backgroundColor: "#e6f4ea",
      border: "1px solid #c4e3ce",
      color: "#1b5e20",
    },
    "blocked-admin": {
      backgroundColor: "#ffebee",
      border: "1px solid #ffcdd2",
      color: "#b71c1c",
    },
    "blocked-booked": {
      backgroundColor: "#e3f2fd",
      border: "1px solid #bbdefb",
      color: "#0d47a1",
    },
  };

  if (!room) {
    return (
      <div
        className="room-calendar-panel"
        style={{ marginTop: "1.5rem", padding: "1rem", border: "1px solid #ddd" }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "0.75rem" }}>
          Availability &amp; Blackouts
        </h3>
        <p style={{ margin: 0 }}>Select a room to view its availability.</p>
      </div>
    );
  }

  const monthLabel = currentMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className="room-calendar-panel"
      style={{ marginTop: "1.5rem", padding: "1rem", border: "1px solid #ddd" }}
    >
      <h3 style={{ marginTop: 0, marginBottom: "0.75rem" }}>
        Availability &amp; Blackouts
      </h3>
      <p style={{ marginTop: 0, marginBottom: "0.75rem", fontSize: "0.9rem" }}>
        Month list view for room{" "}
        <strong>{room.code || room.name || room.id}</strong>. Days are marked as
        Free or Blocked (Admin Blackout).
      </p>

      {/* Legend */}
      <div
        className="room-calendar-legend"
        style={{
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
          marginBottom: "0.75rem",
          fontSize: "0.85rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          <span
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "3px",
              ...statusStyleMap.free,
            }}
          />
          <span>Free</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          <span
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "3px",
              ...statusStyleMap["blocked-admin"],
            }}
          />
          <span>Blocked (Admin Blackout)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          <span
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "3px",
              ...statusStyleMap["blocked-booked"],
            }}
          />
          <span>Blocked (Booked)</span>
          <span style={{ fontStyle: "italic", opacity: 0.7 }}>
            (no bookings dataset wired yet)
          </span>
        </div>
      </div>

      {/* Month controls */}
      <div
        className="room-calendar-month-controls"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.75rem",
        }}
      >
        <button type="button" onClick={handlePrevMonth}>
          ← Previous
        </button>
        <strong>{monthLabel}</strong>
        <button type="button" onClick={handleNextMonth}>
          Next →
        </button>
      </div>

      {loading && (
        <div style={{ marginBottom: "0.75rem", fontSize: "0.9rem" }}>
          Loading blackout periods…
        </div>
      )}

      {error && (
        <div
          className="alert alert-error"
          style={{
            marginBottom: "0.75rem",
            padding: "0.5rem 0.75rem",
            border: "1px solid #f44336",
            backgroundColor: "#ffebee",
            color: "#b71c1c",
            fontSize: "0.9rem",
          }}
        >
          {error}
        </div>
      )}

      <div
        className="room-calendar-list"
        style={{
          maxHeight: "260px",
          overflowY: "auto",
          borderTop: "1px solid #eee",
          marginTop: "0.25rem",
        }}
      >
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {days.map((day) => {
            const { dateObj, iso, status, label, isToday } = day;
            const pillStyle = statusStyleMap[status] || statusStyleMap.free;

            return (
              <li
                key={iso}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.4rem 0",
                  borderBottom: "1px solid #f2f2f2",
                  fontSize: "0.9rem",
                }}
              >
                <div>
                  <div>
                    {dateObj.toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      opacity: 0.7,
                    }}
                  >
                    {iso}
                    {isToday && (
                      <span style={{ marginLeft: "0.5rem", fontWeight: "bold" }}>
                        (Today)
                      </span>
                    )}
                  </div>
                </div>
                <span
                  style={{
                    ...pillStyle,
                    padding: "0.2rem 0.5rem",
                    borderRadius: "999px",
                    fontSize: "0.8rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* future: booking states (reserved / confirmed / tentative) can be added
          as an additional layer (e.g. bookedDates Set) and merged into the
          status decision without changing the outer layout or props. */}
    </div>
  );
};

export default RoomCalendarPanel;
