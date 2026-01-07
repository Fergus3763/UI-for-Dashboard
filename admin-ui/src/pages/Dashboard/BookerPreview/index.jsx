// admin-ui/src/pages/Dashboard/BookerPreview/index.jsx

import React, { useEffect, useMemo, useState } from "react";

/**
 * Booker Preview — Admin-only, read-only customer pricing flow (Phase 1+)
 *
 * Layout-level RFQ Threshold:
 * - Layouts are eligible if: capacityMin <= attendees <= capacityMax
 * - Mode is RFQ if: attendees > onlineBookingUpTo
 * - onlineBookingUpTo default = capacityMax (if null/undefined)
 *
 * Hard constraints satisfied:
 * - Uses ONLY GET /.netlify/functions/load_config (payload.data parsing)
 * - No writes, no POST, no booking/reserve/payment, no availability logic
 *
 * Pricing rules MUST match Simulation Phase 2.
 */

// ---------- helpers (local-only) ----------

function toNumberSafe(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(amount) {
  const n = toNumberSafe(amount);
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "EUR",
  }).format(n);
}

function getRoomDisplayName(room) {
  const name = room?.name || room?.roomName || room?.title || "Unnamed Room";
  const code = room?.code || room?.roomCode || room?.room_code || "";
  return code ? `${name} (${code})` : name;
}

function makeHourOptions() {
  const opts = [];
  for (let h = 0; h <= 23; h += 1) {
    const hh = String(h).padStart(2, "0");
    opts.push(`${hh}:00`);
  }
  return opts;
}

function indexAddOnsById(addOns) {
  const map = new Map();
  (addOns || []).forEach((a) => {
    const id = a?.id ?? a?._id ?? a?.addOnId ?? a?.addonId;
    if (id != null) map.set(String(id), a);
  });
  return map;
}

function getAddOnPricing(addOn) {
  const pricingObj =
    addOn?.pricing && typeof addOn.pricing === "object" ? addOn.pricing : null;

  const modelRaw =
    pricingObj?.model ??
    addOn?.pricingModel ??
    addOn?.pricing_model ??
    addOn?.model ??
    "";

  const amountRaw =
    pricingObj?.amount ?? addOn?.amount ?? addOn?.price ?? addOn?.value ?? 0;

  const unitRaw =
    pricingObj?.unit ??
    pricingObj?.periodUnit ??
    addOn?.unit ??
    addOn?.periodUnit ??
    addOn?.period_unit ??
    "";

  return {
    model: String(modelRaw).toUpperCase(),
    amount: toNumberSafe(amountRaw),
    unit: String(unitRaw).toUpperCase(),
  };
}

function calcAddOnValue(addOn, attendees, durationHours) {
  const { model, amount, unit } = getAddOnPricing(addOn);

  if (model === "PER_EVENT") return { value: amount, supported: true };
  if (model === "PER_PERSON")
    return { value: amount * toNumberSafe(attendees), supported: true };

  if (model === "PER_PERIOD") {
    if (unit === "HOUR")
      return { value: amount * toNumberSafe(durationHours), supported: true };
    return { value: 0, supported: false };
  }

  return { value: 0, supported: false };
}

function calcRoomBasePricePerBooking(room, attendees) {
  const pricing = room?.pricing || {};
  const perPerson = toNumberSafe(pricing?.perPerson);
  const perRoom = toNumberSafe(pricing?.perRoom);
  const rule = String(pricing?.rule || "").toLowerCase(); // "higher" | "lower"

  const perPersonTotal =
    perPerson > 0 ? toNumberSafe(attendees) * perPerson : 0;
  const perRoomTotal = perRoom > 0 ? perRoom : 0;

  const hasPerson = perPerson > 0;
  const hasRoom = perRoom > 0;

  let base = 0;

  if (hasPerson && hasRoom) {
    if (rule === "lower") base = Math.min(perPersonTotal, perRoomTotal);
    else base = Math.max(perPersonTotal, perRoomTotal); // default to higher
  } else if (hasPerson) base = perPersonTotal;
  else if (hasRoom) base = perRoomTotal;

  return base; // treated as per-hour
}

