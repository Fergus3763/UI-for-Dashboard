// admin-ui/src/pages/Dashboard/BookerPreview/index.jsx

import React, { useEffect, useMemo, useState } from "react";

/**
 * Booker Preview UX v2 — Admin-only, read-only demo funnel (NO WRITES)
 *
 * Hard constraints satisfied:
 * - Uses ONLY GET /.netlify/functions/load_config (payload.data parsing)
 * - No writes, no POST, no booking/reserve/payment, no availability logic
 * - No calendar wiring (date is placeholder only)
 * - Pricing spine matches Simulation:
 *   Room base per hour (perPerson/perRoom with higher/lower)
 *   Base total = per-hour base × durationHours
 *   Inclusive add-ons priced internally but NOT shown as prices to booker
 *   Optional add-ons shown as line items
 *   Offer = Bundle
 *   Provisional = Offer + selected optional
 *   Final = Provisional (MVP)
 *
 * Add-on pricing models supported:
 * - PER_EVENT
 * - PER_PERSON
 * - PER_PERIOD(HOUR)
 *
 * Unsupported:
 * - Show “Not yet supported” and treat as €0 (still selectable if optional)
 *
 * Layout-level RFQ threshold field (already implemented in RoomLayoutsEditor):
 * - layout.onlineBookingUpTo (semantics: RFQ above X)
 * - Blank / 0 / null => fully online
 * - RFQ applies only when attendees > X (equal is ONLINE)
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

function makeHourOptions() {
  const opts = [];
  for (let h = 0; h <= 23; h += 1) {
    const hh = String(h).padStart(2, "0");
    opts.push(`${hh}:00`);
  }
  return opts;
}

function getRoomDisplayName(room) {
  const name = room?.name || room?.roomName || room?.title || "Unnamed Room";
  const code = room?.code || room?.roomCode || room?.room_code || "";
  return code ? `${name} (${code})` : name;
}

function getRoomDescription(room) {
  const raw =
    room?.description ??
    room?.roomDescription ??
    room?.details ??
    room?.summary ??
    "";
  const s = String(raw || "").trim();
  if (!s) return "";
  // Keep consistent with UI: shown as muted, line-clamped, but also guard huge strings.
  if (s.length > 260) return `${s.slice(0, 260).trim()}…`;
  return s;
}

function getRoomFeatures(room) {
  const raw = room?.features ?? room?.roomFeatures ?? room?.amenities ?? [];
  if (!Array.isArray(raw)) return [];
  return raw.map((x) => String(x || "").trim()).filter(Boolean);
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

  if (model === "PER_EVENT") return { value: amount, supported: true, note: "" };
  if (model === "PER_PERSON")
    return {
      value: amount * toNumberSafe(attendees),
      supported: true,
      note: "",
    };

  if (model === "PER_PERIOD") {
    if (unit === "HOUR") {
      return {
        value: amount * toNumberSafe(durationHours),
        supported: true,
        note: "",
      };
    }
    return {
      value: 0,
      supported: false,
      note: "Not yet supported (PER_PERIOD non-hour)",
    };
  }

  if (model === "PER_UNIT")
    return { value: 0, supported: false, note: "Not yet supported (PER_UNIT)" };

  return { value: 0, supported: false, note: "Not yet supported" };
}

function calcRoomBasePricePerHour(room, attendees) {
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
    else base = Math.max(perPersonTotal, perRoomTotal); // default higher
  } else if (hasPerson) base = perPersonTotal;
  else if (hasRoom) base = perRoomTotal;

  return base; // treated as per-hour
}

function sum(values) {
  return (values || []).reduce((acc, n) => acc + toNumberSafe(n), 0);
}

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

/**
 * Field name remains onlineBookingUpTo but semantics are "RFQ above X".
 * Blank/null/0 => fully online.
 */
function getLayoutRFQAbove(layout) {
  const raw = layout?.onlineBookingUpTo;
  if (raw === null || raw === undefined || raw === "") return 0;
  const n = toNumberSafe(raw);
  return n > 0 ? n : 0;
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
  // If capacityMax missing/0 => not eligible by spec, but keep label safe
  if (min && max) return `${min}–${max}`;
  if (max) return `Up to ${max}`;
  if (min) return `${min}+`;
  return "";
}

