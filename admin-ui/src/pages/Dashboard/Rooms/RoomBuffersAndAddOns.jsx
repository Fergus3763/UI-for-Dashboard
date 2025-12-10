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

  // status is "none" | "included" | "optional"
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

  const renderAddOnRow = (addOn) => {
    const id = getAddOnId(addOn);
    if (!id) return null;

    const label = getAddOnLabel(addOn, id);
    const key = String(id);

    let status = "none";
    if (includedIds.includes(key)) status = "included";
    else if (optionalIds.includes(key)) status = "optional";

    const categoryLabel =
      addOn.category && CATEGORY_LABELS[addOn.category]
        ? CATEGORY_LABELS[addOn.category]
        : "";

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
            {categoryLabel && (
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                {categoryLabel}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: "0.25rem" }}>
            <button
              type="button"
              onClick={() =>
                toggleAddOnStatus(
                  id,
                  status === "included" ? "none" : "included"
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

  // Only show active add-ons (or add-ons where active is undefined)
  const visibleAddOns = (addOns || []).filter(
    (a) => a && (a.active === undefined || a.active === true)
  );

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
        <label>Add-Ons for this room</label>
        <p
          style={{
            fontSize: "0.9rem",
            color: "#555",
            marginBottom: "0.5rem",
          }}
        >
          Add-Ons shown here come from your central Add-On Catalogue. Use{" "}
          <strong>Inclusive</strong> to mark items that are included in this
          room&apos;s base price, and <strong>Optional</strong> for chargeable
          extras. If neither is selected, the add-on is treated as{" "}
          <strong>Not used</strong> for this room. To create, retire, or
          maintain Add-Ons, use the <strong>Add-Ons</strong> tab.
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
          {visibleAddOns.map((addOn) => renderAddOnRow(addOn))}

          {(!visibleAddOns || !visibleAddOns.length) && (
            <span style={{ fontSize: "0.9rem", color: "#777" }}>
              No active add-ons available for this room. Configure add-ons in
              the Add-Ons tab first.
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
