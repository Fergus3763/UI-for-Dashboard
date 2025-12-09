// admin-ui/src/pages/Dashboard/VenueSetup/Tabs/AddOnsTab.jsx
import React, { useEffect, useMemo, useState } from "react";

/**
 * Canonical Add-On shape (what this tab reads and writes)
 *
 * {
 *   id: string,
 *   code: string,
 *   name: string,
 *   description: string,
 *   category: "fnb" | "av" | "services" | "labour" | "other",
 *   included: boolean,   // if true, treated as "included" / non-charge (amount forced to 0)
 *   pricing: {
 *     model: "PER_EVENT" | "PER_PERSON" | "PER_PERIOD" | "PER_UNIT",
 *     amount: number,    // stored as plain euros with decimals (e.g. 21.50 for €21.50)
 *     periodUnit?: "MINUTE" | "HOUR" | "DAY"  // only used when model === "PER_PERIOD"
 *   },
 *   vatClass: string,
 *   public: boolean,     // visible to guests in any public UI
 *   active: boolean      // usable vs archived
 * }
 *
 * Backwards compatibility:
 * - Missing fields are defaulted by normaliseExistingAddOn().
 * - Older shapes are tolerated as long as they can be mapped into this structure.
 */

const CATEGORY_KEYS = ["fnb", "av", "services", "labour", "other"];

const CATEGORY_LABELS = {
  fnb: "F&B",
  av: "AV / Tech",
  services: "Services & Amenities",
  labour: "Labour & 3rd Party",
  other: "Other",
};

const CATEGORY_CODE_PREFIX = {
  fnb: "FB",
  av: "AV",
  services: "SA",
  labour: "LB",
  other: "OT",
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
const DEFAULT_PERIOD_UNIT = "HOUR";

function createId() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 10)
  ).toUpperCase();
}

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

