// admin-ui/src/pages/Dashboard/VenueSetup/Tabs/AddOnsTab.jsx
import React, { useMemo, useState } from "react";

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
    const unitLabel = periodUnit && PERIOD_UNIT_LABELS[periodUnit] ? PERIOD_UNIT_LABELS[periodUnit] : "";
    return `${base} (${PRICING_MODE_LABELS[model]} ${unitLabel ? unitLabel : ""})`.trim();
  }

  const label = PRICING_MODE_LABELS[model] || model;
  return `${base} (${label})`;
}

function getSuggestedCodeForCategory(addOns, category) {
  const prefix = CATEGORY_CODE_PREFIX[category] || "AD";
  // Find max numeric suffix for this category
  let maxNumber = 0;
  addOns
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
  // Ensure we always have the shape we expect
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
}) {
  const [selectedCategory, setSelectedCategory] = useState("fnb");
  const [editingId, setEditingId] = useState(null); // null = none, "new" = new, otherwise existing id
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
      (Array.isArray(addOns) ? addOns : []).map(normaliseExistingAddOn)
        .filter((a) => a.category === selectedCategory),
    [addOns, selectedCategory]
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
    const suggestedCode = getSuggestedCodeForCategory(addOns || [], cat);
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
        errors.pricingAmount = "Amount must be a number greater than or equal to 0.";
      }
    }

    if (pricingModel === "PER_PERIOD") {
      if (!pricingPeriodUnit) {
        errors.pricingPeriodUnit = "Period unit is required for per-period pricing.";
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
    setAddOns(newAddOnsArray);
    if (typeof onSave === "function") {
      onSave(newAddOnsArray);
    }
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
      nextAddOns = (addOns || []).map((a) =>
        a.id === editingId ? builtAddOn : a
      );
    } else {
      // Create new
      nextAddOns = [...(addOns || []), builtAddOn];
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
      setFormState((prev) => ({
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
      }));
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    resetForm();
  };

  const handleToggleActive = (addOn) => {
    const normalised = normaliseExistingAddOn(addOn);
    const updated = { ...normalised, active: !normalised.active };
    const nextAddOns = (addOns || []).map((a) =>
      a.id === updated.id ? updated : a
    );
    persistAndSave(nextAddOns, { resetAfter: false });
  };

  const renderCategoryFilters = () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ marginBottom: "0.5rem" }}>
          {CATEGORY_LABELS[selectedCategory]} Add-Ons
        </h3>
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
      </div>

      {filteredAddOns.length === 0 ? (
        <p style={{ fontStyle: "italic" }}>
          No Add-Ons defined for this category yet. Click &ldquo;New Add-On&rdquo; to create one.
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
                        backgroundColor: addOn.active ? "#ffffff" : "#ffffff",
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
          <div style={{ display: "flex", gap: "1rem", marginBottom: "0.75rem" }}>
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
                style={{ ...inputStyle, minHeight: "70px", resize: "vertical" }}
              />
            </label>
          </div>

          {/* Category & Visibility */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "0.75rem" }}>
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
              <label style={{ ...labelStyle, display: "block", marginTop: "0.25rem" }}>
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
              <label style={{ ...labelStyle, display: "block", marginTop: "0.25rem" }}>
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
          <div style={{ display: "flex", gap: "1rem", marginBottom: "0.75rem" }}>
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
                Amount {included && "(ignored when Included is ticked)"}
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
            </div>

            {pricingModel === "PER_PERIOD" && (
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>
                  Period unit *
                  <select
                    value={pricingPeriodUnit}
                    onChange={(e) =>
                      handleFormFieldChange("pricingPeriodUnit", e.target.value)
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

          {/* Form actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
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
        Add-Ons are goods or services that can be attached to a meeting-room booking,
        such as F&amp;B items, AV/tech equipment, services and amenities, labour,
        or other extras. This is the master list for all categories, with a common
        form and clear flags for whether an Add-On is included, chargeable, public,
        or active.
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