function sum(values) {
  return (values || []).reduce((acc, n) => acc + toNumberSafe(n), 0);
}

function Card({ title, children }) {
  return (
    <section
      style={{
        border: "1px solid rgba(0,0,0,0.10)",
        borderRadius: 12,
        padding: 14,
        background: "#fff",
      }}
    >
      {title ? (
        <div style={{ fontWeight: 800, marginBottom: 10 }}>{title}</div>
      ) : null}
      {children}
    </section>
  );
}

// ---- layouts helpers (read-only consumption) ----

function getLayoutMinCapacity(layout) {
  const min =
    layout?.capacityMin ??
    layout?.min ??
    layout?.capacity_min ??
    layout?.minCapacity ??
    0;
  return toNumberSafe(min);
}

function getLayoutMaxCapacity(layout) {
  const max =
    layout?.capacityMax ??
    layout?.max ??
    layout?.capacity_max ??
    layout?.maxCapacity ??
    0;
  return toNumberSafe(max);
}

function getLayoutOnlineBookingUpTo(layout) {
  const max = getLayoutMaxCapacity(layout);
  const raw = layout?.onlineBookingUpTo;
  if (raw === null || raw === undefined || raw === "") return max; // default = capacityMax
  const n = toNumberSafe(raw);
  const min = getLayoutMinCapacity(layout);
  return Math.max(min, Math.min(max, n));
}

function getLayoutLabel(layout) {
  if (!layout) return "Unknown layout";

  const type = String(layout?.type ?? "").trim();
  const name = String(layout?.name ?? layout?.customName ?? "").trim();

  if (type.toLowerCase() === "custom") {
    return name ? `Custom — ${name}` : "Custom";
  }

  return type || "Layout";
}

function formatCapacityRange(layout) {
  const min = getLayoutMinCapacity(layout);
  const max = getLayoutMaxCapacity(layout);
  if (min && max) return `${min}–${max}`;
  if (max) return `Up to ${max}`;
  if (min) return `${min}+`;
  return "";
}

// ---------- page ----------

