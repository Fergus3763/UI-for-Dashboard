// admin-ui/src/pages/Dashboard/Rooms/RoomCalendarPanel.jsx

import React, { useEffect, useMemo, useState } from "react";

const getDateOnlyString = (date) => {
  if (!(date instanceof Date)) return "";
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatTimeRange = (start, end) => {
  if (!start) return "";
  const s = new Date(start);
  const e = end ? new Date(end) : null;
  if (Number.isNaN(s.getTime())) return "";
  const startStr = s.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (!e || Number.isNaN(e.getTime())) {
    return startStr;
  }
  const endStr = e.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${startStr}–${endStr}`;
};

/**
 * Fixed demo events for December 2025 (visual only, never sent to backend).
 *
 * Demo Admin Blackouts:
 *  2025-12-09 (all day) — Maintenance
 *  2025-12-15 (all day) — Staff Training
 *  2025-12-19 (all day) — Private Event
 *
 * Demo Booked Events:
 *  2025-12-10 — 09:00–12:00 — Board Meeting
 *  2025-12-11 — 13:00–17:00 — Client Workshop
 *  2025-12-16 — 10:00–15:00 — Strategy Session
 */
const generateDemoEvents = () => {
  return [
    // Admin blackouts (all day)
    {
      type: "admin",
      source: "demo",
      startsAt: "2025-12-09T00:00:00.000Z",
      endsAt: "2025-12-09T23:59:59.000Z",
      title: "Maintenance",
      label: "Blocked (Admin Blackout)",
      detail: "Admin Blackout – Maintenance (all day, demo)",
    },
    {
      type: "admin",
      source: "demo",
      startsAt: "2025-12-15T00:00:00.000Z",
      endsAt: "2025-12-15T23:59:59.000Z",
      title: "Staff Training",
      label: "Blocked (Admin Blackout)",
      detail: "Admin Blackout – Staff Training (all day, demo)",
    },
    {
      type: "admin",
      source: "demo",
      startsAt: "2025-12-19T00:00:00.000Z",
      endsAt: "2025-12-19T23:59:59.000Z",
      title: "Private Event",
      label: "Blocked (Admin Blackout)",
      detail: "Admin Blackout – Private Event (all day, demo)",
    },

    // Booked events (timed)
    {
      type: "booked",
      source: "demo",
      startsAt: "2025-12-10T09:00:00.000Z",
      endsAt: "2025-12-10T12:00:00.000Z",
      title: "Board Meeting",
      label: "Blocked (Booked)",
      detail: "Booked – Board Meeting 09:00–12:00, 10 attendees (demo)",
    },
    {
      type: "booked",
      source: "demo",
      startsAt: "2025-12-11T13:00:00.000Z",
      endsAt: "2025-12-11T17:00:00.000Z",
      title: "Client Workshop",
      label: "Blocked (Booked)",
      detail: "Booked – Client Workshop 13:00–17:00, 16 attendees (demo)",
    },
    {
      type: "booked",
      source: "demo",
      startsAt: "2025-12-16T10:00:00.000Z",
      endsAt: "2025-12-16T15:00:00.000Z",
      title: "Strategy Session",
      label: "Blocked (Booked)",
      detail: "Booked – Strategy Session 10:00–15:00, 8 attendees (demo)",
    },
  ];
};

/**
 * Build per-day event index from real blackouts or demo events.
 * Real blackout data always wins; demo is only used when there is no data.
 *
 * Canonical real blackout shape (from blackout_periods):
 *   {
 *     id: string,
 *     roomId: string,
 *     title: string,
 *     startsAt: string (ISO),
 *     endsAt: string (ISO),
 *     ...
 *   }
 */
const buildEventIndex = (realBlackouts, demoEvents) => {
  let events = [];

  if (Array.isArray(realBlackouts) && realBlackouts.length > 0) {
    events = realBlackouts.map((b) => ({
      type: "admin",
      source: "real",
      startsAt: b.startsAt,
      endsAt: b.endsAt || b.startsAt,
      title: b.title || "Admin blackout",
      label: "Blocked (Admin Blackout)",
      detail: `Admin Blackout – ${b.title || "Blackout"} ${
        formatTimeRange(b.startsAt, b.endsAt) || ""
      }`.trim(),
    }));
  } else if (Array.isArray(demoEvents) && demoEvents.length > 0) {
    events = demoEvents;
  }

  const blackoutDates = new Set(); // admin
  const bookedDates = new Set(); // booked
  const dateEvents = {}; // isoDate -> [event, ...]

  events.forEach((event) => {
    if (!event || !event.startsAt) return;

    const start = new Date(event.startsAt);
    const end = new Date(event.endsAt || event.startsAt);

    if (Number.isNaN(start.getTime())) return;

    if (Number.isNaN(end.getTime())) {
      const isoSingle = getDateOnlyString(start);
      if (!isoSingle) return;
      if (!dateEvents[isoSingle]) dateEvents[isoSingle] = [];
      dateEvents[isoSingle].push(event);

      if (event.type === "admin") blackoutDates.add(isoSingle);
      if (event.type === "booked") bookedDates.add(isoSingle);
      return;
    }

    const current = new Date(start.getTime());
    while (current <= end) {
      const iso = getDateOnlyString(current);
      if (iso) {
        if (!dateEvents[iso]) dateEvents[iso] = [];
        dateEvents[iso].push(event);

        if (event.type === "admin") blackoutDates.add(iso);
        if (event.type === "booked") bookedDates.add(iso);
      }
      current.setDate(current.getDate() + 1);
    }
  });

  return { blackoutDates, bookedDates, dateEvents };
};

const RoomCalendarPanel = ({ room }) => {
  const roomKey = room?.code || room?.id || null;

  const [blackoutRaw, setBlackoutRaw] = useState([]);
  const [demoEvents, setDemoEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // For click-based day details
  const [selectedDateIso, setSelectedDateIso] = useState(null);

  // Month-based list view (one month at a time)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const { blackoutDates, bookedDates, dateEvents } = useMemo(
    () => buildEventIndex(blackoutRaw, demoEvents),
    [blackoutRaw, demoEvents]
  );

  useEffect(() => {
    if (!roomKey) {
      setBlackoutRaw([]);
      setDemoEvents([]);
      setError(null);
      setLoading(false);
      setSelectedDateIso(null);
      return;
    }

    let isCancelled = false;

    async function fetchBlackouts() {
      setLoading(true);
      setError(null);
      setSelectedDateIso(null);

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
          // If there are no real blackouts, populate fixed demo events (visual only)
          if (!items.length) {
            setDemoEvents(generateDemoEvents());
          } else {
            setDemoEvents([]);
          }
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Error fetching blackout periods:", err);
          setError("Unable to load blackout periods for this room.");
          setBlackoutRaw([]);
          // In error case, we still show demo so panel isn't empty
          setDemoEvents(generateDemoEvents());
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
    setSelectedDateIso(null);
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      const year = prev.getFullYear();
      const month = prev.getMonth();
      return new Date(year, month + 1, 1);
    });
    setSelectedDateIso(null);
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
      } else if (bookedDates.has(iso)) {
        status = "blocked-booked";
        label = "Blocked (Booked)";
      }

      const isToday = iso === todayIso;
      const eventsForDay = dateEvents[iso] || [];

      const firstDetail =
        eventsForDay.length > 0 ? eventsForDay[0].detail || eventsForDay[0].title : "";

      list.push({
        dateObj,
        iso,
        status,
        label,
        isToday,
        eventsForDay,
        firstDetail,
      });
    }
    return list;
  }, [blackoutDates, bookedDates, dateEvents, daysInMonth, month, todayIso, year]);

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

  const selectedEvents =
    selectedDateIso && dateEvents[selectedDateIso]
      ? dateEvents[selectedDateIso]
      : [];

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
        Free, Blocked (Admin Blackout), or Blocked (Booked).
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

      {/* Day list with hourly / slot view (Option A: collapsible per day) */}
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
            const {
              dateObj,
              iso,
              status,
              label,
              isToday,
              eventsForDay,
              firstDetail,
            } = day;
            const pillStyle = statusStyleMap[status] || statusStyleMap.free;
            const isSelected = selectedDateIso === iso;
            const hasEvents = eventsForDay.length > 0;

            return (
              <li
                key={iso}
                title={hasEvents ? firstDetail : ""}
                onClick={() => {
                  if (hasEvents) {
                    setSelectedDateIso((prev) => (prev === iso ? null : iso));
                  }
                }}
                style={{
                  padding: "0.4rem 0",
                  borderBottom: "1px solid #f2f2f2",
                  fontSize: "0.9rem",
                  cursor: hasEvents ? "pointer" : "default",
                  backgroundColor: isSelected ? "#fffde7" : "transparent",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "0.75rem",
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
                        <span
                          style={{ marginLeft: "0.5rem", fontWeight: "bold" }}
                        >
                          (Today)
                        </span>
                      )}
                    </div>
                    {hasEvents && firstDetail && (
                      <div
                        style={{
                          fontSize: "0.75rem",
                          opacity: 0.8,
                          marginTop: "0.15rem",
                        }}
                      >
                        {firstDetail}
                      </div>
                    )}
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
                </div>

                {/* Collapsible hourly slots for this day (Option A) */}
                {isSelected && hasEvents && (
                  <div
                    style={{
                      marginTop: "0.3rem",
                      paddingLeft: "0.5rem",
                      borderLeft: "2px solid #eee",
                      fontSize: "0.8rem",
                    }}
                  >
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: "0.9rem",
                        listStyle: "disc",
                      }}
                    >
                      {eventsForDay.map((evt, idx) => {
                        const rangeText = formatTimeRange(
                          evt.startsAt,
                          evt.endsAt
                        );
                        const typeLabel =
                          evt.type === "booked"
                            ? "Booked"
                            : "Admin Blackout";
                        const demoTag =
                          evt.source === "demo" ? " (demo)" : "";

                        return (
                          <li key={`${iso}-${idx}`}>
                            <strong>
                              {rangeText || "All day"}{" "}
                              {typeLabel}
                              {demoTag}
                            </strong>
                            {": "}
                            {evt.detail ||
                              `${evt.title || ""}`.trim()}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Vision / preview notice */}
      <div
        style={{
          marginTop: "0.9rem",
          paddingTop: "0.75rem",
          borderTop: "1px dashed #ccc",
          fontSize: "0.8rem",
          lineHeight: 1.4,
        }}
      >
        <strong>Availability Engine – Preview</strong>
        <p style={{ margin: "0.4rem 0" }}>
          This calendar is a visual preview of the full Availability Engine.
          When fully wired, it will show:
        </p>
        <ul style={{ margin: "0.2rem 0 0.4rem 1.1rem", paddingLeft: 0 }}>
          <li>Auto-blocked bookings</li>
          <li>Variable buffer periods around each booking</li>
          <li>Reserve windows and expiry rules</li>
          <li>Counter-offers for alternative rooms and dates</li>
          <li>Policy enforcement for deposits and no-shows.</li>
        </ul>
        <p style={{ margin: 0 }}>
          Dates and hours shown here are real, but all blocked / booked periods
          are demo-only in this version.
        </p>
      </div>

      {/* future: booking states (reserved / confirmed / tentative) can be added
          as an additional layer (e.g. bookedDates Set) and merged into the
          status decision without changing the outer layout or props. */}
    </div>
  );
};

export default RoomCalendarPanel;
