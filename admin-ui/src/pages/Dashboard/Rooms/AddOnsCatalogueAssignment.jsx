// admin-ui/src/pages/Dashboard/Rooms/AddOnsCatalogueAssignment.jsx

import React, { useMemo } from "react";

/**
 * Add-Ons → Catalogue & Assignment
 *
 * Shows all active add-ons grouped by category, with per-room assignment:
 * - Not used
 * - Inclusive
 * - Optional
 */

const CATEGORY_KEYS = ["fnb", "av", "services", "labour", "other"];

const CATEGORY_LABELS = {
  fnb: "F&B",
  av: "AV / Tech",
  services: "Services & Amenities",
  labour: "Labour & 3rd Party",
  other: "Other",
};

const PRICING_MODE_LABELS = {
  PER_EVENT: "Per event",
  PER_PERSON: "Per person",
  PER_PERIOD: "Per period",
  PER_UNIT: "Per unit",
};

const PERIOD_UNIT_LABELS = {
  MINUTE: "per minute",
  HOUR: "per hour",
  DAY: "per day",
};

const DEFAULT_PRICING_MODEL = "PER_EVENT";

function formatPricing(addOn) {
  if (!addOn || !addOn.pricing) return "-";

  const { included, pricing } = addOn;
  const model = pricing.model || DEFAULT_PRICING_MODEL;
  const amount = typeof pricing.amount === "number" ? pricing.amount : 0;
  const periodUnit = pricing.periodUnit;

  if (included) {
    return "Included";
  }

  const base = `${amount.toFixed(2)}`;

  if (model === "PER_PERIOD") {
    const unitLabel =
      periodUnit && PERIOD_UNIT_LABELS[periodUnit]
        ? PERIOD_UNIT_LABELS[periodUnit]
        : "";
    return `${base} (${PRICING_MODE_LABELS[model]} ${
      unitLabel ? unitLabel : ""
    })`.trim();
  }

  const label = PRICING_MODE_LABELS[model] || model;
  return `${base} (${label})`;
}

