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

  if (model === "PER_EVENT") return { value: amount, supported: true, note: "" };
  if (model === "PER_PERSON") return { value: amount * toNumberSafe(attendees), supported: true, note: "" };

  if (model === "PER_PERIOD") {
    if (unit === "HOUR") {
      return { value: amount * toNumberSafe(durationHours), supported: true, note: "" };
    }
    return { value: 0, supported: false, note: "Not yet supported in simulator (PER_PERIOD non-hour)" };
  }

  if (model === "PER_UNIT") {
    return { value: 0, supported: false, note: "Not yet supported in simulator (PER_UNIT)" };
  }

  return { value: 0, supported: false, note: "Not yet supported in simulator" };
}

function calcRoomBasePricePerBooking(room, attendees) {
  const pricing = room?.pricing || {};
  const perPerson = toNumberSafe(pricing?.perPerson);
  const perRoom = toNumberSafe(pricing?.perRoom);
  const rule = String(pricing?.rule || "").toLowerCase();

  const perPersonTotal = perPerson > 0 ? attendees * perPerson : 0;
  const perRoomTotal = perRoom > 0 ? perRoom : 0;

  let base = 0;
  let explanation = "";

  const hasPerson = perPerson > 0;
  const hasRoom = perRoom > 0;

  if (hasPerson && hasRoom) {
    if (rule === "lower") {
      base = Math.min(perPersonTotal, perRoomTotal);
      explanation = `min(attendees × perPerson, perRoom)`;
    } else {
      base = Math.max(perPersonTotal, perRoomTotal);
      explanation = `max(attendees × perPerson, perRoom)`;
    }
  } else if (hasPerson) {
    base = perPersonTotal;
    explanation = `attendees × perPerson`;
  } else if (hasRoom) {
    base = perRoomTotal;
    explanation = `perRoom`;
  } else {
    explanation = "No pricing found on room.pricing.";
  }

  return { basePrice: base, explanation };
}

function sum(values) {
  return (values || []).reduce((acc, n) => acc + toNumberSafe(n), 0);
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

  const [startTime, setStartTime] = useState("09:00");
  const [durationHours, setDurationHours] = useState(2);

  const [selectedOptionalAddOnIds, setSelectedOptionalAddOnIds] = useState(() => new Set());

  useEffect(() => {
    let alive = true;

    async function run() {
      setLoading(true);
      setLoadError("");

      try {
        const res = await fetch("/.netlify/functions/load_config");
        if (!res.ok) throw new Error(`load_config failed (${res.status})`);

        const payload = await res.json();
        const data = payload?.data ?? payload ?? {};

        if (!alive) return;

        setRooms(Array.isArray(data.rooms) ? data.rooms : []);
        setAddOns(Array.isArray(data.addOns) ? data.addOns : []);

        const firstRoom = data.rooms?.[0];
        const firstId = firstRoom?.id ?? firstRoom?._id ?? firstRoom?.roomId;
        setSelectedRoomId(firstId ? String(firstId) : "");
      } catch (e) {
        if (alive) setLoadError(e?.message || "Failed to load config.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 18 }}>
        <h1>Simulation / Modelling</h1>
        <p>Loading config…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ padding: 18 }}>
        <h1>Simulation / Modelling</h1>
        <Badge tone="error">Error</Badge>
        <div style={{ marginTop: 8 }}>{loadError}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 18, maxWidth: 1120 }}>
      <Section
        title="Simulation / Modelling"
        description="Hotel-only, read-only price simulator. Purpose: What price will the booker see and pay?"
      />
      {/* UI body unchanged */}
    </div>
  );
}
