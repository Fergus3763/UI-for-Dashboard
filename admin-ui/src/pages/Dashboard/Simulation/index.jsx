// admin-ui/src/pages/Dashboard/Simulation/index.jsx

import React, { useEffect, useMemo, useState } from "react";

/**
 * Simulation / Modelling — Hotel-only Price Simulator (MVP)
 *
 * Read-only:
 * - Uses ONLY GET /.netlify/functions/load_config
 * - Saves nothing, writes nothing
 *
 * Aligns with current config schema:
 * - load_config returns payload.data
 * - addOns store pricing in addOn.pricing.model + addOn.pricing.amount
 */

// ---------- helpers ----------

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
  const name = room?.name || "Unnamed Room";
  const code = room?.code || "";
  return code ? `${name} (${code})` : name;
}

function getRoomId(room) {
  return room?.id ?? room?.code ?? "";
}

function getAddOnId(addOn) {
  return addOn?.id ?? addOn?.code ?? addOn?.slug ?? addOn?.name ?? "";
}

function indexAddOnsById(addOns) {
  const map = new Map();
  (addOns || []).forEach((a) => {
    const id = getAddOnId(a);
    if (id) map.set(String(id), a);
  });
  return map;
}

/**
 * Add-on pricing models supported for MVP:
 * - PER_EVENT: add once
 * - PER_PERSON: add × attendees
 * Others:
 * - PER_PERIOD / PER_UNIT: show "Not yet supported in simulator" and treat as 0
 */
function calcAddOnValue(addOn, attendees) {
  const model = String(addOn?.pricing?.model || "").toUpperCase();
  const amount = toNumberSafe(addOn?.pricing?.amount);

  if (model === "PER_EVENT") return { value: amount, supported: true, note: "" };
  if (model === "PER_PERSON")
    return { value: amount * toNumberSafe(attendees), supported: true, note: "" };

  if (model === "PER_PERIOD" || model === "PER_UNIT") {
    return { value: 0, supported: false, note: "Not yet supported in simulator" };
  }

  return { value: 0, supported: false, note: "Not yet supported in simulator" };
}

/**
 * Room Base Price:
 * per-person total = attendees × perPerson
 * per-room total = perRoom
 * apply rule if both exist (rule = "higher" or "lower")
 */
function calcRoomBasePrice(room, attendees) {
  const pricing = room?.pricing || {};
  const perPerson = toNumberSafe(pricing?.perPerson);
  const perRoom = toNumberSafe(pricing?.perRoom);
  const rule = String(pricing?.rule || "").toLowerCase(); // "higher" | "lower"

  const perPersonTotal = perPerson > 0 ? toNumberSafe(attendees) * perPerson : 0;
  const perRoomTotal = perRoom > 0 ? perRoom : 0;

  let base = 0;
  let explanation = "";

  const hasPerson = perPerson > 0;
  const hasRoom = perRoom > 0;

  if (hasPerson && hasRoom) {
    if (rule === "lower") {
      base = Math.min(perPersonTotal, perRoomTotal);
      explanation = `lower rule → min(${attendees} × ${formatMoney(
        perPerson
      )}, ${formatMoney(perRoom)})`;
    } else {
      base = Math.max(perPersonTotal, perRoomTotal);
      explanation = `higher rule → max(${attendees} × ${formatMoney(
        perPerson
      )}, ${formatMoney(perRoom)})`;
    }
  } else if (hasPerson) {
    base = perPersonTotal;
    explanation = `per-person → ${attendees} × ${formatMoney(perPerson)}`;
  } else if (hasRoom) {
    base = perRoomTotal;
    explanation = `per-room → ${formatMoney(perRoom)}`;
  } else {
    base = 0;
    explanation = "No base pricing configured on this room.";
  }

  return { basePrice: base, explanation };
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
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 14,
        padding: "8px 0",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ minWidth: 220 }}>
        <div style={{ fontWeight: 700 }}>{label}</div>
        {sub ? (
          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 3 }}>{sub}</div>
        ) : null}
      </div>
      <div style={{ fontWeight: 800, whiteSpace: "nowrap" }}>{value}</div>
    </div>
  );
}

// ---------- page ----------