function CameraIcon({ size = 28 }) {
  const s = toNumberSafe(size) || 28;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 4.5h6l1.1 2H20a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.5a2 2 0 0 1 2-2h3.9L9 4.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function Badge({ children, tone = "neutral" }) {
  const tones = {
    neutral: {
      border: "1px solid rgba(0,0,0,0.10)",
      background: "rgba(0,0,0,0.03)",
      color: "rgba(17, 24, 39, 0.82)",
    },
    online: {
      border: "1px solid rgba(16, 185, 129, 0.35)",
      background: "rgba(16, 185, 129, 0.12)",
      color: "rgba(6, 95, 70, 0.95)",
    },
    rfq: {
      border: "1px solid rgba(59, 130, 246, 0.28)",
      background: "rgba(59, 130, 246, 0.10)",
      color: "rgba(30, 64, 175, 0.95)",
    },
    model: {
      border: "1px solid rgba(59, 130, 246, 0.22)",
      background: "rgba(59, 130, 246, 0.06)",
      color: "rgba(30, 64, 175, 0.95)",
    },
    warning: {
      border: "1px solid rgba(245, 158, 11, 0.30)",
      background: "rgba(245, 158, 11, 0.15)",
      color: "rgba(146, 64, 14, 0.95)",
    },
  };

  const t = tones[tone] || tones.neutral;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 800,
        lineHeight: "16px",
        ...t,
      }}
    >
      {children}
    </span>
  );
}

function Panel({ children }) {
  return (
    <div
      style={{
        border: "1px solid rgba(0,0,0,0.10)",
        borderRadius: 12,
        padding: 14,
        background: "#fff",
      }}
    >
      {children}
    </div>
  );
}