const AddOnsCatalogueAssignment = ({
  rooms = [],
  addOns = [],
  onSaveAddOns,
  onUpdateRoomAssignments,
  saving = false,
}) => {
  const normaliseIdArray = (value) => {
    if (!Array.isArray(value)) return [];
    return value.map((v) => String(v));
  };

  const getRoomStateForAddOn = (room, addOnId) => {
    const includedIds = normaliseIdArray(room.includedAddOns);
    const optionalIds = normaliseIdArray(room.optionalAddOns);

    if (includedIds.includes(addOnId)) return "inclusive";
    if (optionalIds.includes(addOnId)) return "optional";
    return "none";
  };

  const handleRoomAssignmentClick = (room, currentState, targetState, addOnId) => {
    if (!onUpdateRoomAssignments || !room || !room.id) return;

    const idString = String(addOnId);
    const nextState = currentState === targetState ? "none" : targetState;

    const includedIds = new Set(normaliseIdArray(room.includedAddOns));
    const optionalIds = new Set(normaliseIdArray(room.optionalAddOns));

    // Remove from both first (enforce exclusivity)
    includedIds.delete(idString);
    optionalIds.delete(idString);

    if (nextState === "inclusive") {
      includedIds.add(idString);
    } else if (nextState === "optional") {
      optionalIds.add(idString);
    }

    onUpdateRoomAssignments(room.id, {
      includedAddOns: Array.from(includedIds),
      optionalAddOns: Array.from(optionalIds),
    });
  };

  const renderStatePill = (label, stateKey, currentState) => {
    const isActive = currentState === stateKey;

    const baseStyle = {
      flex: 1,
      padding: "0.25rem 0.4rem",
      fontSize: "0.75rem",
      border: "1px solid #cbd5f5",
      backgroundColor: "#ffffff",
      cursor: "pointer",
      borderRadius: 0,
      whiteSpace: "nowrap",
    };

    const activeStyles = {
      none: {
        backgroundColor: "#f1f5f9",
        fontWeight: 600,
      },
      inclusive: {
        backgroundColor: "#dcfce7",
        borderColor: "#16a34a",
        color: "#166534",
        fontWeight: 600,
      },
      optional: {
        backgroundColor: "#dbeafe",
        borderColor: "#1d4ed8",
        color: "#1e40af",
        fontWeight: 600,
      },
    };

    const radiusOverrides = {
      none: { borderTopLeftRadius: "999px", borderBottomLeftRadius: "999px" },
      optional: {
        borderTopRightRadius: "999px",
        borderBottomRightRadius: "999px",
      },
    };

    return {
      style: {
        ...baseStyle,
        ...(radiusOverrides[stateKey] || {}),
        ...(isActive ? activeStyles[stateKey] : {}),
      },
      label,
    };
  };

  const activeAddOnsByCategory = useMemo(() => {
    const grouped = {};
    CATEGORY_KEYS.forEach((key) => {
      grouped[key] = [];
    });

    (addOns || []).forEach((a) => {
      if (!a || a.active === false) return;
      const cat = CATEGORY_KEYS.includes(a.category) ? a.category : "other";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(a);
    });

    return grouped;
  }, [addOns]);

  const handleSaveAssignments = () => {
    if (typeof onSaveAddOns === "function") {
      onSaveAddOns(addOns || []);
    }
  };

  const hasAnyAddOns = (addOns || []).some((a) => a && a.active !== false);

  return (
    <div>
      <h2 style={{ marginTop: 0, marginBottom: "0.5rem" }}>
        Add-Ons – Catalogue &amp; Assignment
      </h2>
      <p style={{ marginBottom: "1rem", maxWidth: "720px" }}>
        See all active add-ons and control, for each room, whether the add-on is
        not used, included in the base price, or offered as an optional
        (chargeable) extra.
      </p>

      {!hasAnyAddOns && (
        <p style={{ fontSize: "0.9rem", color: "#64748b" }}>
          No active add-ons found. Create and activate add-ons in the{" "}
          <strong>Create &amp; Edit</strong> tab first, then assign them here.
        </p>
      )}

      {hasAnyAddOns &&
        CATEGORY_KEYS.map((categoryKey) => {
          const list = activeAddOnsByCategory[categoryKey] || [];
          if (!list.length) return null;

          return (
            <div key={categoryKey} style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ marginBottom: "0.5rem" }}>
                {CATEGORY_LABELS[categoryKey]}
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "0.75rem",
                }}
              >
                {list.map((addOn) => {
                  const addOnId = addOn.id || addOn.code || addOn.name;
                  if (!addOnId) return null;
                  const addOnIdString = String(addOnId);
                  const price = formatPricing(addOn);

                  return (
                    <div
                      key={addOnIdString}
                      style={{
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                        padding: "0.6rem 0.7rem",
                        backgroundColor: "#f8fafc",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.4rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "0.5rem",
                          alignItems: "baseline",
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: "0.9rem",
                              fontWeight: 500,
                              color: "#0f172a",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={addOn.name || addOn.code}
                          >
                            {addOn.name || "Untitled add-on"}
                          </div>
                          {addOn.code && (
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: "#64748b",
                                marginTop: "0.1rem",
                              }}
                            >
                              Code: {addOn.code}
                            </div>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "#1f2937",
                            whiteSpace: "nowrap",
                          }}
                          title={price}
                        >
                          {price}
                        </div>
                      </div>

                      {/* Rooms matrix for this add-on */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.3rem",
                          marginTop: "0.2rem",
                        }}
                      >
                        {(rooms || []).map((room) => {
                          if (!room || !room.id) return null;
                          const roomName = room.name || "Untitled room";
                          const roomCode = room.code || "";
                          const currentState = getRoomStateForAddOn(
                            room,
                            addOnIdString
                          );

                          const nonePill = renderStatePill(
                            "Not used",
                            "none",
                            currentState
                          );
                          const inclusivePill = renderStatePill(
                            "Inclusive",
                            "inclusive",
                            currentState
                          );
                          const optionalPill = renderStatePill(
                            "Optional",
                            "optional",
                            currentState
                          );

                          return (
                            <div
                              key={room.id}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: "0.5rem",
                              }}
                            >
                              <div
                                style={{
                                  flex: 1,
                                  minWidth: 0,
                                  fontSize: "0.8rem",
                                  color: "#0f172a",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                                title={roomName}
                              >
                                {roomName}
                                {roomCode && (
                                  <span
                                    style={{
                                      marginLeft: "0.35rem",
                                      color: "#64748b",
                                      fontSize: "0.75rem",
                                    }}
                                  >
                                    ({roomCode})
                                  </span>
                                )}
                              </div>

                              <div
                                style={{
                                  display: "inline-flex",
                                  alignItems: "stretch",
                                  borderRadius: "999px",
                                  overflow: "hidden",
                                }}
                              >
                                <button
                                  type="button"
                                  style={nonePill.style}
                                  onClick={() =>
                                    handleRoomAssignmentClick(
                                      room,
                                      currentState,
                                      "none",
                                      addOnIdString
                                    )
                                  }
                                >
                                  {nonePill.label}
                                </button>
                                <button
                                  type="button"
                                  style={inclusivePill.style}
                                  onClick={() =>
                                    handleRoomAssignmentClick(
                                      room,
                                      currentState,
                                      "inclusive",
                                      addOnIdString
                                    )
                                  }
                                >
                                  {inclusivePill.label}
                                </button>
                                <button
                                  type="button"
                                  style={optionalPill.style}
                                  onClick={() =>
                                    handleRoomAssignmentClick(
                                      room,
                                      currentState,
                                      "optional",
                                      addOnIdString
                                    )
                                  }
                                >
                                  {optionalPill.label}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

      {/* Save button for assignments (persists updated rooms via save_config) */}
      <div style={{ marginTop: "1rem", textAlign: "right" }}>
        <button
          type="button"
          disabled={saving}
          onClick={handleSaveAssignments}
          style={{
            padding: "0.4rem 0.9rem",
            borderRadius: "4px",
            border: "1px solid #1976d2",
            backgroundColor: "#1976d2",
            color: "#ffffff",
            cursor: saving ? "default" : "pointer",
            fontSize: "0.9rem",
          }}
        >
          {saving ? "Saving…" : "Save Assignments"}
        </button>
      </div>
    </div>
  );
};

export default AddOnsCatalogueAssignment;