export default function SimulationPage() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [rooms, setRooms] = useState([]);
  const [addOns, setAddOns] = useState([]);

  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [attendees, setAttendees] = useState(10);
  const [selectedOptionalAddOnIds, setSelectedOptionalAddOnIds] = useState(() => new Set());

  useEffect(() => {
    let alive = true;

    async function run() {
      setLoading(true);
      setLoadError("");

      try {
        const res = await fetch("/.netlify/functions/load_config", { method: "GET" });
        if (!res.ok) throw new Error(`load_config failed (${res.status})`);

        const payload = await res.json();
        const data = payload?.data ?? payload ?? {};

        const nextRooms = Array.isArray(data?.rooms) ? data.rooms : [];
        const nextAddOns = Array.isArray(data?.addOns) ? data.addOns : [];

        if (!alive) return;

        setRooms(nextRooms);
        setAddOns(nextAddOns);

        const firstRoom = nextRooms[0];
        const firstId = firstRoom ? String(getRoomId(firstRoom)) : "";
        setSelectedRoomId(firstId);
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
    const r = (rooms || []).find((x) => String(getRoomId(x)) === String(selectedRoomId));
    return r || null;
  }, [rooms, selectedRoomId]);

  // Clear optional selections when room changes
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

  const roomBase = useMemo(() => calcRoomBasePrice(selectedRoom, attendees), [selectedRoom, attendees]);

  const inclusiveValues = useMemo(() => {
    return includedAddOnsResolved.map(({ addOn }) => {
      const { value, supported, note } = calcAddOnValue(addOn, attendees);
      return { addOn, value, supported, note };
    });
  }, [includedAddOnsResolved, attendees]);

  const inclusiveTotal = useMemo(() => sum(inclusiveValues.map((x) => x.value)), [inclusiveValues]);

  // Bundle Price
  const bundlePrice = useMemo(() => roomBase.basePrice + inclusiveTotal, [roomBase.basePrice, inclusiveTotal]);

  // Offer Price (shown to booker initially)
  const offerPrice = useMemo(() => bundlePrice, [bundlePrice]);

  const selectedOptionalResolved = useMemo(() => {
    const ids = Array.from(selectedOptionalAddOnIds || []);
    const set = new Set(ids.map(String));
    return optionalAddOnsResolved.filter((x) => set.has(String(x.id)));
  }, [selectedOptionalAddOnIds, optionalAddOnsResolved]);

  const optionalValues = useMemo(() => {
    return selectedOptionalResolved.map(({ addOn }) => {
      const { value, supported, note } = calcAddOnValue(addOn, attendees);
      return { addOn, value, supported, note };
    });
  }, [selectedOptionalResolved, attendees]);

  const optionalTotal = useMemo(() => sum(optionalValues.map((x) => x.value)), [optionalValues]);

  // Provisional Price
  const provisionalPrice = useMemo(() => offerPrice + optionalTotal, [offerPrice, optionalTotal]);

  // Final Price (MVP = Provisional at confirmation)
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
                  const id = String(getRoomId(r));
                  return (
                    <option key={id} value={id}>
                      {getRoomDisplayName(r)}
                    </option>
                  );
                })}
              </select>
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
                const name = addOn?.name || "Unnamed add-on";
                const model = String(addOn?.pricing?.model || "").toUpperCase();
                const unitPrice = toNumberSafe(addOn?.pricing?.amount);
                const { value, supported, note } = calcAddOnValue(addOn, attendees);

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
                        {(model || "UNKNOWN_MODEL")} • Unit: {formatMoney(unitPrice)}
                        {supported
                          ? ` • This scenario adds: ${formatMoney(value)}`
                          : ` • ${note} (treated as ${formatMoney(0)})`}
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

      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card title="A) Hotel Breakdown (full visibility)">
          <Row label="Room Base Price" sub={roomBase.explanation} value={formatMoney(roomBase.basePrice)} />

          <div style={{ padding: "8px 0" }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Inclusive Add-Ons (bundled)</div>
            {includedAddOnsResolved.length === 0 ? (
              <div style={{ opacity: 0.75 }}>None</div>
            ) : (
              <div style={{ display: "grid", gap: 6 }}>
                {inclusiveValues.map(({ addOn, value, supported, note }) => {
                  const name = addOn?.name || "Unnamed add-on";
                  return (
                    <div key={String(getAddOnId(addOn) || name)} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ fontWeight: 700 }}>
                        {name}
                        {!supported ? <span style={{ marginLeft: 8, fontSize: 12, opacity: 0.7 }}>({note})</span> : null}
                      </div>
                      <div style={{ fontWeight: 800 }}>{formatMoney(value)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Row label="Bundle Price" sub="Room Base Price + Sum(Inclusive Add-Ons)" value={formatMoney(bundlePrice)} />
          <Row label="Offer Price" sub="Booker sees initially (equals Bundle Price)" value={formatMoney(offerPrice)} />

          <div style={{ padding: "8px 0" }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Selected Optional Add-Ons</div>
            {optionalValues.length === 0 ? (
              <div style={{ opacity: 0.75 }}>None selected</div>
            ) : (
              <div style={{ display: "grid", gap: 6 }}>
                {optionalValues.map(({ addOn, value, supported, note }) => {
                  const name = addOn?.name || "Unnamed add-on";
                  return (
                    <div key={String(getAddOnId(addOn) || name)} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ fontWeight: 700 }}>
                        {name}
                        {!supported ? <span style={{ marginLeft: 8, fontSize: 12, opacity: 0.7 }}>({note})</span> : null}
                      </div>
                      <div style={{ fontWeight: 800 }}>{formatMoney(value)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Row label="Provisional Price" sub="Offer Price + Sum(Selected Optional Add-Ons)" value={formatMoney(provisionalPrice)} />
          <Row label="Final Price" sub="MVP: equals Provisional Price" value={formatMoney(finalPrice)} />
        </Card>

        <Card title="B) Booker Preview (minimal)">
          <Row label="Offer Price" sub="Initial price shown to booker" value={formatMoney(offerPrice)} />
          <Row label="Selected Optional Add-Ons Total" sub="Does not show inclusive add-on values" value={formatMoney(optionalTotal)} />
          <Row label="Final Price" sub="MVP: equals Provisional at confirmation" value={formatMoney(finalPrice)} />
          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
            Inclusive add-on values are intentionally hidden in the Booker preview (bundled into Offer Price).
          </div>
        </Card>
      </div>

      <div style={{ marginTop: 14, fontSize: 12, opacity: 0.75 }}>
        Data source: <code>/.netlify/functions/load_config</code> only. No scenarios are saved.
      </div>
    </div>
  );
}