function PrimaryButton({ children, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={!!disabled}
      onClick={onClick}
      style={{
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(59, 130, 246, 0.35)",
        background: "rgba(59, 130, 246, 0.14)",
        color: "rgba(30, 64, 175, 0.95)",
        fontWeight: 900,
        cursor: disabled ? "not-allowed" : "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick, disabled }) {
  return (
    <button
      type="button"
      disabled={!!disabled}
      onClick={onClick}
      style={{
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,0.14)",
        background: "#fff",
        color: "rgba(17, 24, 39, 0.82)",
        fontWeight: 850,
        cursor: disabled ? "not-allowed" : "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
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

  // Demo-context banner dismissal (localStorage allowed)
  const DEMO_BANNER_KEY = "booker_preview_demo_context_dismissed_v1";
  const [demoBannerDismissed, setDemoBannerDismissed] = useState(() => {
    try {
      return localStorage.getItem(DEMO_BANNER_KEY) === "1";
    } catch {
      return false;
    }
  });

  // Funnel state machine
  const [step, setStep] = useState("results"); // "results" | "addons" | "summary"
  const [selectedResult, setSelectedResult] = useState(null); // { roomId, layoutIndex, mode, rfqAbove, ... }

  // Inputs (Step 1)
  const [attendees, setAttendees] = useState(10);
  const [datePlaceholder, setDatePlaceholder] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [durationHours, setDurationHours] = useState(2);

  const [selectedOptionalAddOnIds, setSelectedOptionalAddOnIds] = useState(
    () => new Set()
  );

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

  // Results list (eligible Room + Layout combos)
  const eligibleResults = useMemo(() => {
    const a = toNumberSafe(attendees);
    const dur = Math.min(12, Math.max(1, toNumberSafe(durationHours)));

    const results = [];

    (rooms || []).forEach((room) => {
      const roomId = String(room?.id ?? room?._id ?? room?.roomId ?? "");
      if (!roomId) return;

      const layouts = Array.isArray(room?.layouts) ? room.layouts : [];
      layouts.forEach((layout, layoutIndex) => {
        const min = getLayoutMinCapacity(layout) || 0;
        const max = getLayoutMaxCapacity(layout) || 0;

        // Eligibility per spec:
        // if capacityMax missing, treat as 0 => not eligible
        if (!(a >= min && a <= max)) return;

        const rfqAbove = getLayoutRFQAbove(layout); // 0 => fully online
        const isRFQ = rfqAbove > 0 && a > rfqAbove; // equal is ONLINE
        const mode = isRFQ ? "RFQ" : "ONLINE";

        const perHour = calcRoomBasePricePerHour(room, a);
        const baseTotal = perHour * dur;

        // Included add-ons: names only (prices hidden)
        const includedIds = Array.isArray(room?.includedAddOns)
          ? room.includedAddOns.map((x) => String(x))
          : [];
        const includedNames = includedIds
          .map((id) => {
            const ao = addOnById.get(String(id));
            return ao?.name || ao?.title || String(id);
          })
          .filter(Boolean);

        results.push({
          key: `${roomId}_${layoutIndex}`,
          roomId,
          room,
          layoutIndex,
          layout,
          mode,
          rfqAbove,
          capacityText: formatCapacityRange(layout),
          roomLabel: getRoomDisplayName(room),
          layoutLabel: getLayoutLabel(layout),
          perHour,
          baseTotal,
          includedIds,
          includedNames,
        });
      });
    });

    // Sort: ONLINE first, then cheapest base total, then name
    results.sort((a, b) => {
      if (a.mode !== b.mode) return a.mode === "ONLINE" ? -1 : 1;
      const p = a.baseTotal - b.baseTotal;
      if (p !== 0) return p;
      return String(a.roomLabel).localeCompare(String(b.roomLabel));
    });

    return results;
  }, [rooms, addOnById, attendees, durationHours]);

  // When inputs change, keep selection safe
  useEffect(() => {
    if (!selectedResult) return;

    const a = toNumberSafe(attendees);
    const layout = selectedResult.layout;
    const min = getLayoutMinCapacity(layout) || 0;
    const max = getLayoutMaxCapacity(layout) || 0;

    if (!(a >= min && a <= max)) {
      setSelectedResult(null);
      setSelectedOptionalAddOnIds(new Set());
      setStep("results");
    }
  }, [attendees, selectedResult]);

  // Optional add-ons source depends on selectedResult mode
  const optionalAddOnsForSelection = useMemo(() => {
    if (!selectedResult) return [];

    const room = selectedResult.room;
    const includedSet = new Set((selectedResult.includedIds || []).map(String));

    if (selectedResult.mode === "ONLINE") {
      const ids = Array.isArray(room?.optionalAddOns)
        ? room.optionalAddOns.map((x) => String(x))
        : [];
      return ids
        .filter((id) => !includedSet.has(String(id)))
        .map((id) => ({
          id: String(id),
          addOn: addOnById.get(String(id)) || null,
        }))
        .filter((x) => x.addOn);
    }

    const activeGlobal = Array.isArray(addOns) ? addOns : [];
    const pairs = activeGlobal
      .filter((a) => a && a.active !== false && a.public !== false)
      .map((a) => {
        const id = a?.id ?? a?._id ?? a?.addOnId ?? a?.addonId;
        return { id: id != null ? String(id) : "", addOn: a };
      })
      .filter((x) => x.id && x.addOn && !includedSet.has(String(x.id)));

    const deduped = new Map();
    for (const p of pairs) {
      if (!deduped.has(p.id)) deduped.set(p.id, p);
    }

    const categoryOf = (a) => String(a?.category ?? "").toLowerCase();
    const nameOf = (a) =>
      String(a?.name ?? a?.title ?? a?.code ?? "").toLowerCase();

    return Array.from(deduped.values()).sort((x, y) => {
      const c1 = categoryOf(x.addOn);
      const c2 = categoryOf(y.addOn);
      const cCmp = c1.localeCompare(c2);
      if (cCmp !== 0) return cCmp;
      return nameOf(x.addOn).localeCompare(nameOf(y.addOn));
    });
  }, [selectedResult, addOns, addOnById]);

  // Pricing for selection (must match Simulation rules)
  const pricingForSelection = useMemo(() => {
    if (!selectedResult) {
      return {
        perHour: 0,
        baseTotal: 0,
        inclusiveTotal: 0,
        bundlePrice: 0,
        offerPrice: 0,
        optionalLineItems: [],
        optionalTotal: 0,
        provisionalPrice: 0,
        finalPrice: 0,
      };
    }

    const room = selectedResult.room;
    const a = toNumberSafe(attendees);
    const dur = Math.min(12, Math.max(1, toNumberSafe(durationHours)));

    const perHour = calcRoomBasePricePerHour(room, a);
    const baseTotal = perHour * dur;

    const includedIds = (selectedResult.includedIds || []).map(String);
    const inclusiveValues = includedIds
      .map((id) => addOnById.get(String(id)) || null)
      .filter(Boolean)
      .map((addOn) => calcAddOnValue(addOn, a, dur).value);

    const inclusiveTotal = sum(inclusiveValues);

    const bundlePrice = baseTotal + inclusiveTotal;
    const offerPrice = bundlePrice;

    const selectedOptionIds = Array.from(selectedOptionalAddOnIds || []).map(
      String
    );
    const optionSet = new Set(selectedOptionIds);

    const optionalLineItems = (optionalAddOnsForSelection || [])
      .filter((x) => optionSet.has(String(x.id)))
      .map(({ id, addOn }) => {
        const name = addOn?.name || addOn?.title || "Unnamed add-on";
        const { model, amount, unit } = getAddOnPricing(addOn);
        const { value, supported, note } = calcAddOnValue(addOn, a, dur);

        const modelLabel =
          model === "PER_PERIOD"
            ? `${model}${unit ? `(${unit})` : ""}`
            : model || "UNKNOWN_MODEL";

        return {
          id: String(id),
          name,
          modelLabel,
          unitAmount: amount,
          value,
          supported,
          note,
        };
      });

    const optionalTotal = sum(optionalLineItems.map((x) => x.value));
    const provisionalPrice = offerPrice + optionalTotal;
    const finalPrice = provisionalPrice;

    return {
      perHour,
      baseTotal,
      inclusiveTotal,
      bundlePrice,
      offerPrice,
      optionalLineItems,
      optionalTotal,
      provisionalPrice,
      finalPrice,
    };
  }, [
    selectedResult,
    attendees,
    durationHours,
    addOnById,
    optionalAddOnsForSelection,
    selectedOptionalAddOnIds,
  ]);

  function toggleOptionalAddOn(id) {
    const key = String(id);
    setSelectedOptionalAddOnIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function resetSelectionToResults() {
    setSelectedResult(null);
    setSelectedOptionalAddOnIds(new Set());
    setStep("results");
  }

  function goToAddOns(result) {
    setSelectedResult(result);
    setSelectedOptionalAddOnIds(new Set());
    setStep("addons");
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      /* ignore */
    }
  }

  function goToSummary() {
    setStep("summary");
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      /* ignore */
    }
  }

  function dismissDemoContextBanner() {
    try {
      localStorage.setItem(DEMO_BANNER_KEY, "1");
    } catch (e) {
      // ignore
    }
    setDemoBannerDismissed(true);
  }

  // ---------- Render ----------

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

  // NEW: demo-context banner (dismissible, postscript style, exact copy)
  const demoContextBanner = demoBannerDismissed ? null : (
    <div
      style={{
        marginBottom: 12,
        borderRadius: 12,
        border: "1px dashed rgba(59, 130, 246, 0.22)",
        background: "rgba(59, 130, 246, 0.04)",
        borderLeft: "6px solid rgba(59, 130, 246, 0.55)",
        padding: "10px 12px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 15,
              lineHeight: "20px",
              fontWeight: 900,
              fontStyle: "italic",
              color: "rgba(30, 64, 175, 0.95)",
            }}
          >
            Booker Preview
          </div>

          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              lineHeight: "16px",
              color: "rgba(17, 24, 39, 0.62)",
              fontStyle: "italic",
            }}
          >
            This is how your meeting rooms appear to customers booking online.
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 12,
              lineHeight: "16px",
              color: "rgba(17, 24, 39, 0.72)",
            }}
          >
            Use this preview to simulate a real booking journey — attendee numbers, layout eligibility, online vs RFQ behaviour, optional add-ons, and final pricing.
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 12,
              lineHeight: "16px",
              color: "rgba(17, 24, 39, 0.72)",
            }}
          >
            This is a demo preview only. Availability, payment, and final confirmation are not active.
          </div>
        </div>

        <button
          type="button"
          onClick={dismissDemoContextBanner}
          style={{
            border: "1px solid rgba(59, 130, 246, 0.32)",
            background: "rgba(59, 130, 246, 0.08)",
            color: "rgba(30, 64, 175, 0.95)",
            borderRadius: 12,
            padding: "8px 10px",
            fontWeight: 850,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );

  const banner = (
    <div
      style={{
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,0.12)",
        background: "rgba(0,0,0,0.03)",
        fontWeight: 900,
        marginBottom: 14,
      }}
    >
      Preview only — availability, reservation and payment are not active in this demo.
    </div>
  );

  const inputs = (
    <Panel>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 18, fontWeight: 950, margin: 0 }}>
            Booker Preview
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              color: "rgba(17, 24, 39, 0.68)",
            }}
          >
            Demo funnel: inputs → results → add-ons → summary (no booking / no
            RFQ submission)
          </div>
        </div>

        <Badge tone="neutral">Step: {step}</Badge>
      </div>

      <div
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: 10,
        }}
      >
        <div>
          <label
            style={{ fontWeight: 900, display: "block", marginBottom: 6 }}
          >
            Attendees
          </label>
          <input
            type="number"
            min={0}
            value={attendees}
            onChange={(e) =>
              setAttendees(Math.max(0, toNumberSafe(e.target.value)))
            }
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid rgba(0,0,0,0.15)",
            }}
          />
        </div>

        <div>
          <label
            style={{ fontWeight: 900, display: "block", marginBottom: 6 }}
          >
            Date (placeholder)
          </label>
          <input
            type="text"
            value={datePlaceholder}
            onChange={(e) => setDatePlaceholder(e.target.value)}
            placeholder="e.g. 2026-01-15"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid rgba(0,0,0,0.15)",
            }}
          />
        </div>

        <div>
          <label
            style={{ fontWeight: 900, display: "block", marginBottom: 6 }}
          >
            Start time
          </label>
          <select
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid rgba(0,0,0,0.15)",
            }}
          >
            {hourOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            style={{ fontWeight: 900, display: "block", marginBottom: 6 }}
          >
            Duration (hours)
          </label>
          <select
            value={durationHours}
            onChange={(e) =>
              setDurationHours(
                Math.min(12, Math.max(1, toNumberSafe(e.target.value)))
              )
            }
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid rgba(0,0,0,0.15)",
            }}
          >
            {durationOptions.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginTop: 10, fontSize: 12, color: "rgba(17, 24, 39, 0.62)" }}>
        Hour blocks only • Duration capped at 12 hours (MVP)
      </div>
    </Panel>
  );

  const resultsStep = (
    <div style={{ marginTop: 14 }}>
      <Panel>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ fontWeight: 950, fontSize: 16 }}>
            Eligible rooms & layouts
          </div>
          <div style={{ fontSize: 12, color: "rgba(17, 24, 39, 0.62)" }}>
            {eligibleResults.length} result(s)
          </div>
        </div>

        {eligibleResults.length === 0 ? (
          <div style={{ marginTop: 12, color: "rgba(17, 24, 39, 0.72)" }}>
            No eligible room + layout combinations for {toNumberSafe(attendees)} attendee(s).
          </div>
        ) : (
          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            {eligibleResults.map((r, idx) => {
              const altBg = idx % 2 === 0 ? "#fff" : "rgba(59, 130, 246, 0.03)";
              const modeBadge =
                r.mode === "ONLINE" ? (
                  <Badge tone="online">Online</Badge>
                ) : (
                  <Badge tone="rfq">RFQ above {r.rfqAbove}</Badge>
                );

              const desc = getRoomDescription(r.room);
              const features = getRoomFeatures(r.room);
              const maxFeatures = 6;
              const shownFeatures = features.slice(0, maxFeatures);
              const remainingFeatures = Math.max(
                0,
                features.length - shownFeatures.length
              );

              return (
                <div
                  key={r.key}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "150px 1fr 220px",
                    gap: 12,
                    padding: 12,
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.10)",
                    background: altBg,
                    boxShadow: "0 1px 6px rgba(15, 23, 42, 0.06)",
                    alignItems: "stretch",
                  }}
                >
                  {/* Left: image placeholder */}
                  <div
                    style={{
                      borderRadius: 12,
                      background: "rgba(0,0,0,0.04)",
                      border: "1px dashed rgba(0,0,0,0.16)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 10,
                      color: "rgba(17, 24, 39, 0.62)",
                      minHeight: 98,
                      textAlign: "center",
                    }}
                  >
                    <div>
                      <div
                        style={{ display: "flex", justifyContent: "center" }}
                      >
                        <CameraIcon size={28} />
                      </div>
                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 12,
                          fontWeight: 800,
                        }}
                      >
                        Room image (coming soon)
                      </div>
                    </div>
                  </div>

                  {/* Middle: info */}
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 950,
                            fontSize: 14,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {r.roomLabel}
                        </div>

                        <div
                          style={{
                            marginTop: 4,
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 8,
                            alignItems: "center",
                          }}
                        >
                          <Badge tone="neutral">{r.layoutLabel}</Badge>
                          {r.capacityText ? (
                            <Badge tone="neutral">Capacity {r.capacityText}</Badge>
                          ) : null}
                          {modeBadge}
                        </div>

                        {desc ? (
                          <div
                            style={{
                              marginTop: 8,
                              fontSize: 12,
                              lineHeight: "16px",
                              color: "rgba(17, 24, 39, 0.62)",
                              display: "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {desc}
                          </div>
                        ) : null}

                        {shownFeatures.length ? (
                          <div
                            style={{
                              marginTop: 8,
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 6,
                              alignItems: "center",
                            }}
                          >
                            {shownFeatures.map((f, i) => (
                              <Badge key={`${r.key}_feat_${i}`} tone="neutral">
                                {f}
                              </Badge>
                            ))}
                            {remainingFeatures > 0 ? (
                              <Badge tone="neutral">+{remainingFeatures}</Badge>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 900,
                          color: "rgba(17, 24, 39, 0.82)",
                        }}
                      >
                        Included in your price:
                      </div>
                      {r.includedNames.length ? (
                        <div
                          style={{
                            marginTop: 6,
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 6,
                          }}
                        >
                          {r.includedNames.slice(0, 6).map((nm, i) => (
                            <Badge key={`${r.key}_inc_${i}`} tone="neutral">
                              {nm}
                            </Badge>
                          ))}
                          {r.includedNames.length > 6 ? (
                            <Badge tone="neutral">
                              +{r.includedNames.length - 6} more
                            </Badge>
                          ) : null}
                        </div>
                      ) : (
                        <div
                          style={{
                            marginTop: 6,
                            fontSize: 12,
                            color: "rgba(17, 24, 39, 0.62)",
                          }}
                        >
                          None
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: price + select */}
                  <div style={{ display: "grid", gap: 10, justifyItems: "end" }}>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{ fontSize: 12, color: "rgba(17, 24, 39, 0.62)" }}
                      >
                        Base price
                      </div>
                      <div style={{ marginTop: 4, fontWeight: 950, fontSize: 16 }}>
                        {formatMoney(r.baseTotal)}
                      </div>
                      <div style={{ marginTop: 2, fontSize: 12, color: "rgba(17, 24, 39, 0.62)" }}>
                        {formatMoney(r.perHour)} / hour ×{" "}
                        {Math.min(12, Math.max(1, toNumberSafe(durationHours)))}h
                      </div>
                    </div>

                    <PrimaryButton onClick={() => goToAddOns(r)}>
                      {r.mode === "ONLINE" ? "Select" : "Select (RFQ)"}
                    </PrimaryButton>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );

  const addonsStep = !selectedResult ? null : (
    <div style={{ marginTop: 14 }}>
      <Panel>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontWeight: 950, fontSize: 16 }}>Optional add-ons</div>
            <div style={{ marginTop: 6, fontSize: 12, color: "rgba(17, 24, 39, 0.62)" }}>
              Selected: <strong>{selectedResult.roomLabel}</strong> •{" "}
              <strong>{selectedResult.layoutLabel}</strong>{" "}
              {selectedResult.mode === "RFQ" ? (
                <>
                  • <Badge tone="rfq">RFQ above {selectedResult.rfqAbove}</Badge>
                </>
              ) : (
                <>
                  • <Badge tone="online">Online</Badge>
                </>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <SecondaryButton onClick={resetSelectionToResults}>
              Back to results
            </SecondaryButton>
            <PrimaryButton onClick={goToSummary}>Continue to summary</PrimaryButton>
          </div>
        </div>

        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <div style={{ fontWeight: 950, marginBottom: 8 }}>Optional add-ons</div>

            {optionalAddOnsForSelection.length === 0 ? (
              <div style={{ fontSize: 13, color: "rgba(17, 24, 39, 0.72)" }}>
                {selectedResult.mode === "RFQ"
                  ? "No active public add-ons available in the catalogue."
                  : "No optional add-ons configured for this room."}
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {optionalAddOnsForSelection.map(({ id, addOn }) => {
                  const name = addOn?.name || addOn?.title || "Unnamed add-on";
                  const { model, amount, unit } = getAddOnPricing(addOn);
                  const { value, supported, note } = calcAddOnValue(addOn, attendees, durationHours);

                  const modelLabel =
                    model === "PER_PERIOD" ? `${model}${unit ? `(${unit})` : ""}` : model || "UNKNOWN_MODEL";

                  return (
                    <label
                      key={String(id)}
                      style={{
                        display: "flex",
                        gap: 10,
                        padding: 12,
                        borderRadius: 12,
                        border: "1px solid rgba(0,0,0,0.10)",
                        background: "rgba(0,0,0,0.02)",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedOptionalAddOnIds.has(String(id))}
                        onChange={() => toggleOptionalAddOn(id)}
                        style={{ marginTop: 3 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                          <div style={{ fontWeight: 950, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {name}
                          </div>
                          <Badge tone="model">{modelLabel}</Badge>
                        </div>

                        <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                          <div style={{ fontSize: 12, color: "rgba(17, 24, 39, 0.62)" }}>
                            Unit: <strong>{formatMoney(amount)}</strong>
                          </div>

                          {supported ? (
                            <div style={{ fontSize: 12, color: "rgba(17, 24, 39, 0.62)" }}>
                              Adds: <strong>{formatMoney(value)}</strong>
                            </div>
                          ) : (
                            <div style={{ fontSize: 12, color: "rgba(17, 24, 39, 0.62)" }}>
                              <Badge tone="warning">Not yet supported</Badge>{" "}
                              <span style={{ marginLeft: 6 }}>{note} (treated as {formatMoney(0)})</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <div style={{ fontWeight: 950, marginBottom: 8 }}>Price preview</div>
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ fontWeight: 900 }}>Offer Price</div>
                <div style={{ fontWeight: 950 }}>{formatMoney(pricingForSelection.offerPrice)}</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ fontWeight: 900 }}>Selected optional total</div>
                <div style={{ fontWeight: 950 }}>{formatMoney(pricingForSelection.optionalTotal)}</div>
              </div>
              <div style={{ height: 1, background: "rgba(0,0,0,0.10)" }} />
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ fontWeight: 950 }}>Final Price (MVP)</div>
                <div style={{ fontWeight: 950 }}>{formatMoney(pricingForSelection.finalPrice)}</div>
              </div>

              <div style={{ fontSize: 12, color: "rgba(17, 24, 39, 0.62)" }}>
                Inclusive add-ons are bundled into Offer Price (values not shown here by design).
              </div>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );

  const summaryStep = !selectedResult ? null : (
    <div style={{ marginTop: 14 }}>
      <Panel>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 950, fontSize: 16 }}>Summary</div>
            <div style={{ marginTop: 6, fontSize: 12, color: "rgba(17, 24, 39, 0.62)" }}>
              Selected: <strong>{selectedResult.roomLabel}</strong> • <strong>{selectedResult.layoutLabel}</strong>{" "}
              {selectedResult.mode === "RFQ" ? (
                <>
                  • <Badge tone="rfq">RFQ above {selectedResult.rfqAbove}</Badge>
                </>
              ) : (
                <>
                  • <Badge tone="online">Online</Badge>
                </>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <SecondaryButton onClick={() => setStep("addons")}>Back to add-ons</SecondaryButton>
            <SecondaryButton onClick={resetSelectionToResults}>Back to results</SecondaryButton>
          </div>
        </div>

        {selectedResult.mode === "RFQ" ? (
          <div style={{ marginTop: 12, fontSize: 12, color: "rgba(17, 24, 39, 0.72)" }}>
            <Badge tone="rfq">RFQ notice</Badge>{" "}
            <span style={{ marginLeft: 8 }}>
              This selection requires manual confirmation by the venue (RFQ). Prices shown here are still computed by the same rules.
            </span>
          </div>
        ) : null}

        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <div style={{ fontWeight: 950, marginBottom: 8 }}>Included in your price</div>
            {selectedResult.includedNames.length ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {selectedResult.includedNames.map((nm, i) => (
                  <Badge key={`sum_inc_${i}`} tone="neutral">
                    {nm}
                  </Badge>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: "rgba(17, 24, 39, 0.62)" }}>None</div>
            )}

            <div style={{ marginTop: 14, fontWeight: 950, marginBottom: 8 }}>Selected optional add-ons</div>
            {pricingForSelection.optionalLineItems.length ? (
              <div style={{ display: "grid", gap: 8 }}>
                {pricingForSelection.optionalLineItems.map((x) => (
                  <div key={x.id} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ fontWeight: 850 }}>
                      {x.name}{" "}
                      <span style={{ fontSize: 12, color: "rgba(17, 24, 39, 0.62)" }}>
                        ({x.modelLabel})
                      </span>
                    </div>
                    <div style={{ fontWeight: 950 }}>{formatMoney(x.value)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: "rgba(17, 24, 39, 0.62)" }}>None selected</div>
            )}
          </div>

          <div>
            <div style={{ fontWeight: 950, marginBottom: 8 }}>Price summary</div>

            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ fontWeight: 900 }}>Offer Price</div>
                <div style={{ fontWeight: 950 }}>{formatMoney(pricingForSelection.offerPrice)}</div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ fontWeight: 900 }}>Optional add-ons total</div>
                <div style={{ fontWeight: 950 }}>{formatMoney(pricingForSelection.optionalTotal)}</div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ fontWeight: 900 }}>Provisional Price</div>
                <div style={{ fontWeight: 950 }}>{formatMoney(pricingForSelection.provisionalPrice)}</div>
              </div>

              <div style={{ height: 1, background: "rgba(0,0,0,0.10)", margin: "8px 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ fontWeight: 950 }}>Final Price (MVP)</div>
                <div style={{ fontWeight: 950 }}>{formatMoney(pricingForSelection.finalPrice)}</div>
              </div>

              <div style={{ marginTop: 10 }}>
                <button
                  type="button"
                  disabled
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.18)",
                    background: "rgba(0,0,0,0.04)",
                    fontWeight: 950,
                    cursor: "not-allowed",
                  }}
                  title="Demo only. No booking / RFQ submission is active."
                >
                  {selectedResult.mode === "RFQ"
                    ? "Request quote (demo)"
                    : "Proceed to booking (demo)"}
                </button>
                <div style={{ marginTop: 8, fontSize: 12, color: "rgba(17, 24, 39, 0.62)" }}>
                  Demo-only: no submission occurs.
                </div>
              </div>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );

  return (
    <div style={{ padding: 18, maxWidth: 1120 }}>
      {demoContextBanner}
      {banner}
      {inputs}

      {step === "results" ? resultsStep : null}
      {step === "addons" ? addonsStep : null}
      {step === "summary" ? summaryStep : null}
    </div>
  );
}
