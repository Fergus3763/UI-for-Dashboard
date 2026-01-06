import React, { useEffect, useMemo, useState } from "react";

import Section from "../../../components/ui/Section";
import Card from "../../../components/ui/Card";
import Divider from "../../../components/ui/Divider";
import Badge from "../../../components/ui/Badge";

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
      explanation = `min(attendees × perPerson, perRoom) = min(${attendees} × ${formatMoney(perPerson)}, ${formatMoney(
        perRoom
      )})`;
    } else {
      // Default to "higher" if unspecified
      base = Math.max(perPersonTotal, perRoomTotal);
      explanation = `max(attendees × perPerson, perRoom) = max(${attendees} × ${formatMoney(perPerson)}, ${formatMoney(
        perRoom
      )})`;
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

function Field({ label, hint, children }) {
  return (
    <div>
      <label style={{ fontWeight: 740, display: "block", marginBottom: 6, color: "rgba(17, 24, 39, 0.92)" }}>
        {label}
      </label>
      {children}
      {hint ? (
        <div style={{ fontSize: 12, lineHeight: "16px", color: "rgba(17, 24, 39, 0.62)", marginTop: 6 }}>{hint}</div>
      ) : null}
    </div>
  );
}

function Control({ as = "input", style, ...props }) {
  const Component = as;
  return (
    <Component
      {...props}
      style={{
        width: "100%",
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid rgba(17, 24, 39, 0.14)",
        background: "#fff",
        color: "rgba(17, 24, 39, 0.92)",
        outline: "none",
        ...style,
      }}
    />
  );
}

function Row({ label, value, sub }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 14, padding: "10px 0" }}>
      <div style={{ minWidth: 240 }}>
        <div style={{ fontWeight: 720, color: "rgba(17, 24, 39, 0.92)" }}>{label}</div>
        {sub ? <div style={{ fontSize: 12, lineHeight: "16px", color: "rgba(17, 24, 39, 0.62)", marginTop: 4 }}>{sub}</div> : null}
      </div>
      <div style={{ fontWeight: 820, whiteSpace: "nowrap", color: "rgba(17, 24, 39, 0.92)" }}>{value}</div>
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

  // UI-only: explainer visibility (local; not persisted)
  const [showExplainer, setShowExplainer] = useState(true);

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

  const roomBaseTotal = useMemo(
    () => roomBasePerHour.basePrice * toNumberSafe(durationHours),
    [roomBasePerHour.basePrice, durationHours]
  );

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
        <h1 style={{ margin: 0, fontSize: 18, lineHeight: "22px", fontWeight: 820, color: "rgba(17, 24, 39, 0.92)" }}>
          Simulation / Modelling
        </h1>
        <p style={{ marginTop: 8, color: "rgba(17, 24, 39, 0.62)" }}>Loading config…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ padding: 18 }}>
        <h1 style={{ margin: 0, fontSize: 18, lineHeight: "22px", fontWeight: 820, color: "rgba(17, 24, 39, 0.92)" }}>
          Simulation / Modelling
        </h1>
        <div style={{ marginTop: 10 }}>
          <Badge tone="error">Error</Badge>
          <div style={{ marginTop: 8, color: "rgba(185, 28, 28, 0.95)", fontWeight: 700 }}>{loadError}</div>
        </div>
        <p style={{ marginTop: 12, color: "rgba(17, 24, 39, 0.62)" }}>
          This page only uses <code>/.netlify/functions/load_config</code>.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: 18, maxWidth: 1120 }}>
      <Section
        title="Simulation / Modelling"
        description='Hotel-only, read-only price simulator (no saving). Purpose: “What price will the booker see and pay?”'
      />

      {/* Self-guided explainer (UI-only) */}
      {showExplainer ? (
        <div style={{ marginTop: 14 }}>
          <Card title="Why this page exists" subtitle="A quick, self-guided explanation for hotel admins (read-only).">
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                  <Badge tone="neutral">Read-only</Badge>
                  <Badge tone="included">Confidence tool</Badge>
                  <Badge tone="optional">No saving</Badge>
                </div>

                <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                  <div>
                    <div style={{ fontWeight: 820, color: "rgba(17, 24, 39, 0.92)" }}>What this page does</div>
                    <div style={{ marginTop: 6, color: "rgba(17, 24, 39, 0.62)", lineHeight: "18px" }}>
                      This page lets you test and verify exactly how your meeting room pricing behaves before any guest ever sees it.
                    </div>
                  </div>

                  <div>
                    <div style={{ fontWeight: 820, color: "rgba(17, 24, 39, 0.92)" }}>Why the hotel needs this set up</div>
                    <div style={{ marginTop: 6, color: "rgba(17, 24, 39, 0.62)", lineHeight: "18px" }}>
                      Meeting room pricing is complex. This simulator gives you confidence that every cost you’ve configured — room rates,
                      included services, and optional add-ons — is correctly reflected in the final price.
                    </div>
                  </div>

                  <div>
                    <div style={{ fontWeight: 820, color: "rgba(17, 24, 39, 0.92)" }}>How this is used downstream</div>
                    <div style={{ marginTop: 6, color: "rgba(17, 24, 39, 0.62)", lineHeight: "18px" }}>
                      The same pricing rules used here power the Booker Preview and live booking experience. If the numbers are correct
                      here, they will be correct for your guests.
                    </div>
                  </div>

                  <div>
                    <div style={{ fontWeight: 820, color: "rgba(17, 24, 39, 0.92)" }}>What confidence and control this gives you</div>
                    <div style={{ marginTop: 6, color: "rgba(17, 24, 39, 0.62)", lineHeight: "18px" }}>
                      You can safely adjust pricing, test scenarios, and explore different meeting sizes knowing exactly what price a
                      guest will see — before committing anything live.
                    </div>
                  </div>
                </div>

                <Divider style={{ margin: "14px 0" }} />

                <div style={{ fontSize: 12, lineHeight: "16px", color: "rgba(17, 24, 39, 0.62)" }}>
                  This page is intentionally read-only. Data source: <code>/.netlify/functions/load_config</code> (GET only).
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowExplainer(false)}
                style={{
                  border: "1px solid rgba(17, 24, 39, 0.14)",
                  background: "#fff",
                  color: "rgba(17, 24, 39, 0.82)",
                  borderRadius: 10,
                  padding: "8px 10px",
                  fontWeight: 760,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
                aria-label="Dismiss explainer"
              >
                Dismiss
              </button>
            </div>
          </Card>
        </div>
      ) : (
        <div style={{ marginTop: 14 }}>
          <button
            type="button"
            onClick={() => setShowExplainer(true)}
            style={{
              border: "1px solid rgba(17, 24, 39, 0.14)",
              background: "rgba(17, 24, 39, 0.02)",
              color: "rgba(17, 24, 39, 0.82)",
              borderRadius: 12,
              padding: "10px 12px",
              fontWeight: 760,
              cursor: "pointer",
            }}
          >
            Show “Why this page exists”
          </button>
        </div>
      )}

      {/* Inputs */}
      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card title="Simulator Inputs" subtitle="Configure a scenario. No scenarios are saved.">
          <div style={{ display: "grid", gap: 12 }}>
            <Field label="Room">
              <Control as="select" value={selectedRoomId} onChange={(e) => setSelectedRoomId(e.target.value)}>
                {(rooms || []).map((r) => {
                  const id = r?.id ?? r?._id ?? r?.roomId;
                  return (
                    <option key={String(id)} value={String(id)}>
                      {getRoomDisplayName(r)}
                    </option>
                  );
                })}
              </Control>
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Start time (hour blocks)" hint="This simulator assumes bookings are sold in whole-hour blocks.">
                <Control as="select" value={startTime} onChange={(e) => setStartTime(e.target.value)}>
                  {hourOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Control>
              </Field>

              <Field label="Duration (hours)">
                <Control
                  as="select"
                  value={durationHours}
                  onChange={(e) => setDurationHours(Math.min(12, Math.max(1, toNumberSafe(e.target.value))))}
                >
                  {durationOptions.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </Control>
              </Field>
            </div>

            <Field label="Attendees" hint="Default: 10">
              <Control
                type="number"
                min={0}
                value={attendees}
                onChange={(e) => setAttendees(Math.max(0, toNumberSafe(e.target.value)))}
              />
            </Field>
          </div>
        </Card>

        <Card title="Optional Add-Ons (selectable)" subtitle="Inclusive add-ons are bundled and not selectable here.">
          {optionalAddOnsResolved.length === 0 ? (
            <div style={{ color: "rgba(17, 24, 39, 0.62)" }}>No optional add-ons for this room.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {optionalAddOnsResolved.map(({ id, addOn }) => {
                const name = addOn?.name || addOn?.title || "Unnamed add-on";
                const { model, amount, unit } = getAddOnPricing(addOn);
                const { value, supported, note } = calcAddOnValue(addOn, attendees, durationHours);

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
                      padding: 12,
                      border: "1px solid rgba(17, 24, 39, 0.10)",
                      borderRadius: 12,
                      cursor: "pointer",
                      background: "rgba(17, 24, 39, 0.02)",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedOptionalAddOnIds.has(String(id))}
                      onChange={() => toggleOptionalAddOn(id)}
                      style={{ marginTop: 3 }}
                    />

                    <div style={{ flex: 1, display: "grid", gap: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                        <div style={{ fontWeight: 780, color: "rgba(17, 24, 39, 0.92)" }}>{name}</div>
                        <Badge tone="optional">Optional</Badge>
                      </div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                        <Badge tone="neutral">{modelLabel}</Badge>
                        <div style={{ fontSize: 12, color: "rgba(17, 24, 39, 0.62)" }}>Unit: {formatMoney(amount)}</div>

                        {supported ? (
                          <div style={{ fontSize: 12, color: "rgba(17, 24, 39, 0.62)" }}>
                            This scenario adds:{" "}
                            <span style={{ fontWeight: 800, color: "rgba(17, 24, 39, 0.92)" }}>{formatMoney(value)}</span>
                          </div>
                        ) : (
                          <div style={{ fontSize: 12, color: "rgba(17, 24, 39, 0.62)" }}>
                            {note} (treated as {formatMoney(0)})
                          </div>
                        )}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Outputs */}
      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Hotel breakdown */}
        <Card title="Hotel Breakdown (full visibility)" subtitle="All pricing components displayed for internal confidence.">
          <Row label="Start time" sub="Hour blocks only" value={startTime} />
          <Divider />
          <Row label="Duration Hours" sub="Whole hours (1–12)" value={`${durationHours} hour(s)`} />
          <Divider />

          <Row label="Room Base Price (per hour)" sub={roomBasePerHour.explanation} value={formatMoney(roomBasePerHour.basePrice)} />
          <Divider />

          <Row
            label="Room Base Price (total)"
            sub={`per-hour base × duration = ${formatMoney(roomBasePerHour.basePrice)} × ${durationHours}`}
            value={formatMoney(roomBaseTotal)}
          />

          <Divider style={{ margin: "14px 0" }} />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ fontWeight: 820, color: "rgba(17, 24, 39, 0.92)" }}>Inclusive Add-Ons (bundled)</div>
            <Badge tone="included">Included</Badge>
          </div>

          <div style={{ marginTop: 10 }}>
            {includedAddOnsResolved.length === 0 ? (
              <div style={{ color: "rgba(17, 24, 39, 0.62)" }}>None</div>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {inclusiveValues.map(({ addOn, value, supported, note }) => {
                  const name = addOn?.name || addOn?.title || "Unnamed add-on";
                  const { model, amount, unit } = getAddOnPricing(addOn);

                  const modelLabel =
                    model === "PER_PERIOD"
                      ? `${model}${unit ? `(${unit})` : ""}`
                      : model || "UNKNOWN_MODEL";

                  const multiplierNote =
                    model === "PER_PERSON"
                      ? `× attendees (${attendees})`
                      : model === "PER_PERIOD" && unit === "HOUR"
                        ? `× duration (${durationHours})`
                        : "";

                  return (
                    <div
                      key={String(addOn?.id ?? addOn?._id ?? name)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        padding: "10px 12px",
                        borderRadius: 12,
                        border: "1px solid rgba(17, 24, 39, 0.10)",
                        background: "#fff",
                      }}
                    >
                      <div style={{ display: "grid", gap: 6 }}>
                        <div style={{ fontWeight: 760, color: "rgba(17, 24, 39, 0.92)" }}>{name}</div>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                          <Badge tone="neutral">{modelLabel}</Badge>
                          <div style={{ fontSize: 12, color: "rgba(17, 24, 39, 0.62)" }}>
                            {formatMoney(amount)} {multiplierNote ? ` ${multiplierNote}` : ""}
                          </div>
                          {!supported ? (
                            <div style={{ fontSize: 12, color: "rgba(17, 24, 39, 0.62)" }}>{note}</div>
                          ) : null}
                        </div>
                      </div>

                      <div style={{ fontWeight: 840, whiteSpace: "nowrap", color: "rgba(17, 24, 39, 0.92)" }}>
                        {formatMoney(value)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Divider />
          <Row label="Inclusive Add-Ons Total" sub="Sum(Inclusive Add-Ons values)" value={formatMoney(inclusiveTotal)} />
          <Divider />
          <Row label="Bundle Price" sub="Room Base Price (total) + Inclusive Add-Ons Total" value={formatMoney(bundlePrice)} />
          <Divider />
          <Row label="Offer Price" sub="Booker sees initially (MVP: equals Bundle Price)" value={formatMoney(offerPrice)} />

          <Divider style={{ margin: "14px 0" }} />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ fontWeight: 820, color: "rgba(17, 24, 39, 0.92)" }}>Selected Optional Add-Ons</div>
            <Badge tone="optional">Optional</Badge>
          </div>

          <div style={{ marginTop: 10 }}>
            {optionalValues.length === 0 ? (
              <div style={{ color: "rgba(17, 24, 39, 0.62)" }}>None selected</div>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {optionalValues.map(({ addOn, value, supported, note }) => {
                  const name = addOn?.name || addOn?.title || "Unnamed add-on";
                  const { model, amount, unit } = getAddOnPricing(addOn);

                  const modelLabel =
                    model === "PER_PERIOD"
                      ? `${model}${unit ? `(${unit})` : ""}`
                      : model || "UNKNOWN_MODEL";

                  const multiplierNote =
                    model === "PER_PERSON"
                      ? `× attendees (${attendees})`
                      : model === "PER_PERIOD" && unit === "HOUR"
                        ? `× duration (${durationHours})`
                        : "";

                  return (
                    <div
                      key={String(addOn?.id ?? addOn?._id ?? name)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        padding: "10px 12px",
                        borderRadius: 12,
                        border: "1px solid rgba(17, 24, 39, 0.10)",
                        background: "#fff",
                      }}
                    >
                      <div style={{ display: "grid", gap: 6 }}>
                        <div style={{ fontWeight: 760, color: "rgba(17, 24, 39, 0.92)" }}>{name}</div>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                          <Badge tone="neutral">{modelLabel}</Badge>
                          <div style={{ fontSize: 12, color: "rgba(17, 24, 39, 0.62)" }}>
                            {formatMoney(amount)} {multiplierNote ? ` ${multiplierNote}` : ""}
                          </div>
                          {!supported ? (
                            <div style={{ fontSize: 12, color: "rgba(17, 24, 39, 0.62)" }}>{note}</div>
                          ) : null}
                        </div>
                      </div>

                      <div style={{ fontWeight: 840, whiteSpace: "nowrap", color: "rgba(17, 24, 39, 0.92)" }}>
                        {formatMoney(value)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Divider />
          <Row label="Optional Add-Ons Total" sub="Sum(Selected Optional Add-Ons values)" value={formatMoney(optionalTotal)} />
          <Divider />
          <Row label="Provisional Price" sub="Offer Price + Optional Add-Ons Total" value={formatMoney(provisionalPrice)} />
          <Divider />
          <Row label="Final Price" sub="MVP: equals Provisional Price" value={formatMoney(finalPrice)} />
        </Card>

        {/* Booker preview */}
        <Card title="Booker Preview (minimal)" subtitle="Layout polish only. No embed styling changes.">
          <Row label="Offer Price" sub="Initial price shown to booker" value={formatMoney(offerPrice)} />
          <Divider />
          <Row label="Selected Optional Add-Ons Total" sub="Inclusive values hidden" value={formatMoney(optionalTotal)} />
          <Divider />
          <Row label="Final Price" sub="MVP: equals Provisional at confirmation" value={formatMoney(finalPrice)} />

          <div style={{ marginTop: 12, fontSize: 12, lineHeight: "16px", color: "rgba(17, 24, 39, 0.62)" }}>
            Inclusive add-on values are intentionally hidden in the Booker preview (bundled into Offer Price).
          </div>
        </Card>
      </div>

      {/* Footnote */}
      <div style={{ marginTop: 14, fontSize: 12, lineHeight: "16px", color: "rgba(17, 24, 39, 0.62)" }}>
        Data source: <code>/.netlify/functions/load_config</code> only. No scenarios are saved. (No POST requests.)
      </div>
    </div>
  );
}
