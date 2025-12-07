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

  // If the start time is invalid, bail out
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
 * Build a Date from local date (YYYY-MM-DD) and time (HH:MM) strings.
 * Returns null if the date is invalid.
 */
const buildDateTimeFromLocalParts = (dateStr, timeStr) => {
  if (!dateStr || typeof dateStr !== "string") return null;
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (!year || !month || !day) return null;

  let hours = 0;
  let minutes = 0;
  if (timeStr && typeof timeStr === "string") {
    const [hStr, mStr] = timeStr.split(":");
    const h = Number(hStr);
    const m = Number(mStr);
    if (!Number.isNaN(h) && h >= 0 && h < 24) hours = h;
    if (!Number.isNaN(m) && m >= 0 && m < 60) minutes = m;
  }

  const d = new Date(year, month - 1, day, hours, minutes, 0, 0);
  if (Number.isNaN(d.getTime())) return null;
  return d;
};

/**
 * Fixed demo events for December 2025 (visual only, never sent to backend).
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
 */
const buildEventIndex = (realBlackouts, demoEvents) => {
  let events = [];

  if (Array.isArray(realBlackouts) && realBlackouts.length > 0) {
    events = realBlackouts.map((b) => ({
      id: b.id,
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

  const blackoutDates = new Set();
  const bookedDates = new Set();
  const dateEvents = {};

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

  // Blackout editor state
  const [blackoutForm, setBlackoutForm] = useState({
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    title: "",
  });
  const [blackoutSaving, setBlackoutSaving] = useState(false);
  const [blackoutSaveError, setBlackoutSaveError] = useState(null);

  // Month-based list view (one month at a time)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const { blackoutDates, bookedDates, dateEvents } = useMemo(
    () => buildEventIndex(blackoutRaw, demoEvents),
    [blackoutRaw, demoEvents]
  );

  // Initial load of blackouts
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

  const reloadBlackoutsForCurrentRoom = async () => {
    if (!roomKey) return;
    try {
      const response = await fetch(
        `/.netlify/functions/blackout_periods?roomId=${encodeURIComponent(
          roomKey
        )}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to reload blackout periods (${response.status})`
        );
      }

      const json = await response.json();
      const items = Array.isArray(json.data) ? json.data : [];

      setBlackoutRaw(items);
      if (!items.length) {
        setDemoEvents(generateDemoEvents());
      } else {
        setDemoEvents([]);
      }
    } catch (err) {
      console.error("Error reloading blackout periods:", err);
      setError("Unable to load blackout periods for this room.");
    }
  };

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

  // Build list of days for the current month
  const days = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayIso = getDateOnlyString(new Date());

    const list = [];
    for (let day = 1; day <= daysInMonth; day += 1) {
      const dateObj = new Date(year, month, day);
      const iso = getDateOnlyString(dateObj);

      let status = "free";
      let label = "Free";

      if (blackoutDates.has(iso) && bookedDates.has(iso)) {
        status = "mixed";
        label = "Mixed";
      } else if (blackoutDates.has(iso)) {
        status = "blocked-admin";
        label = "Admin blackout";
      } else if (bookedDates.has(iso)) {
        status = "blocked-booked";
        label = "Booked";
      }

      const isToday = iso === todayIso;
      const eventsForDay = dateEvents[iso] || [];

      const firstDetail =
        eventsForDay.length > 0
          ? eventsForDay[0].detail || eventsForDay[0].title
          : "";

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
  }, [currentMonth, blackoutDates, bookedDates, dateEvents]);

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

  const hourStyleMap = {
    free: {
      backgroundColor: "#e6f4ea",
      border: "1px solid #c4e3ce",
    },
    admin: {
      backgroundColor: "#ffebee",
      border: "1px solid #ffcdd2",
    },
    booked: {
      backgroundColor: "#e3f2fd",
      border: "1px solid #bbdefb",
    },
  };

  const handleBlackoutFieldChange = (name, value) => {
    setBlackoutForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddBlackout = async () => {
    setBlackoutSaveError(null);

    if (!roomKey) {
      setBlackoutSaveError(
        "Please select a room with a Code/ID before adding blackout periods."
      );
      return;
    }

    const { startDate, endDate, startTime, endTime, title } = blackoutForm;

    if (!startDate) {
      setBlackoutSaveError("Start date is required.");
      return;
    }

    const effectiveEndDate = endDate || startDate;

    const effectiveStartTime = startTime || "00:00";
    const effectiveEndTime = endTime || "23:59";

    const startDateObj = buildDateTimeFromLocalParts(
      startDate,
      effectiveStartTime
    );
    const endDateObj = buildDateTimeFromLocalParts(
      effectiveEndDate,
      effectiveEndTime
    );

    if (!startDateObj || !endDateObj) {
      setBlackoutSaveError("Please enter valid dates and times.");
      return;
    }

    if (endDateObj <= startDateObj) {
      setBlackoutSaveError("End date/time must be after start date/time.");
      return;
    }

    const payload = {
      roomId: roomKey,
      startsAt: startDateObj.toISOString(),
      endsAt: endDateObj.toISOString(),
      title: title && title.trim() ? title.trim() : null,
    };

    setBlackoutSaving(true);
    try {
      const response = await fetch("/.netlify/functions/blackout_periods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await response.json().catch(() => ({}));

      if (!response.ok || json.ok === false) {
        const msg =
          (json && json.error) ||
          `Failed to save blackout (status ${response.status})`;
        throw new Error(msg);
      }

      await reloadBlackoutsForCurrentRoom();

      setBlackoutForm({
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        title: "",
      });
    } catch (err) {
      console.error("Error saving blackout:", err);
      setBlackoutSaveError("Could not save blackout. Please try again.");
    } finally {
      setBlackoutSaving(false);
    }
  };

  const handleDeleteBlackout = async (blackoutId) => {
    // NOTE: blackout_periods.mjs currently only supports GET and POST (create).
    // There is no delete endpoint defined yet, so we cannot safely call the
    // backend to remove blackout periods without a contract update.
    //
    // For now, we surface a clear message and leave the data unchanged.
    setBlackoutSaveError(
      "Removing blackout periods is not yet supported by the blackout_periods API (GET/POST only). Please ask HUB #8 to define a delete contract."
    );
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
        <strong>{room.code || room.name || room.id}</strong>. Each row shows 24
        hourly slots, colour-coded for Free, Admin Blackout, and Booked.
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

      {/* Admin Blackout Editor */}
      <div
        style={{
          marginBottom: "0.75rem",
          padding: "0.75rem",
          border: "1px solid #eee",
          borderRadius: "4px",
          backgroundColor: "#fafafa",
        }}
      >
        <h4 style={{ margin: "0 0 0.5rem" }}>Add Admin Blackout</h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "0.5rem",
            marginBottom: "0.5rem",
          }}
        >
          <div>
            <label style={{ fontSize: "0.8rem" }}>
              Start date
              <br />
              <input
                type="date"
                value={blackoutForm.startDate}
                onChange={(e) =>
                  handleBlackoutFieldChange("startDate", e.target.value)
                }
                style={{ width: "100%" }}
              />
            </label>
          </div>
          <div>
            <label style={{ fontSize: "0.8rem" }}>
              End date (optional)
              <br />
              <input
                type="date"
                value={blackoutForm.endDate}
                onChange={(e) =>
                  handleBlackoutFieldChange("endDate", e.target.value)
                }
                style={{ width: "100%" }}
              />
            </label>
          </div>
          <div>
            <label style={{ fontSize: "0.8rem" }}>
              Start time (optional)
              <br />
              <input
                type="time"
                value={blackoutForm.startTime}
                onChange={(e) =>
                  handleBlackoutFieldChange("startTime", e.target.value)
                }
                style={{ width: "100%" }}
              />
            </label>
          </div>
          <div>
            <label style={{ fontSize: "0.8rem" }}>
              End time (optional)
              <br />
              <input
                type="time"
                value={blackoutForm.endTime}
                onChange={(e) =>
                  handleBlackoutFieldChange("endTime", e.target.value)
                }
                style={{ width: "100%" }}
              />
            </label>
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) auto",
            gap: "0.5rem",
            alignItems: "flex-end",
          }}
        >
          <div>
            <label style={{ fontSize: "0.8rem" }}>
              Title / Reason
              <br />
              <input
                type="text"
                value={blackoutForm.title}
                onChange={(e) =>
                  handleBlackoutFieldChange("title", e.target.value)
                }
                placeholder="e.g. Maintenance, Private Event"
                style={{ width: "100%" }}
              />
            </label>
          </div>
          <div style={{ textAlign: "right" }}>
            <button
              type="button"
              onClick={handleAddBlackout}
              disabled={blackoutSaving}
              style={{
                padding: "0.4rem 0.9rem",
                cursor: blackoutSaving ? "not-allowed" : "pointer",
              }}
            >
              {blackoutSaving ? "Saving…" : "Add Blackout"}
            </button>
          </div>
        </div>
        {blackoutSaveError && (
          <div
            style={{
              marginTop: "0.5rem",
              padding: "0.4rem 0.6rem",
              borderRadius: "4px",
              border: "1px solid #e57373",
              backgroundColor: "#ffebee",
              color: "#b71c1c",
              fontSize: "0.8rem",
            }}
          >
            {blackoutSaveError}
          </div>
        )}
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

      {/* Day list with 24-hour bar per day */}
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
            const isSelected = selectedDateIso === iso;
            const hasEvents = eventsForDay.length > 0;

            // Build 24-hour slots with precedence: booked > admin > free
            const slots = new Array(24).fill("free");
            const slotEvents = new Array(24).fill(null).map(() => []);

            if (hasEvents) {
              const dayStart = new Date(
                dateObj.getFullYear(),
                dateObj.getMonth(),
                dateObj.getDate(),
                0,
                0,
                0,
                0
              );
              const dayEnd = new Date(
                dateObj.getFullYear(),
                dateObj.getMonth(),
                dateObj.getDate(),
                23,
                59,
                59,
                999
              );

              eventsForDay.forEach((evt) => {
                if (!evt.startsAt) return;
                const evtStart = new Date(evt.startsAt);
                const evtEnd = new Date(evt.endsAt || evt.startsAt);
                if (Number.isNaN(evtStart.getTime())) return;

                const effectiveStart =
                  evtStart < dayStart ? dayStart : evtStart;
                const effectiveEnd =
                  Number.isNaN(evtEnd.getTime()) || evtEnd > dayEnd
                    ? dayEnd
                    : evtEnd;

                if (effectiveEnd <= effectiveStart) return;

                let startHour = effectiveStart.getHours();
                let endHourExclusive = effectiveEnd.getHours();
                // If there are minutes/seconds, include the ending hour
                if (
                  effectiveEnd.getMinutes() > 0 ||
                  effectiveEnd.getSeconds() > 0 ||
                  effectiveEnd.getMilliseconds() > 0
                ) {
                  endHourExclusive += 1;
                }

                startHour = Math.max(0, Math.min(23, startHour));
                endHourExclusive = Math.max(
                  startHour + 1,
                  Math.min(24, endHourExclusive)
                );

                for (let h = startHour; h < endHourExclusive; h += 1) {
                  slotEvents[h].push(evt);
                  const current = slots[h];
                  if (evt.type === "booked") {
                    slots[h] = "booked";
                  } else if (evt.type === "admin") {
                    if (current === "free") {
                      slots[h] = "admin";
                    }
                  }
                }
              });
            }

            return (
              <li
                key={iso}
                style={{
                  padding: "0.4rem 0",
                  borderBottom: "1px solid #f2f2f2",
                  fontSize: "0.9rem",
                  backgroundColor: isSelected ? "#fffde7" : "transparent",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                  }}
                >
                  {/* Date + label column */}
                  <div
                    style={{
                      minWidth: "140px",
                      flexShrink: 0,
                    }}
                  >
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
                    <div
                      style={{
                        fontSize: "0.75rem",
                        opacity: 0.8,
                        marginTop: "0.15rem",
                      }}
                    >
                      {label}
                      {hasEvents && firstDetail && (
                        <>
                          {" – "}
                          <span>{firstDetail}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 24-hour bar */}
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      gap: "1px",
                      minWidth: 0,
                      cursor: hasEvents ? "pointer" : "default",
                    }}
                    onClick={() => {
                      if (hasEvents) {
                        setSelectedDateIso((prev) =>
                          prev === iso ? null : iso
                        );
                      }
                    }}
                  >
                    {slots.map((slot, hour) => {
                      const style =
                        slot === "booked"
                          ? hourStyleMap.booked
                          : slot === "admin"
                          ? hourStyleMap.admin
                          : hourStyleMap.free;

                      const eventsHere = slotEvents[hour];
                      const hourLabel = `${String(hour).padStart(
                        2,
                        "0"
                      )}:00–${String((hour + 1) % 24).padStart(
                        2,
                        "0"
                      )}:00`;

                      let tooltip = `${hourLabel} – Free`;
                      if (eventsHere && eventsHere.length > 0) {
                        const firstEvt = eventsHere[0];
                        const kind =
                          firstEvt.type === "booked"
                            ? "Booked"
                            : "Admin Blackout";
                        const rangeText = formatTimeRange(
                          firstEvt.startsAt,
                          firstEvt.endsAt
                        );
                        const demoTag =
                          firstEvt.source === "demo" ? " (demo)" : "";
                        tooltip = `${hourLabel} – ${kind}${demoTag}${
                          firstEvt.title ? `: ${firstEvt.title}` : ""
                        }${rangeText ? ` (${rangeText})` : ""}`;
                      }

                      return (
                        <div
                          key={`${iso}-${hour}`}
                          title={tooltip}
                          style={{
                            ...style,
                            flex: 1,
                            height: "14px",
                            borderRadius: 0,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Day details for selected date, with Remove controls for real admin blackouts */}
      {selectedEvents.length > 0 && (
        <div
          style={{
            marginTop: "0.75rem",
            padding: "0.5rem 0.75rem",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontSize: "0.85rem",
            backgroundColor: "#fafafa",
          }}
        >
          <strong>Day details – {selectedDateIso}</strong>
          <ul style={{ margin: "0.4rem 0 0", paddingLeft: "1.1rem" }}>
            {selectedEvents.map((evt, idx) => {
              const rangeText = formatTimeRange(evt.startsAt, evt.endsAt);
              const prefix =
                evt.type === "booked" ? "Booked –" : "Admin Blackout –";
              const demoTag = evt.source === "demo" ? " (demo)" : "";

              const canRemove =
                evt.type === "admin" && evt.source === "real" && evt.id;

              return (
                <li key={`${selectedDateIso}-${idx}`}>
                  {evt.detail ||
                    `${prefix} ${evt.title || ""}${demoTag} ${
                      rangeText ? `(${rangeText})` : ""
                    }`.trim()}
                  {canRemove && (
                    <button
                      type="button"
                      onClick={() => handleDeleteBlackout(evt.id)}
                      style={{
                        marginLeft: "0.5rem",
                        fontSize: "0.75rem",
                        padding: "0.15rem 0.4rem",
                        cursor: "pointer",
                      }}
                    >
                      Remove
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

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
    </div>
  );
};

export default RoomCalendarPanel;
