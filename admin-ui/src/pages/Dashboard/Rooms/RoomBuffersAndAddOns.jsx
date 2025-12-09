// admin-ui/src/pages/Dashboard/Rooms/RoomBuffersAndAddOns.jsx

import React from "react";

const RoomBuffersAndAddOns = ({
  bufferBefore,
  bufferAfter,
  includedAddOns,
  optionalAddOns,
  addOns,
  onChange,
}) => {
  // ---- Buffer helpers -------------------------------------------------------

  const handleBufferChange = (field, rawValue) => {
    const value =
      rawValue === "" ? 0 : Math.max(0, parseInt(rawValue, 10) || 0);
    onChange({ [field]: value });
  };

  // ---- Add-on helpers -------------------------------------------------------

  const toIdArray = (value) => {
    if (!Array.isArray(value)) return [];
    return value.map((x) => String(x));
  };

  const includedIds = toIdArray(includedAddOns);
  const optionalIds = toIdArray(optionalAddOns);

  const statusStyleMap = {
    free: {
      backgroundColor: "#e6f4ea",
      border: "1px solid #c4e3ce",
      color: "#1b5e20",
    },
    admin: {
      backgroundColor: "#ffebee",
      border: "1px solid #ffcdd2",
      color: "#b71c1c",
    },
    booked: {
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

  const getAddOnId = (addOn) => {
    if (!addOn || typeof addOn !== "object") return null;
    return (
      addOn.id || addOn.code || addOn.slug || addOn.value || addOn.name || null
    );
  };

  const getAddOnLabel = (addOn, id) => {
    return (
      addOn.name ||
      addOn.label ||
      addOn.title ||
      addOn.code ||
      String(id)
    );
  };

  const getStatusForDay = (iso) => {
    if (includedIds.includes(iso) && optionalIds.includes(iso)) {
      return "mixed";
    }
    if (includedIds.includes(iso)) return "blocked-admin";
    if (optionalIds.includes(iso)) return "blocked-booked";
    return "free";
  };

  const toggleAddOnStatus = (id, status) => {
    const idString = String(id);
    const nextIncluded = new Set(includedIds);
    const nextOptional = new Set(optionalIds);

    // Ensure mutual exclusivity:
    nextIncluded.delete(idString);
    nextOptional.delete(idString);

    if (status === "included") {
      nextIncluded.add(idString);
    } else if (status === "optional") {
      nextOptional.add(idString);
    }
    // status === "none" -> both sets already cleared

    onChange({
      includedAddOns: Array.from(nextIncluded),
      optionalAddOns: Array.from(nextOptional),
    });
  };

  const renderStatusPill = (status, label) => {
    if (status === "included") {
      return (
        <span
          style={{
            ...statusStyleMap["blocked-admin"],
            padding: "0.2rem 0.45rem",
            borderRadius: "999px",
            fontSize: "0.8rem",
          }}
        >
          Included
        </span>
      );
    }
    if (status === "optional") {
      return (
        <span
          style={{
            ...statusStyleMap["blocked-booked"],
            padding: "0.2rem 0.45rem",
            borderRadius: "999px",
            fontSize: "0.8rem",
          }}
        >
          Optional
        </span>
      );
    }
    return (
      <span
        style={{
          ...statusStyleMap.free,
          padding: "0.2rem 0.45rem",
          borderRadius: "999px",
          fontSize: "0.8rem",
        }}
      >
        Not used
      </span>
    );
  };

  const renderAddOnRow = (addOn) => {
    const id = getAddOnId(addOn);
    if (!id) return null;

    const label = getAddOnLabel(addOn, id);
    const key = String(id);

    let status = "none";
    if (includedIds.includes(key)) status = "included";
    else if (optionalIds.includes(key)) status = "optional";

    return (
      <div
        key={key}
        style={{
          padding: "0.4rem 0",
          borderBottom: "1px solid #f2f2f2",
          fontSize: "0.9rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
          }}
        >
          <div>
            <div>{label}</div>
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
              {addOn.category && CATEGORY_LABELS[addOn.category]
                ? CATEGORY_LABELS[addOn.category]
                : ""}
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.25rem" }}>
            <button
              type="button"
              onClick={() =>
                toggleAddOnStatus(
                  id,
                  status === "none" ? "included" : "none"
                )
              }
              style={{
                padding: "0.25rem 0.5rem",
                borderRadius: "999px",
                border: "1px solid #ccc",
                backgroundColor:
                  status === "included" ? "#e6f4ea" : "#ffffff",
                color: status === "included" ? "#1b5e20" : "#333",
                cursor: "pointer",
                fontSize: "0.8rem",
              }}
            >
              Inclusive
            </button>
            <button
              type="button"
              onClick={() =>
                toggleAddOnStatus(
                  id,
                  status === "optional" ? "none" : "optional"
                )
              }
              style={{
                padding: "0.25rem 0.5rem",
                borderRadius: "999px",
                border: "1px solid #ccc",
                backgroundColor:
                  status === "optional" ? "#e3f2fd" : "#ffffff",
                color: status === "optional" ? "#0d47a1" : "#333",
                cursor: "pointer",
                fontSize: "0.8rem",
              }}
            >
              Optional
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="room-buffers-addons">
      {/* Buffers */}
      <div
        className="buffers-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        <div className="form-group">
          <label>Buffer Before (minutes)</label>
          <input
            type="number"
            min={0}
            value={bufferBefore ?? 0}
            onChange={(e) => handleBufferChange("bufferBefore", e.target.value)}
            placeholder="e.g. 30"
          />
        </div>
        <div className="form-group">
          <label>Buffer After (minutes)</label>
          <input
            type="number"
            min={0}
            value={bufferAfter ?? 0}
            onChange={(e) => handleBufferChange("bufferAfter", e.target.value)}
            placeholder="e.g. 30"
          />
        </div>
      </div>

      {/* Add-Ons */}
      <div className="form-group">
        <label>Buffers &amp; Add-Ons</label>
        <p style={{ fontSize: "0.9rem", color: "#555", marginBottom: "0.5rem" }}>
          For each add-on, choose whether it is <strong>not used</strong> in this
          room, <strong>included</strong> in the base price, or offered as an
          <strong> optional (chargeable)</strong> extra.
        </p>

      {/* Add-Ons list */}
        <div
          className="addons-grid"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.35rem",
          }}
        >
          {(addOns || []).map((addOn) => renderAddOnRow(addOn))}

          {(!addOns || !addOns.length) && (
            <span style={{ fontSize: "0.9rem", color: "#777" }}>
              No add-ons configured yet.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const CATEGORY_LABELS = {
  fnb: "F&B",
  av: "AV / Tech",
  services: "Services & Amenities",
  labour: "Labour & 3rd Party",
  other: "Other",
};

export default RoomBuffersAndAddOns;
