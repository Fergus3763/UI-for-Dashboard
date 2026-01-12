// admin-ui/src/pages/Dashboard/RoomOverview/index.jsx

import React, { useEffect, useState } from "react";

/* ---------------- Normalisation helpers ---------------- */

const normaliseRoom = (room) => {
  if (!room || typeof room !== "object") return null;
  const original = { ...room };

  const pricingSource = original.pricing || {};

  const toNumberOrNull = (value) => {
    if (value === "" || value === null || value === undefined) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };

  const pricing = {
    ...pricingSource,
    perPerson: toNumberOrNull(pricingSource.perPerson ?? original.perPerson),
    perRoom: toNumberOrNull(pricingSource.perRoom ?? original.perRoom),
    rule:
      pricingSource.rule ??
      original.pricingRule ??
      original.priceRule ??
      "higher",
  };

  const toNonNegativeInt = (value) => {
    if (value === "" || value === null || value === undefined) return 0;
    const n = parseInt(value, 10);
    return Number.isNaN(n) || n < 0 ? 0 : n;
  };

  const bufferBefore = toNonNegativeInt(
    original.bufferBefore ??
      original.buffer_before ??
      original.bufferBeforeMinutes
  );
  const bufferAfter = toNonNegativeInt(
    original.bufferAfter ??
      original.buffer_after ??
      original.bufferAfterMinutes
  );

  const toIdArray = (value) =>
    Array.isArray(value)
      ? value.map((v) => String(v)).filter(Boolean)
      : [];

  return {
    ...original,
    pricing,
    bufferBefore,
    bufferAfter,
    includedAddOns: toIdArray(original.includedAddOns),
    optionalAddOns: toIdArray(original.optionalAddOns),
  };
};

/* ---------------- Page ---------------- */

const RoomOverviewPage = () => {
  const [rooms, setRooms] = useState([]);
  const [addOnsById, setAddOnsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [explainerExpanded, setExplainerExpanded] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await fetch("/.netlify/functions/load_config");
        if (!res.ok) throw new Error("load_config failed");

        const payload = await res.json();
        const data = payload?.data ?? payload ?? {};

        const roomsData = Array.isArray(data.rooms) ? data.rooms : [];
        const addOns = Array.isArray(data.addOns) ? data.addOns : [];

        if (!mounted) return;

        setRooms(roomsData.map(normaliseRoom).filter(Boolean));

        const map = {};
        addOns.forEach((a) => {
          if (a?.id) map[a.id] = a;
        });
        setAddOnsById(map);
      } catch (err) {
        if (mounted) setError("Unable to load room configuration.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const getAddOnName = (id) =>
    addOnsById[id]?.name || addOnsById[id]?.title || id;

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 6 }}>Room Overview</h1>

      {/* Explainer — postscript style */}
      <div
        style={{
          marginBottom: 16,
          borderRadius: 12,
          border: "1px dashed rgba(59,130,246,0.25)",
          borderLeft: "6px solid rgba(59,130,246,0.55)",
          background: "rgba(59,130,246,0.04)",
          padding: "10px 12px",
          maxWidth: 980,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 900,
              fontStyle: "italic",
              color: "rgba(30,64,175,0.95)",
            }}
          >
            Why this page exists
          </div>

          <button
            type="button"
            onClick={() => setExplainerExpanded((v) => !v)}
            style={{
              border: "1px solid rgba(59,130,246,0.32)",
              background: "rgba(59,130,246,0.08)",
              borderRadius: 10,
              padding: "6px 10px",
              fontWeight: 800,
              cursor: "pointer",
              color: "rgba(30,64,175,0.95)",
            }}
          >
            {explainerExpanded ? "Collapse ▴" : "Expand ▾"}
          </button>
        </div>

        {explainerExpanded && (
          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            <p>
              This page gives you a single, read-only view of all meeting rooms
              and their configurations at a glance.
            </p>
            <p>
              Use it to compare rooms, spot inconsistencies, and confirm that
              your setup behaves as expected before guests ever see it.
            </p>
            <p>
              No changes can be made from this page. All edits happen in the Room
              Setup and Add-Ons sections.
            </p>
          </div>
        )}
      </div>

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {!loading && !error && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px,1fr))",
            gap: 20,
          }}
        >
          {rooms.map((room) => (
            <div
              key={room.id || room.code}
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: 16,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <h3>{room.name || "Untitled room"}</h3>
              {room.code && (
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  Code: {room.code}
                </div>
              )}

              <div style={{ marginTop: 10 }}>
                <strong>Included add-ons:</strong>
                <div style={{ marginTop: 6 }}>
                  {(room.includedAddOns || []).length
                    ? room.includedAddOns.map((id) => (
                        <span
                          key={id}
                          style={{
                            display: "inline-block",
                            marginRight: 6,
                            marginBottom: 4,
                            padding: "3px 8px",
                            borderRadius: 999,
                            background: "#e5fbe5",
                            fontSize: 12,
                          }}
                        >
                          {getAddOnName(id)}
                        </span>
                      ))
                    : " None"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomOverviewPage;