export default function BookerPreviewPage() {
  const hourOptions = useMemo(() => makeHourOptions(), []);
  const durationOptions = useMemo(
    () => Array.from({ length: 12 }, (_, i) => i + 1),
    []
  );

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [rooms, setRooms] = useState([]);
  const [addOns, setAddOns] = useState([]);

  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [selectedLayoutIndex, setSelectedLayoutIndex] = useState(0);

  const [startTime, setStartTime] = useState("09:00");
  const [durationHours, setDurationHours] = useState(2);
  const [attendees, setAttendees] = useState(10);

  const [selectedOptionalAddOnIds, setSelectedOptionalAddOnIds] = useState(
    () => new Set()
  );

  // UI-only: collapsible explainer (collapsed by default; never disappears)
  const [explainerExpanded, setExplainerExpanded] = useState(false);

  useEffect(() => {
    let alive = true;

    async function run() {
      setLoading(true);
      setLoadError("");

      try {
        const res = await fetch("/.netlify/functions/load_config", {
          method: "GET",
        });
        if (!res.ok) throw new Error(`load_config failed (${res.status})`);

        const payload = await res.json();
        const data = payload?.data ?? payload ?? {};
        const nextRooms = Array.isArray(data?.rooms) ? data.rooms : [];
        const nextAddOns = Array.isArray(data?.addOns) ? data.addOns : [];

        if (!alive) return;

        setRooms(nextRooms);
        setAddOns(nextAddOns);

        const firstRoom = nextRooms[0];
        const firstId = firstRoom?.id ?? firstRoom?._id ?? firstRoom?.roomId;
        setSelectedRoomId(firstId != null ? String(firstId) : "");
        setSelectedLayoutIndex(0);
      } catch (e) {
        if (!alive) return;
        setLoadError(e?.message || "Failed to load config.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, []);

  const addOnById = useMemo(() => indexAddOnsById(addOns), [addOns]);

  const selectedRoom = useMemo(() => {
    const r = (rooms || []).find(
      (x) => String(x?.id ?? x?._id ?? x?.roomId) === String(selectedRoomId)
    );
    return r || null;
  }, [rooms, selectedRoomId]);

  const roomLayoutsAll = useMemo(() => {
    const layouts = Array.isArray(selectedRoom?.layouts)
      ? selectedRoom.layouts
      : [];
    return layouts;
  }, [selectedRoom]);

  // Filter layouts by attendee eligibility
  const eligibleLayouts = useMemo(() => {
    const a = toNumberSafe(attendees);
    return (roomLayoutsAll || []).filter((l) => {
      const min = getLayoutMinCapacity(l);
      const max = getLayoutMaxCapacity(l);
      return a >= min && a <= max;
    });
  }, [roomLayoutsAll, attendees]);

  // Keep selectedLayoutIndex valid as eligibility changes
  useEffect(() => {
    if (!eligibleLayouts.length) {
      setSelectedLayoutIndex(0);
      return;
    }
    if (selectedLayoutIndex > eligibleLayouts.length - 1) {
      setSelectedLayoutIndex(0);
    }
  }, [eligibleLayouts, selectedLayoutIndex]);

  const selectedLayout = useMemo(() => {
    if (!eligibleLayouts.length) return null;
    const idx = Math.min(
      Math.max(0, toNumberSafe(selectedLayoutIndex)),
      eligibleLayouts.length - 1
    );
    return eligibleLayouts[idx] || null;
  }, [eligibleLayouts, selectedLayoutIndex]);

  const onlineBookingUpTo = useMemo(
    () => getLayoutOnlineBookingUpTo(selectedLayout),
    [selectedLayout]
  );

  const isRFQMode = useMemo(() => {
    return toNumberSafe(attendees) > toNumberSafe(onlineBookingUpTo);
  }, [attendees, onlineBookingUpTo]);

  // Clear optional selections on room/layout change (no scenario persistence)
  useEffect(() => {
    setSelectedOptionalAddOnIds(new Set());
  }, [selectedRoomId, selectedLayoutIndex]);

  const includedAddOnIds = useMemo(() => {
    const ids = selectedRoom?.includedAddOns || [];
    return Array.isArray(ids) ? ids.map((x) => String(x)) : [];
  }, [selectedRoom]);

  const optionalAddOnIdsRoomScoped = useMemo(() => {
    const ids = selectedRoom?.optionalAddOns || [];
    return Array.isArray(ids) ? ids.map((x) => String(x)) : [];
  }, [selectedRoom]);

  const includedAddOnsResolved = useMemo(() => {
    return includedAddOnIds
      .map((id) => addOnById.get(String(id)) || null)
      .filter(Boolean);
  }, [includedAddOnIds, addOnById]);

  // Optional add-ons:
  // - ONLINE: room-level optional only (curated)
  // - RFQ: full global catalogue (active + public), deduped + stable-sorted, excluding included items
  const optionalAddOnsResolved = useMemo(() => {
    const includedSet = new Set(includedAddOnIds.map(String));

    // ONLINE BOOKABLE (curated)
    if (!isRFQMode) {
      return optionalAddOnIdsRoomScoped
        .map((id) => ({
          id: String(id),
          addOn: addOnById.get(String(id)) || null,
        }))
        .filter((x) => x.addOn);
    }

    // RFQ / PRE-CONTRACT (full optional catalogue)
    const activeGlobal = Array.isArray(addOns) ? addOns : [];

    const pairs = activeGlobal
      .filter((a) => a && a.active !== false && a.public !== false)
      .map((a) => {
        const id = a?.id ?? a?._id ?? a?.addOnId ?? a?.addonId;
        return { id: id != null ? String(id) : "", addOn: a };
      })
      .filter((x) => x.id && x.addOn && !includedSet.has(String(x.id)));

    const dedupedMap = new Map();
    for (const p of pairs) {
      if (!dedupedMap.has(p.id)) dedupedMap.set(p.id, p);
    }

    const categoryOf = (a) =>
      String(a?.category ?? a?.pricing?.category ?? "").toLowerCase();
    const nameOf = (a) =>
      String(a?.name ?? a?.title ?? a?.code ?? "").toLowerCase();

    return Array.from(dedupedMap.values()).sort((x, y) => {
      const c1 = categoryOf(x.addOn);
      const c2 = categoryOf(y.addOn);
      const cCmp = c1.localeCompare(c2);
      if (cCmp !== 0) return cCmp;

      const n1 = nameOf(x.addOn);
      const n2 = nameOf(y.addOn);
      return n1.localeCompare(n2);
    });
  }, [
    isRFQMode,
    optionalAddOnIdsRoomScoped,
    addOnById,
    addOns,
    includedAddOnIds,
  ]);

  // ---- pricing (unchanged) ----
  const roomBasePerHour = useMemo(
    () => calcRoomBasePricePerBooking(selectedRoom, attendees),
    [selectedRoom, attendees]
  );
  const roomBaseTotal = useMemo(
    () => roomBasePerHour * toNumberSafe(durationHours),
    [roomBasePerHour, durationHours]
  );

  const inclusiveValues = useMemo(() => {
    return includedAddOnsResolved.map((addOn) => {
      const { value } = calcAddOnValue(addOn, attendees, durationHours);
      return value;
    });
  }, [includedAddOnsResolved, attendees, durationHours]);

  const inclusiveTotal = useMemo(() => sum(inclusiveValues), [inclusiveValues]);

  const bundlePrice = useMemo(
    () => roomBaseTotal + inclusiveTotal,
    [roomBaseTotal, inclusiveTotal]
  );
  const offerPrice = useMemo(() => bundlePrice, [bundlePrice]);

  const selectedOptionalResolved = useMemo(() => {
    const set = new Set(Array.from(selectedOptionalAddOnIds || []).map(String));
    return optionalAddOnsResolved.filter((x) => set.has(String(x.id)));
  }, [selectedOptionalAddOnIds, optionalAddOnsResolved]);

  const optionalLineItems = useMemo(() => {
    return selectedOptionalResolved.map(({ addOn }) => {
      const { model, amount, unit } = getAddOnPricing(addOn);
      const { value, supported } = calcAddOnValue(
        addOn,
        attendees,
        durationHours
      );

      const label =
        model === "PER_PERIOD"
          ? `${model}${unit ? `(${unit})` : ""}`
          : model || "UNKNOWN_MODEL";

      return {
        id: String(addOn?.id ?? addOn?._id ?? addOn?.name ?? "addon"),
        name: addOn?.name || addOn?.title || "Unnamed add-on",
        label,
        unitAmount: amount,
        value,
        supported,
      };
    });
  }, [selectedOptionalResolved, attendees, durationHours]);

  const optionalTotal = useMemo(
    () => sum(optionalLineItems.map((x) => x.value)),
    [optionalLineItems]
  );

  const provisionalPrice = useMemo(
    () => offerPrice + optionalTotal,
    [offerPrice, optionalTotal]
  );
  const finalPrice = useMemo(() => provisionalPrice, [provisionalPrice]);

  function toggleOptionalAddOn(id) {
    const key = String(id);
    setSelectedOptionalAddOnIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  if (loading) {
    return (
      <div style={{ padding: 18 }}>
        <h2 style={{ margin: 0 }}>Booker Preview</h2>
        <p style={{ opacity: 0.75 }}>Loading config…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ padding: 18 }}>
        <h2 style={{ margin: 0 }}>Booker Preview</h2>
        <p style={{ color: "crimson" }}>Error: {loadError}</p>
        <p style={{ opacity: 0.8 }}>
          This page only uses <code>/.netlify/functions/load_config</code>.
        </p>
      </div>
    );
  }

  const ctaLabel = isRFQMode ? "Request confirmation" : "Continue booking";

  return (
    <div style={{ padding: 18, maxWidth: 1000 }}>
      {/* Banner */}
      <div
        style={{
          padding: "10px 12px",
          borderRadius: 12,
          border: "1px solid rgba(0,0,0,0.12)",
          background: "rgba(0,0,0,0.03)",
          fontWeight: 800,
          marginBottom: 14,
        }}
      >
        Preview only — availability, reservation and payment are not active in this demo.
      </div>

      {/* RFQ-only messaging (required) */}
      {isRFQMode ? (
        <div
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(59, 130, 246, 0.22)",
            background: "rgba(59, 130, 246, 0.10)",
            color: "rgba(30, 64, 175, 0.95)",
            fontWeight: 900,
            marginBottom: 14,
          }}
        >
          🔒 Online booking available up to {toNumberSafe(onlineBookingUpTo)} attendees
          <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: "rgba(17, 24, 39, 0.72)" }}>
            Larger groups require confirmation — pricing shown below remains accurate.
          </div>
        </div>
      ) : null}

      <h2 style={{ margin: 0 }}>Booker Preview</h2>
      <div style={{ opacity: 0.75, marginTop: 6 }}>
        This mirrors the booker pricing flow using the same rules as Simulation.
      </div>

      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Inputs */}
        <Card title="Inputs">
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <label style={{ fontWeight: 800, display: "block", marginBottom: 6 }}>
                Room
              </label>
              <select
                value={selectedRoomId}
                onChange={(e) => {
                  setSelectedRoomId(e.target.value);
                  setSelectedLayoutIndex(0);
                }}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.15)" }}
              >
                {(rooms || []).map((r) => {
                  const id = r?.id ?? r?._id ?? r?.roomId;
                  return (
                    <option key={String(id)} value={String(id)}>
                      {getRoomDisplayName(r)}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Layout selector (filtered by attendee eligibility) */}
            <div>
              <label style={{ fontWeight: 800, display: "block", marginBottom: 6 }}>
                Layout
              </label>

              {eligibleLayouts.length === 0 ? (
                <div style={{ opacity: 0.75 }}>
                  No layouts can accommodate {toNumberSafe(attendees)} attendees for this room.
                </div>
              ) : (
                <>
                  <select
                    value={String(selectedLayoutIndex)}
                    onChange={(e) => setSelectedLayoutIndex(Math.max(0, toNumberSafe(e.target.value)))}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.15)" }}
                  >
                    {eligibleLayouts.map((l, idx) => {
                      const label = getLayoutLabel(l);
                      const cap = formatCapacityRange(l);
                      const upTo = getLayoutOnlineBookingUpTo(l);
                      return (
                        <option key={`${label}_${idx}`} value={idx}>
                          {label}{cap ? ` — ${cap}` : ""} — Online up to {upTo}
                        </option>
                      );
                    })}
                  </select>

                  <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
                    Mode: <strong>{isRFQMode ? "RFQ" : "ONLINE"}</strong> (attendees {toNumberSafe(attendees)}; online up to {toNumberSafe(onlineBookingUpTo)})
                  </div>
                </>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ fontWeight: 800, display: "block", marginBottom: 6 }}>Start time</label>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.15)" }}
                >
                  {hourOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontWeight: 800, display: "block", marginBottom: 6 }}>Duration (hours)</label>
                <select
                  value={durationHours}
                  onChange={(e) => setDurationHours(Math.min(12, Math.max(1, toNumberSafe(e.target.value))))}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.15)" }}
                >
                  {durationOptions.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontWeight: 800, display: "block", marginBottom: 6 }}>Attendees</label>
              <input
                type="number"
                min={0}
                value={attendees}
                onChange={(e) => setAttendees(Math.max(0, toNumberSafe(e.target.value)))}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.15)" }}
              />
            </div>

            <div style={{ fontSize: 12, opacity: 0.75 }}>
              Hour blocks only • Duration capped at 12 hours (MVP)
            </div>
          </div>
        </Card>

        {/* Optional add-ons */}
        <Card title={isRFQMode ? "Optional add-ons (full catalogue)" : "Optional add-ons"}>
          {optionalAddOnsResolved.length === 0 ? (
            <div style={{ opacity: 0.75 }}>
              {isRFQMode ? "No active public add-ons in catalogue." : "No optional add-ons for this room."}
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {optionalAddOnsResolved.map(({ id, addOn }) => {
                const name = addOn?.name || addOn?.title || "Unnamed add-on";
                const { model, amount, unit } = getAddOnPricing(addOn);
                const { value, supported } = calcAddOnValue(addOn, attendees, durationHours);

                const modelLabel =
                  model === "PER_PERIOD"
                    ? `${model}${unit ? `(${unit})` : ""}`
                    : model || "UNKNOWN_MODEL";

                return (
                  <label
                    key={String(id)}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      padding: 10,
                      border: "1px solid rgba(0,0,0,0.08)",
                      borderRadius: 10,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedOptionalAddOnIds.has(String(id))}
                      onChange={() => toggleOptionalAddOn(id)}
                      style={{ marginTop: 3 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800 }}>{name}</div>
                      <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
                        {modelLabel} • Unit: {formatMoney(amount)}
                        {supported ? ` • Adds: ${formatMoney(value)}` : " • Not supported in preview (treated as €0)"}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Booker display */}
      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
        <Card title="Your price (preview)">
          {includedAddOnsResolved.length > 0 ? (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>Included in your price:</div>
              <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.85 }}>
                {includedAddOnsResolved.map((a) => {
                  const key = String(a?.id ?? a?._id ?? a?.name ?? "included");
                  const nm = a?.name || a?.title || "Unnamed add-on";
                  return <li key={key}>{nm}</li>;
                })}
              </ul>
            </div>
          ) : null}

          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div style={{ fontWeight: 800 }}>Offer Price</div>
              <div style={{ fontWeight: 900 }}>{formatMoney(offerPrice)}</div>
            </div>

            {optionalLineItems.length > 0 ? (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 800, marginBottom: 6 }}>Selected optional add-ons</div>
                <div style={{ display: "grid", gap: 6 }}>
                  {optionalLineItems.map((x) => (
                    <div key={x.id} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ fontWeight: 700 }}>
                        {x.name} <span style={{ fontSize: 12, opacity: 0.7 }}>({x.label})</span>
                      </div>
                      <div style={{ fontWeight: 900 }}>{formatMoney(x.value)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div style={{ height: 1, background: "rgba(0,0,0,0.10)", margin: "10px 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div style={{ fontWeight: 800 }}>Provisional Price</div>
              <div style={{ fontWeight: 900 }}>{formatMoney(provisionalPrice)}</div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div style={{ fontWeight: 800 }}>Final Price</div>
              <div style={{ fontWeight: 900 }}>{formatMoney(finalPrice)}</div>
            </div>

            <div style={{ marginTop: 12 }}>
              <button
                type="button"
                disabled
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.18)",
                  background: "rgba(0,0,0,0.04)",
                  fontWeight: 900,
                  cursor: "not-allowed",
                }}
                title="No booking/submission logic in this preview."
              >
                {ctaLabel}
              </button>
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>
                {isRFQMode
                  ? "RFQ mode: confirmation is required. Pricing shown remains accurate."
                  : "Online mode: booking flow continues. (Booking/payment not active in this preview.)"}
              </div>
            </div>

            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
              Inclusive add-on values are hidden in this preview by design.
            </div>
          </div>
        </Card>
      </div>

      <div style={{ marginTop: 14, fontSize: 12, opacity: 0.75 }}>
        Data source: <code>/.netlify/functions/load_config</code> only. No scenarios are saved. (No POST requests.)
      </div>
    </div>
  );
}
