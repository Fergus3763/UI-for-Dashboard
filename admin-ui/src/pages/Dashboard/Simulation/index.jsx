import React, { useEffect, useMemo, useState } from "react";

/**
 * Simulation / Modelling — Hotel-only Price Simulator (Phase 2: Hour Blocks + PER_PERIOD(HOUR))
 *
 * Hard constraints satisfied:
 * - Uses ONLY GET /.netlify/functions/load_config
 * - Read-only: saves nothing, writes nothing
 * - Does not touch booking/reserve/payment, room setup, add-on DB logic, netlify functions, or supabase schema
 *
 * Pricing terms (HUB #8):
 * A) Room Base Price (now per-hour + total)
 * B) Bundle Price
 * C) Offer Price
 * D) Provisional Price
 * E) Final Price
 */

// ---------- Small helpers (allowed: inside this file only) ----------

function toNumberSafe(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(amount) {
  const n = toNumberSafe(amount);
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR" }).format(n);
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

/**
 * Normalise add-on pricing fields.
 * If pricing model lives in addOn.pricing.model and addOn.pricing.amount, use that.
 * Otherwise fall back to top-level fields used previously.
 */
function getAddOnPricing(addOn) {
  const pricingObj = addOn?.pricing && typeof addOn.pricing === "object" ? addOn.pricing : null;

  const modelRaw =
    pricingObj?.model ??
    addOn?.pricingModel ??
    addOn?.pricing_model ??
    addOn?.model ??
    "";

  const amountRaw =
    pricingObj?.amount ??
    addOn?.amount ??
    addOn?.price ??
    addOn?.value ??
    0;

  // Some schemas may include a unit for PER_PERIOD (e.g., HOUR / DAY)
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

/**
 * Add-on pricing models supported for Phase 2:
 * - PER_EVENT: add once
 * - PER_PERSON: add × attendees
 * - PER_PERIOD + HOUR: add × durationHours
 *
 * Unsupported:
 * - PER_PERIOD + DAY or other units
 * - PER_UNIT
 * - Unknown models
 * => show "Not yet supported in simulator" and treat as 0
 */
function calcAddOnValue(addOn, attendees, durationHours) {
  const { model, amount, unit } = getAddOnPricing(addOn);

  if (model === "PER_EVENT") return { value: amount, supported: true, note: "" };
  if (model === "PER_PERSON") return { value: amount * toNumberSafe(attendees), supported: true, note: "" };

  if (model === "PER_PERIOD") {
    if (unit === "HOUR") {
      return { value: amount * toNumberSafe(durationHours), supported: true, note: "" };
    }
    return { value: 0, supported: false, note: "Not yet supported in simulator (PER_PERIOD non-hour)" };
  }

  if (model === "PER_UNIT") return { value: 0, supported: false, note: "Not yet supported in simulator (PER_UNIT)" };

  // Unknown model: treat as unsupported (safe default)
  return { value: 0, supported: false, note: "Not yet supported in simulator" };
}

/**
 * A) Room Base Price (hotel-only)
 * Existing base formula stays EXACTLY as-is:
 *
 * per-person total = attendees × perPerson
 * per-room total = perRoom
 * apply rule if both exist (room.pricing.rule = "higher" or "lower")
 *
 * Phase 2:
 * - Treat result as "per hour"
 * - Total = per-hour base × durationHours
 */
function calcRoomBasePricePerBooking(room, attendees) {
  const pricing = room?.pricing || {};
  const perPerson = toNumberSafe(pricing?.perPerson);
  const perRoom = toNumberSafe(pricing?.perRoom);
  const rule = String(pricing?.rule || "").toLowerCase(); // "higher" or "lower"

  const perPersonTotal = perPerson > 0 ? toNumberSafe(attendees) * perPerson : 0;
  const perRoomTotal = perRoom > 0 ? perRoom : 0;

  let base = 0;
  let explanation = "";

  const hasPerson = perPerson > 0;
  const hasRoom = perRoom > 0;

  if (hasPerson && hasRoom) {
    if (rule === "lower") {
      base = Math.min(perPersonTotal, perRoomTotal);
      explanation = `min(attendees × perPerson, perRoom) = min(${attendees} × ${formatMoney(perPerson)}, ${formatMoney(perRoom)})`;
    } else {
      // Default to "higher" if unspecified
      base = Math.max(perPersonTotal, perRoomTotal);
      explanation = `max(attendees × perPerson, perRoom) = max(${attendees} × ${formatMoney(perPerson)}, ${formatMoney(perRoom)})`;
    }
  } else if (hasPerson) {
    base = perPersonTotal;
    explanation = `attendees × perPerson = ${attendees} × ${formatMoney(perPerson)}`;
  } else if (hasRoom) {
    base = perRoomTotal;
    explanation = `perRoom = ${formatMoney(perRoom)}`;
  } else {
    base = 0;
    explanation = "No pricing found on room.pricing (perPerson/perRoom).";
  }

  return { basePrice: base, explanation, perPerson, perRoom, rule: rule || (hasPerson && hasRoom ? "higher (default)" : "") };
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
      <div style={{ fontWeight: 800, marginBottom: 10 }}>{title}</div>
      {children}
    </section>
  );
}

function Row({ label, value, sub }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 14, padding: "8px 0", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
      <div style={{ minWidth: 240 }}>
        <div style={{ fontWeight: 700 }}>{label}</div>
        {sub ? <div style={{ fontSize: 12, opacity: 0.75, marginTop: 3 }}>{sub}</div> : null}
      </div>
      <div style={{ fontWeight: 800, whiteSpace: "nowrap" }}>{value}</div>
    </div>
  );
}

// ---------- Page ----------

export default function SimulationPage() {
  const hourOptions = useMemo(() => makeHourOptions(), []);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [rooms, setRooms] = useState([]);
  const [addOns, setAddOns] = useState([]);

  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [attendees, setAttendees] = useState(10);

  // Phase 2 inputs
  const [startTime, setStartTime] = useState("09:00"); // full hours only
  const [durationHours, setDurationHours] = useState(2); // 1..12

  const [selectedOptionalAddOnIds, setSelectedOptionalAddOnIds] = useState(() => new Set());

  useEffect(() => {
    let alive = true;

    async function run() {
      setLoading(true);
      setLoadError("");

      try {
        const res = await fetch("/.netlify/functions/load_config", { method: "GET" });
        if (!res.ok) throw new Error(`load_config failed (${res.status})`);

        // REQUIRED FIX: load_config returns config under payload.data
        const payload = await res.json();
        const data = payload?.data ?? payload ?? {};
        const nextRooms = Array.isArray(data?.rooms) ? data.rooms : [];
        const nextAddOns = Array.isArray(data?.addOns) ? data.addOns : [];

        if (!alive) return;

        setRooms(nextRooms);
        setAddOns(nextAddOns);

        // default room selection
        const firstRoom = nextRooms[0];
        const firstId = firstRoom?.id ?? firstRoom?._id ?? firstRoom?.roomId;
        setSelectedRoomId(firstId != null ? String(firstId) : "");
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
    const r = (rooms || []).find((x) => String(x?.id ?? x?._id ?? x?.roomId) === String(selectedRoomId));
    return r || null;
  }, [rooms, selectedRoomId]);

  // When room changes, clear selected optional add-ons (scenarios are not persisted)
  useEffect(() => {
    setSelectedOptionalAddOnIds(new Set());
  }, [selectedRoomId]);

  const includedAddOnIds = useMemo(() => {
    const ids = selectedRoom?.includedAddOns || [];
    return Array.isArray(ids) ? ids.map((x) => String(x)) : [];
  }, [selectedRoom]);

  const optionalAddOnIds = useMemo(() => {
    const ids = selectedRoom?.optionalAddOns || [];
    return Array.isArray(ids) ? ids.map((x) => String(x)) : [];
  }, [selectedRoom]);

  const includedAddOnsResolved = useMemo(() => {
    return includedAddOnIds
      .map((id) => ({ id, addOn: addOnById.get(String(id)) || null }))
      .filter((x) => x.addOn);
  }, [includedAddOnIds, addOnById]);

  const optionalAddOnsResolved = useMemo(() => {
    return optionalAddOnIds
      .map((id) => ({ id, addOn: addOnById.get(String(id)) || null }))
      .filter((x) => x.addOn);
  }, [optionalAddOnIds, addOnById]);

  // Existing base formula result (treated as per-hour in Phase 2)
  const roomBasePerHour = useMemo(() => calcRoomBasePricePerBooking(selectedRoom, attendees), [selectedRoom, attendees]);

  const roomBaseTotal = useMemo(() => roomBasePerHour.basePrice * toNumberSafe(durationHours), [roomBasePerHour.basePrice, durationHours]);

  const inclusiveValues = useMemo(() => {
    return includedAddOnsResolved.map(({ addOn }) => {
      const { value, supported, note } = calcAddOnValue(addOn, attendees, durationHours);
      return { addOn, value, supported, note };
    });
  }, [includedAddOnsResolved, attendees, durationHours]);

  const inclusiveTotal = useMemo(() => sum(inclusiveValues.map((x) => x.value)), [inclusiveValues]);

  // B) Bundle Price = Room Base Price (total) + Sum(Inclusive Add-Ons values)
  const bundlePrice = useMemo(() => roomBaseTotal + inclusiveTotal, [roomBaseTotal, inclusiveTotal]);

  // C) Offer Price = Bundle Price
  const offerPrice = useMemo(() => bundlePrice, [bundlePrice]);

  const selectedOptionalResolved = useMemo(() => {
    const ids = Array.from(selectedOptionalAddOnIds || []);
    const set = new Set(ids.map(String));
    return optionalAddOnsResolved.filter((x) => set.has(String(x.id)));
  }, [selectedOptionalAddOnIds, optionalAddOnsResolved]);

  const optionalValues = useMemo(() => {
    return selectedOptionalResolved.map(({ addOn }) => {
      const { value, supported, note } = calcAddOnValue(addOn, attendees, durationHours);
      return { addOn, value, supported, note };
    });
  }, [selectedOptionalResolved, attendees, durationHours]);

  const optionalTotal = useMemo(() => sum(optionalValues.map((x) => x.value)), [optionalValues]);

  // D) Provisional Price = Offer Price + Sum(Selected Optional Add-Ons)
  const provisionalPrice = useMemo(() => offerPrice + optionalTotal, [offerPrice, optionalTotal]);

  // E) Final Price (MVP = Provisional at time of confirmation)
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

  const durationOptions = useMemo(() => {
    const opts = [];
    for (let i = 1; i <= 12; i += 1) opts.push(i);
    return opts;
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 18 }}>
        <h2 style={{ margin: 0 }}>Simulation / Modelling</h2>
        <p style={{ opacity: 0.75 }}>Loading config…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ padding: 18 }}>
        <h2 style={{ margin: 0 }}>Simulation / Modelling</h2>
        <p style={{ color: "crimson" }}>Error: {loadError}</p>
        <p style={{ opacity: 0.8 }}>
          This page only uses <code>/.netlify/functions/load_config</code>.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: 18, maxWidth: 1100 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0 }}>Simulation / Modelling</h2>
          <div style={{ opacity: 0.75, marginTop: 6 }}>
            Hotel-only, read-only price simulator (no saving). Purpose: “What price will the booker see and pay?”
          </div>
        </div>
      </div>

      {/* Inputs */}
      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card title="Simulator Inputs">
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <label style={{ fontWeight: 800, display: "block", marginBottom: 6 }}>Room</label>
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
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

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ fontWeight: 800, display: "block", marginBottom: 6 }}>Start time (hour blocks)</label>
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

            <div style={{ fontSize: 12, opacity: 0.75 }}>
              This simulator assumes bookings are sold in whole-hour blocks.
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
              <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>Default: 10</div>
            </div>
          </div>
        </Card>

        <Card title="Optional Add-Ons (selectable)">
          {optionalAddOnsResolved.length === 0 ? (
            <div style={{ opacity: 0.75 }}>No optional add-ons for this room.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {optionalAddOnsResolved.map(({ id, addOn }) => {
                const name = addOn?.name || addOn?.title || "Unnamed add-on";
                const { model, amount, unit } = getAddOnPricing(addOn);
                const { value, supported, note } = calcAddOnValue(addOn, attendees, durationHours);

                const modelLabel =
                  model === "PER_PERIOD"
                    ? `${model}${unit ? `(${unit})` : ""}`
                    : (model || "UNKNOWN_MODEL");

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
                        {supported ? ` • This scenario adds: ${formatMoney(value)}` : ` • ${note} (treated as ${formatMoney(0)})`}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
            Inclusive add-ons are bundled and not selectable here.
          </div>
        </Card>
      </div>

      {/* Outputs */}
      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Hotel breakdown */}
        <Card title="Hotel Breakdown (full visibility)">
          <Row label="Start time" sub="Hour blocks only" value={startTime} />
          <Row label="Duration Hours" sub="Whole hours (1–12)" value={`${durationHours} hour(s)`} />

          <Row
            label="Room Base Price (per hour)"
            sub={roomBasePerHour.explanation}
            value={formatMoney(roomBasePerHour.basePrice)}
          />
          <Row
            label="Room Base Price (total)"
            sub={`per-hour base × duration = ${formatMoney(roomBasePerHour.basePrice)} × ${durationHours}`}
            value={formatMoney(roomBaseTotal)}
          />

          <div style={{ padding: "8px 0" }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Inclusive Add-Ons (bundled)</div>
            {includedAddOnsResolved.length === 0 ? (
              <div style={{ opacity: 0.75 }}>None</div>
            ) : (
              <div style={{ display: "grid", gap: 6 }}>
                {inclusiveValues.map(({ addOn, value, supported, note }) => {
                  const name = addOn?.name || addOn?.title || "Unnamed add-on";
                  const { model, amount, unit } = getAddOnPricing(addOn);

                  const modelLabel =
                    model === "PER_PERIOD"
                      ? `${model}${unit ? `(${unit})` : ""}`
                      : (model || "UNKNOWN_MODEL");

                  const multiplierNote =
                    model === "PER_PERSON"
                      ? `× attendees (${attendees})`
                      : (model === "PER_PERIOD" && unit === "HOUR")
                        ? `× duration (${durationHours})`
                        : "";

                  return (
                    <div key={String(addOn?.id ?? addOn?._id ?? name)} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ fontWeight: 700 }}>
                        {name}
                        <span style={{ marginLeft: 8, fontSize: 12, opacity: 0.7 }}>
                          {modelLabel} • {formatMoney(amount)} {multiplierNote ? ` ${multiplierNote}` : ""}
                        </span>
                        {!supported ? <span style={{ marginLeft: 8, fontSize: 12, opacity: 0.7 }}>({note})</span> : null}
                      </div>
                      <div style={{ fontWeight: 800 }}>{formatMoney(value)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Row label="Inclusive Add-Ons Total" sub="Sum(Inclusive Add-Ons values)" value={formatMoney(inclusiveTotal)} />

          <Row
            label="Bundle Price"
            sub="Room Base Price (total) + Inclusive Add-Ons Total"
            value={formatMoney(bundlePrice)}
          />
          <Row label="Offer Price" sub="Booker sees initially (MVP: equals Bundle Price)" value={formatMoney(offerPrice)} />

          <div style={{ padding: "8px 0" }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Selected Optional Add-Ons</div>
            {optionalValues.length === 0 ? (
              <div style={{ opacity: 0.75 }}>None selected</div>
            ) : (
              <div style={{ display: "grid", gap: 6 }}>
                {optionalValues.map(({ addOn, value, supported, note }) => {
                  const name = addOn?.name || addOn?.title || "Unnamed add-on";
                  const { model, amount, unit } = getAddOnPricing(addOn);

                  const modelLabel =
                    model === "PER_PERIOD"
                      ? `${model}${unit ? `(${unit})` : ""}`
                      : (model || "UNKNOWN_MODEL");

                  const multiplierNote =
                    model === "PER_PERSON"
                      ? `× attendees (${attendees})`
                      : (model === "PER_PERIOD" && unit === "HOUR")
                        ? `× duration (${durationHours})`
                        : "";

                  return (
                    <div key={String(addOn?.id ?? addOn?._id ?? name)} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ fontWeight: 700 }}>
                        {name}
                        <span style={{ marginLeft: 8, fontSize: 12, opacity: 0.7 }}>
                          {modelLabel} • {formatMoney(amount)} {multiplierNote ? ` ${multiplierNote}` : ""}
                        </span>
                        {!supported ? <span style={{ marginLeft: 8, fontSize: 12, opacity: 0.7 }}>({note})</span> : null}
                      </div>
                      <div style={{ fontWeight: 800 }}>{formatMoney(value)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Row label="Optional Add-Ons Total" sub="Sum(Selected Optional Add-Ons values)" value={formatMoney(optionalTotal)} />

          <Row
            label="Provisional Price"
            sub="Offer Price + Optional Add-Ons Total"
            value={formatMoney(provisionalPrice)}
          />
          <Row label="Final Price" sub="MVP: equals Provisional Price" value={formatMoney(finalPrice)} />
        </Card>

        {/* Booker preview */}
        <Card title="Booker Preview (minimal)">
          <Row label="Offer Price" sub="Initial price shown to booker" value={formatMoney(offerPrice)} />
          <Row label="Selected Optional Add-Ons Total" sub="Inclusive values hidden" value={formatMoney(optionalTotal)} />
          <Row label="Final Price" sub="MVP: equals Provisional at confirmation" value={formatMoney(finalPrice)} />

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
            Inclusive add-on values are intentionally hidden in the Booker preview (bundled into Offer Price).
          </div>
        </Card>
      </div>

      {/* Footnote */}
      <div style={{ marginTop: 14, fontSize: 12, opacity: 0.75 }}>
        Data source: <code>/.netlify/functions/load_config</code> only. No scenarios are saved. (No POST requests.)
      </div>
    </div>
  );
}