function getSuggestedCodeForCategory(addOns, category) {
  const prefix = CATEGORY_CODE_PREFIX[category] || "AD";
  // Find max numeric suffix for this category
  let maxNumber = 0;
  (Array.isArray(addOns) ? addOns : [])
    .filter((a) => a.category === category && typeof a.code === "string")
    .forEach((a) => {
      const match = a.code.match(/-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!Number.isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    });
  const nextNumber = maxNumber + 1;
  return `${prefix}-${String(nextNumber).padStart(4, "0")}`;
}

function normaliseExistingAddOn(addOn) {
  if (!addOn || typeof addOn !== "object") {
    return {
      id: createId(),
      code: "",
      name: "",
      description: "",
      category: "other",
      included: true,
      pricing: {
        model: DEFAULT_PRICING_MODEL,
        amount: 0,
        periodUnit: DEFAULT_PERIOD_UNIT,
      },
      vatClass: "",
      public: true,
      active: true,
    };
  }

  const pricing = addOn.pricing || {};

  return {
    id: addOn.id || createId(),
    code: addOn.code || "",
    name: addOn.name || "",
    description: addOn.description || "",
    category: CATEGORY_KEYS.includes(addOn.category) ? addOn.category : "other",
    included: typeof addOn.included === "boolean" ? addOn.included : true,
    pricing: {
      model: pricing.model || DEFAULT_PRICING_MODEL,
      amount: typeof pricing.amount === "number" ? pricing.amount : 0,
      periodUnit: pricing.periodUnit || DEFAULT_PERIOD_UNIT,
    },
    vatClass: addOn.vatClass || "",
    public: typeof addOn.public === "boolean" ? addOn.public : true,
    active: typeof addOn.active === "boolean" ? addOn.active : true,
  };
}

function AddOnsTab({
  addOns,
  setAddOns,
  onSave,
  saving = false,
  // Phase 3 additions:
  rooms = [],
  onUpdateRoomAssignments,
}) {
  const [selectedCategory, setSelectedCategory] = useState("fnb");
  const [editingId, setEditingId] = useState(null); // null = none, "new" = new, otherwise existing id

  // Local, normalised copy so the table updates immediately even if parent
  // state / persistence is slow or temporarily not wired.
  const [localAddOns, setLocalAddOns] = useState(() =>
    Array.isArray(addOns) ? addOns.map(normaliseExistingAddOn) : []
  );

  // Keep localAddOns in sync when parent addOns prop changes (e.g. reload).
  useEffect(() => {
    if (Array.isArray(addOns)) {
      setLocalAddOns(addOns.map(normaliseExistingAddOn));
    } else {
      setLocalAddOns([]);
    }
  }, [addOns]);

  const [formState, setFormState] = useState({
    id: null,
    code: "",
    name: "",
    description: "",
    category: "fnb",
    included: true,
    pricingModel: DEFAULT_PRICING_MODEL,
    pricingAmount: "0",
    pricingPeriodUnit: DEFAULT_PERIOD_UNIT,
    vatClass: "",
    public: true,
    active: true,
  });
  const [formErrors, setFormErrors] = useState({});

  const filteredAddOns = useMemo(
    () =>
      (Array.isArray(localAddOns) ? localAddOns : []).filter(
        (a) => a.category === selectedCategory
      ),
    [localAddOns, selectedCategory]
  );

  const resetForm = (categoryOverride) => {
    setFormErrors({});
    setFormState({
      id: null,
      code: "",
      name: "",
      description: "",
      category: categoryOverride || selectedCategory,
      included: true,
      pricingModel: DEFAULT_PRICING_MODEL,
      pricingAmount: "0",
      pricingPeriodUnit: DEFAULT_PERIOD_UNIT,
      vatClass: "",
      public: true,
      active: true,
    });
  };

  const startNewAddOn = () => {
    setEditingId("new");
    const cat = selectedCategory;
    const suggestedCode = getSuggestedCodeForCategory(localAddOns, cat);
    setFormErrors({});
    setFormState({
      id: null,
      code: suggestedCode,
      name: "",
      description: "",
      category: cat,
      included: true,
      pricingModel: DEFAULT_PRICING_MODEL,
      pricingAmount: "0",
      pricingPeriodUnit: DEFAULT_PERIOD_UNIT,
      vatClass: "",
      public: true,
      active: true,
    });
  };

  const startEditAddOn = (addOn) => {
    const n = normaliseExistingAddOn(addOn);
    setEditingId(n.id);
    setFormErrors({});
    setFormState({
      id: n.id,
      code: n.code,
      name: n.name,
      description: n.description,
      category: n.category,
      included: n.included,
      pricingModel: n.pricing.model,
      pricingAmount: String(
        typeof n.pricing.amount === "number" ? n.pricing.amount : 0
      ),
      pricingPeriodUnit: n.pricing.periodUnit || DEFAULT_PERIOD_UNIT,
      vatClass: n.vatClass || "",
      public: n.public,
      active: n.active,
    });
  };

  const handleFormFieldChange = (field, value) => {
    setFormState((prev) => {
      let updated = { ...prev, [field]: value };

      // When included is turned on, normalise amount to 0
      if (field === "included" && value === true) {
        updated.pricingAmount = "0";
      }

      // When pricingModel changes away from PER_PERIOD, keep period unit but it will be ignored
      if (field === "pricingModel" && value !== "PER_PERIOD") {
        // no-op for now but kept in state
      }

      return updated;
    });
  };

  const validateForm = () => {
    const errors = {};
    const {
      code,
      name,
      category,
      included,
      pricingModel,
      pricingAmount,
      pricingPeriodUnit,
    } = formState;

    const trimmedName = (name || "").trim();
    const trimmedCode = (code || "").trim();

    if (!trimmedName) {
      errors.name = "Name is required.";
    }
    if (!CATEGORY_KEYS.includes(category)) {
      errors.category = "Category is invalid.";
    }
    if (!trimmedCode) {
      errors.code = "Code is required.";
    }

    if (!pricingModel) {
      errors.pricingModel = "Pricing model is required.";
    }

    if (!included) {
      const amountNumber = parseFloat(pricingAmount);
      if (Number.isNaN(amountNumber) || amountNumber < 0) {
        errors.pricingAmount =
          "Amount must be a number greater than or equal to 0.";
      }
    }

    if (pricingModel === "PER_PERIOD") {
      if (!pricingPeriodUnit) {
        errors.pricingPeriodUnit =
          "Period unit is required for per-period pricing.";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const buildAddOnFromForm = () => {
    const {
      id,
      code,
      name,
      description,
      category,
      included,
      pricingModel,
      pricingAmount,
      pricingPeriodUnit,
      vatClass,
      public: isPublic,
      active,
    } = formState;

    const trimmedCode = (code || "").trim();
    const trimmedName = (name || "").trim();

    let amountNumber = parseFloat(pricingAmount);
    if (Number.isNaN(amountNumber) || amountNumber < 0) {
      amountNumber = 0;
    }

    // IMPORTANT: amountNumber is already in euro-and-cents scale (e.g. 21.50).
    // We store it as-is; no conversion to "cents" or multiplication/division.
    const pricing = {
      model: pricingModel || DEFAULT_PRICING_MODEL,
      amount: included ? 0 : amountNumber,
    };

    if (pricingModel === "PER_PERIOD") {
      pricing.periodUnit = pricingPeriodUnit || DEFAULT_PERIOD_UNIT;
    }

    return {
      id: id || createId(),
      code: trimmedCode,
      name: trimmedName,
      description: description || "",
      category: CATEGORY_KEYS.includes(category) ? category : "other",
      included: !!included,
      pricing,
      vatClass: vatClass || "",
      public: !!isPublic,
      active: !!active,
    };
  };

  const persistAndSave = (newAddOnsArray, options = { resetAfter: false }) => {
    const normalised = (Array.isArray(newAddOnsArray)
      ? newAddOnsArray
      : []
    ).map(normaliseExistingAddOn);

    // 1) Update local view immediately so the table refreshes at once
    setLocalAddOns(normalised);

    // 2) Tell parent about the raw array so it can persist to save_config
    if (typeof setAddOns === "function") {
      setAddOns(newAddOnsArray);
    }
    if (typeof onSave === "function") {
      onSave(newAddOnsArray);
    }

    // 3) Optionally reset form + exit edit mode
    if (options.resetAfter) {
      resetForm();
      setEditingId(null);
    }
  };

  const handleSubmit = (e, { addAnother = false } = {}) => {
    e.preventDefault();
    if (!validateForm()) return;

    const builtAddOn = buildAddOnFromForm();

    let nextAddOns;
    if (editingId && editingId !== "new") {
      // Update existing
      nextAddOns = (Array.isArray(localAddOns) ? localAddOns : []).map((a) =>
        a.id === editingId ? builtAddOn : a
      );
    } else {
      // Create new
      nextAddOns = [...(Array.isArray(localAddOns) ? localAddOns : []), builtAddOn];
    }

    persistAndSave(nextAddOns, { resetAfter: addAnother });

    if (!addAnother) {
      setEditingId(null);
    } else {
      // Prepare a fresh "new" form in the same category
      const suggestedCode = getSuggestedCodeForCategory(
        nextAddOns,
        selectedCategory
      );
      setEditingId("new");
      setFormErrors({});
      setFormState({
        id: null,
        code: suggestedCode,
        name: "",
        description: "",
        category: selectedCategory,
        included: true,
        pricingModel: DEFAULT_PRICING_MODEL,
        pricingAmount: "0",
        pricingPeriodUnit: DEFAULT_PERIOD_UNIT,
        vatClass: "",
        public: true,
        active: true,
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    resetForm();
  };

  const handleToggleActive = (addOn) => {
    const normalised = normaliseExistingAddOn(addOn);
    const updated = { ...normalised, active: !normalised.active };

    const nextAddOns = (Array.isArray(localAddOns) ? localAddOns : []).map(
      (a) => (a.id === updated.id ? updated : a)
    );

    persistAndSave(nextAddOns, { resetAfter: false });
  };

  // ─────────────────────────────────────
  // Assigned Rooms Panel (Phase 3)
  // ─────────────────────────────────────

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

    // Clicking the active state again → Not used
    const nextState = currentState === targetState ? "none" : targetState;

    const includedIds = new Set(normaliseIdArray(room.includedAddOns));
    const optionalIds = new Set(normaliseIdArray(room.optionalAddOns));

    // Start by removing from both to guarantee exclusivity
    includedIds.delete(idString);
    optionalIds.delete(idString);

    if (nextState === "inclusive") {
      includedIds.add(idString);
    } else if (nextState === "optional") {
      optionalIds.add(idString);
    }
    // "none" leaves it removed from both

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

  const renderAssignedRoomsSection = () => {
    // Only show when editing an existing Add-On with a stable ID
    const isNew = editingId === "new";
    const addOnId = formState.id || editingId;

    if (!editingId || isNew) {
      return null;
    }

    if (!rooms || rooms.length === 0) {
      return (
        <div style={{ marginTop: "1rem" }}>
          <h3 style={{ marginBottom: "0.5rem" }}>Assigned Rooms</h3>
          <p style={{ fontSize: "0.9rem", color: "#555" }}>
            No rooms configured yet. You can add rooms in the Room Setup tab,
            then return here to assign this add-on per room.
          </p>
        </div>
      );
    }

    const addOnIdString = String(addOnId);

    return (
      <div style={{ marginTop: "1rem" }}>
        <h3 style={{ marginBottom: "0.5rem" }}>Assigned Rooms</h3>
        <p style={{ fontSize: "0.9rem", color: "#555", marginBottom: "0.75rem" }}>
          For each room, choose whether this add-on is not used, included in the
          base price, or offered as an optional (chargeable) extra.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "0.5rem",
          }}
        >
          {rooms.map((room) => {
            if (!room || !room.id) return null;

            const name = room.name || "Untitled room";
            const code = room.code || "";
            const currentState = getRoomStateForAddOn(room, addOnIdString);

            const nonePill = renderStatePill("Not used", "none", currentState);
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
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  padding: "0.5rem 0.6rem",
                  backgroundColor: "#f8fafc",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.25rem",
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
                  <div
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      color: "#0f172a",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={name}
                  >
                    {name}
                  </div>
                  {code && (
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#64748b",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {code}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "stretch",
                    borderRadius: "999px",
                    overflow: "hidden",
                    marginTop: "0.15rem",
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
  };

  // ─────────────────────────────────────
  // Existing UI (table + form)
  // ─────────────────────────────────────

  const renderCategoryFilters = () => (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.5rem",
        marginBottom: "1rem",
      }}
    >
      {CATEGORY_KEYS.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => {
            setSelectedCategory(key);
            // When switching category, hide form unless editing something in that category
            setEditingId(null);
            resetForm(key);
          }}
          style={{
            padding: "0.4rem 0.8rem",
            borderRadius: "16px",
            border: "1px solid #ccc",
            backgroundColor: selectedCategory === key ? "#e0e0e0" : "#ffffff",
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          {CATEGORY_LABELS[key]}
        </button>
      ))}
    </div>
  );

  const renderTable = () => (
    <div style={{ marginBottom: "1.5rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ marginBottom: "0.5rem" }}>
          {CATEGORY_LABELS[selectedCategory]} Add-Ons
        </h3>

        {/* UX tweak: hide "+ New Add-On" while a form is open */}
        {editingId === null && (
          <button
            type="button"
            onClick={startNewAddOn}
            style={{
              padding: "0.4rem 0.9rem",
              borderRadius: "4px",
              border: "1px solid #1976d2",
              backgroundColor: "#1976d2",
              color: "#ffffff",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            + New Add-On
          </button>
        )}
      </div>

      {filteredAddOns.length === 0 ? (
        <p style={{ fontStyle: "italic" }}>
          No Add-Ons defined for this category yet. Click &ldquo;New Add-On
          &rdquo; to create one.
        </p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.9rem",
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>Code</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Included?</th>
                <th style={thStyle}>Public?</th>
                <th style={thStyle}>Pricing</th>
                <th style={thStyle}>Active?</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAddOns.map((addOn) => (
                <tr key={addOn.id}>
                  <td style={tdStyle}>{addOn.code}</td>
                  <td style={tdStyle}>{addOn.name}</td>
                  <td style={tdStyle}>{addOn.included ? "Yes" : "No"}</td>
                  <td style={tdStyle}>{addOn.public ? "Yes" : "No"}</td>
                  <td style={tdStyle}>{formatPricing(addOn)}</td>
                  <td style={tdStyle}>{addOn.active ? "Yes" : "No"}</td>
                  <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                    <button
                      type="button"
                      onClick={() => startEditAddOn(addOn)}
                      style={smallButtonStyle}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(addOn)}
                      style={{
                        ...smallButtonStyle,
                        marginLeft: "0.5rem",
                        backgroundColor: "#ffffff",
                        borderColor: addOn.active ? "#f57c00" : "#388e3c",
                      }}
                    >
                      {addOn.active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderForm = () => {
    if (!editingId) return null;

    const {
      code,
      name,
      description,
      category,
      included,
      pricingModel,
      pricingAmount,
      pricingPeriodUnit,
      vatClass,
      public: isPublic,
      active,
    } = formState;

    const isNew = editingId === "new";

    return (
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "4px",
          padding: "1rem",
          marginBottom: "1rem",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "0.75rem" }}>
          {isNew ? "New Add-On" : "Edit Add-On"}
        </h3>
        <form onSubmit={(e) => handleSubmit(e, { addAnother: false })}>
          {/* Code & Name */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              marginBottom: "0.75rem",
            }}
          >
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>
                Code
                <input
                  type="text"
                  value={code}
                  onChange={(e) =>
                    handleFormFieldChange("code", e.target.value)
                  }
                  style={inputStyle}
                />
              </label>
              {formErrors.code && (
                <div style={errorTextStyle}>{formErrors.code}</div>
              )}
              <div style={{ fontSize: "0.8rem", color: "#555" }}>
                Suggested format per category, e.g. FB-0001, AV-0001.
              </div>
            </div>

            <div style={{ flex: 2 }}>
              <label style={labelStyle}>
                Name *
                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    handleFormFieldChange("name", e.target.value)
                  }
                  style={inputStyle}
                  required
                />
              </label>
              {formErrors.name && (
                <div style={errorTextStyle}>{formErrors.name}</div>
              )}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: "0.75rem" }}>
            <label style={labelStyle}>
              Description
              <textarea
                value={description}
                onChange={(e) =>
                  handleFormFieldChange("description", e.target.value)
                }
                style={{
                  ...inputStyle,
                  minHeight: "70px",
                  resize: "vertical",
                }}
              />
            </label>
          </div>

          {/* Category & Visibility */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              marginBottom: "0.75rem",
            }}
          >
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>
                Category *
                <select
                  value={category}
                  onChange={(e) =>
                    handleFormFieldChange("category", e.target.value)
                  }
                  style={inputStyle}
                >
                  {CATEGORY_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {CATEGORY_LABELS[key]}
                    </option>
                  ))}
                </select>
              </label>
              {formErrors.category && (
                <div style={errorTextStyle}>{formErrors.category}</div>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ ...labelStyle, display: "block" }}>
                <input
                  type="checkbox"
                  checked={included}
                  onChange={(e) =>
                    handleFormFieldChange("included", e.target.checked)
                  }
                  style={{ marginRight: "0.5rem" }}
                />
                Included (no extra charge)
              </label>
              <label
                style={{ ...labelStyle, display: "block", marginTop: "0.25rem" }}
              >
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) =>
                    handleFormFieldChange("public", e.target.checked)
                  }
                  style={{ marginRight: "0.5rem" }}
                />
                Public (visible to guests)
              </label>
              <label
                style={{ ...labelStyle, display: "block", marginTop: "0.25rem" }}
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) =>
                    handleFormFieldChange("active", e.target.checked)
                  }
                  style={{ marginRight: "0.5rem" }}
                />
                Active
              </label>
            </div>
          </div>

          {/* Pricing */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              marginBottom: "0.75rem",
            }}
          >
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>
                Pricing model *
                <select
                  value={pricingModel}
                  onChange={(e) =>
                    handleFormFieldChange("pricingModel", e.target.value)
                  }
                  style={inputStyle}
                >
                  <option value="PER_EVENT">Per event</option>
                  <option value="PER_PERSON">Per person</option>
                  <option value="PER_PERIOD">Per period</option>
                  <option value="PER_UNIT">Per unit</option>
                </select>
              </label>
              {formErrors.pricingModel && (
                <div style={errorTextStyle}>{formErrors.pricingModel}</div>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <label style={labelStyle}>
                Amount (€) {included && "(ignored when Included is ticked)"}
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={pricingAmount}
                  disabled={included}
                  onChange={(e) =>
                    handleFormFieldChange("pricingAmount", e.target.value)
                  }
                  style={inputStyle}
                />
              </label>
              {formErrors.pricingAmount && (
                <div style={errorTextStyle}>{formErrors.pricingAmount}</div>
              )}
              <div style={{ fontSize: "0.8rem", color: "#555" }}>
                Enter the total price in euro and cents, e.g. 21.50 for €21.50.
              </div>
            </div>

            {pricingModel === "PER_PERIOD" && (
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>
                  Period unit *
                  <select
                    value={pricingPeriodUnit}
                    onChange={(e) =>
                      handleFormFieldChange(
                        "pricingPeriodUnit",
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  >
                    <option value="MINUTE">Per minute</option>
                    <option value="HOUR">Per hour</option>
                    <option value="DAY">Per day</option>
                  </select>
                </label>
                {formErrors.pricingPeriodUnit && (
                  <div style={errorTextStyle}>
                    {formErrors.pricingPeriodUnit}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* VAT */}
          <div style={{ marginBottom: "0.75rem", maxWidth: "320px" }}>
            <label style={labelStyle}>
              VAT class (optional)
              <input
                type="text"
                value={vatClass}
                onChange={(e) =>
                  handleFormFieldChange("vatClass", e.target.value)
                }
                style={inputStyle}
              />
            </label>
          </div>

          {/* Assigned Rooms (Phase 3) */}
          {renderAssignedRoomsSection()}

          {/* Form actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginTop: "0.75rem",
            }}
          >
            <button
              type="submit"
              disabled={saving}
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
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={(e) => handleSubmit(e, { addAnother: true })}
              style={{
                padding: "0.4rem 0.9rem",
                borderRadius: "4px",
                border: "1px solid #1976d2",
                backgroundColor: "#ffffff",
                color: "#1976d2",
                cursor: saving ? "default" : "pointer",
                fontSize: "0.9rem",
              }}
            >
              {saving ? "Saving…" : "Save and add another"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              style={{
                padding: "0.4rem 0.9rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
                backgroundColor: "#ffffff",
                cursor: saving ? "default" : "pointer",
                fontSize: "0.9rem",
                marginLeft: "0.5rem",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div>
      <h2 style={{ marginTop: 0, marginBottom: "0.5rem" }}>Add-Ons</h2>
      <p style={{ marginBottom: "1rem", maxWidth: "720px" }}>
        Add-Ons are goods or services that can be attached to a meeting-room
        booking, such as F&amp;B items, AV/tech equipment, services and
        amenities, labour, or other extras. This is the master list for all
        categories, with a common form and clear flags for whether an Add-On is
        included, chargeable, public, or active.
      </p>

      {renderCategoryFilters()}
      {renderTable()}
      {renderForm()}
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  borderBottom: "1px solid #ddd",
  padding: "0.5rem",
  fontWeight: 600,
};

const tdStyle = {
  borderBottom: "1px solid #eee",
  padding: "0.5rem",
  verticalAlign: "top",
};

const labelStyle = {
  display: "block",
  fontSize: "0.85rem",
  fontWeight: 600,
  marginBottom: "0.25rem",
};

const inputStyle = {
  width: "100%",
  padding: "0.3rem 0.4rem",
  borderRadius: "3px",
  border: "1px solid #ccc",
  fontSize: "0.9rem",
  boxSizing: "border-box",
};

const errorTextStyle = {
  color: "#b71c1c",
  fontSize: "0.8rem",
  marginTop: "0.1rem",
};

const smallButtonStyle = {
  padding: "0.25rem 0.6rem",
  borderRadius: "3px",
  border: "1px solid #ccc",
  backgroundColor: "#ffffff",
  cursor: "pointer",
  fontSize: "0.8rem",
};

export default AddOnsTab;
