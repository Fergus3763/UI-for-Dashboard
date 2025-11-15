// admin-ui/src/pages/Dashboard/VenueSetup/Tabs/AddOnsTab.jsx

import React, { useState, useMemo } from "react";

const CATEGORY_OPTIONS = [
  { value: "rooms", label: "Rooms" },
  { value: "fnb", label: "F&B" },
  { value: "av", label: "AV" },
  { value: "labour", label: "Labour" },
  { value: "other", label: "Other" },
];

const PRICING_MODEL_OPTIONS = [
  { value: "PER_EVENT", label: "Per event" },
  { value: "PER_PERSON", label: "Per person" },
  { value: "PER_PERIOD", label: "Per period" },
  { value: "PER_UNIT", label: "Per unit" },
];

const PERIOD_UNIT_OPTIONS = [
  { value: "MINUTE", label: "Minute" },
  { value: "HOUR", label: "Hour" },
  { value: "DAY", label: "Day" },
];

function createEmptyAddOn() {
  return {
    id: generateAddOnId(),
    name: "",
    description: "",
    category: "rooms",
    included: false,
    pricing: {
      model: "PER_EVENT",
      amount: 0,
      periodUnit: "HOUR",
    },
    active: true,
  };
}

function generateAddOnId() {
  // Simple, stable-enough ID for MVP – persisted as plain string.
  return `addon_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function normaliseAddOn(addOn) {
  // Ensure required fields exist and have sane defaults.
  const pricing = addOn.pricing || {};
  return {
    id: addOn.id || generateAddOnId(),
    name: addOn.name || "",
    description: addOn.description || "",
    category: addOn.category || "rooms",
    included: Boolean(addOn.included),
    pricing: {
      model: pricing.model || "PER_EVENT",
      amount:
        typeof pricing.amount === "number" && pricing.amount >= 0
          ? pricing.amount
          : 0,
      periodUnit: pricing.periodUnit || "HOUR",
    },
    active: typeof addOn.active === "boolean" ? addOn.active : true,
  };
}

const AddOnsTab = ({ addOns, setAddOns, onSave }) => {
  const [editingAddOn, setEditingAddOn] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const normalisedAddOns = useMemo(
    () => (Array.isArray(addOns) ? addOns.map(normaliseAddOn) : []),
    [addOns]
  );

  const handleStartCreate = () => {
    setEditingAddOn(createEmptyAddOn());
    setIsCreating(true);
  };

  const handleStartEdit = (addOn) => {
    setEditingAddOn(normaliseAddOn(addOn));
    setIsCreating(false);
  };

  const handleCancelEdit = () => {
    setEditingAddOn(null);
    setIsCreating(false);
  };

  const handleChangeField = (field, value) => {
    setEditingAddOn((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  };

  const handleChangePricingField = (field, value) => {
    setEditingAddOn((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        pricing: {
          ...prev.pricing,
          [field]: value,
        },
      };
    });
  };

  const handleToggleActive = (addOnId) => {
    const updated = normalisedAddOns.map((a) =>
      a.id === addOnId ? { ...a, active: !a.active } : a
    );
    setAddOns(updated);
  };

  const handleDelete = (addOnId) => {
    // For MVP we keep "deactivate" as the main action.
    // If needed, this can be switched to a hard delete later.
    const updated = normalisedAddOns.filter((a) => a.id !== addOnId);
    setAddOns(updated);
  };

  const handleSaveEditing = () => {
    if (!editingAddOn) return;

    const cleaned = normaliseAddOn(editingAddOn);

    if (!cleaned.name.trim()) {
      alert("Please enter a name for the Add-on.");
      return;
    }

    let updated;
    const existingIndex = normalisedAddOns.findIndex(
      (a) => a.id === cleaned.id
    );

    if (existingIndex === -1) {
      updated = [...normalisedAddOns, cleaned];
    } else {
      updated = [...normalisedAddOns];
      updated[existingIndex] = cleaned;
    }

    setAddOns(updated);
    setEditingAddOn(null);
    setIsCreating(false);
  };

  const handleSaveToServer = () => {
    if (typeof onSave === "function") {
      onSave();
    }
  };

  const renderPricingSummary = (addOn) => {
    if (addOn.included) {
      return "Included";
    }

    const amount = addOn.pricing?.amount ?? 0;
    const model = addOn.pricing?.model || "PER_EVENT";
    const periodUnit = addOn.pricing?.periodUnit || "HOUR";

    if (model === "PER_EVENT") {
      return `€${amount} per event`;
    }
    if (model === "PER_PERSON") {
      return `€${amount} per person`;
    }
    if (model === "PER_PERIOD") {
      if (periodUnit === "MINUTE") {
        return `€${amount} per minute`;
      }
      if (periodUnit === "DAY") {
        return `€${amount} per day`;
      }
      return `€${amount} per hour`;
    }
    if (model === "PER_UNIT") {
      // MVP: treat as per person.
      return `€${amount} per person`;
    }

    return `€${amount}`;
  };

  return (
    <div style={{ padding: "16px" }}>
      <h2 style={{ marginBottom: "8px" }}>Add-ons</h2>
      <p style={{ marginBottom: "16px" }}>
        Create and manage Add-ons for all categories. These will be used later
        in the Booker to show Included and Charged extras.
      </p>

      {/* List / table of add-ons */}
      <div style={{ marginBottom: "16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <h3 style={{ margin: 0 }}>All Add-ons</h3>
          <button type="button" onClick={handleStartCreate}>
            Add new Add-on
          </button>
        </div>

        {normalisedAddOns.length === 0 ? (
          <p>No Add-ons have been created yet.</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "8px",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                    padding: "8px",
                  }}
                >
                  Name
                </th>
                <th
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                    padding: "8px",
                  }}
                >
                  Category
                </th>
                <th
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                    padding: "8px",
                  }}
                >
                  Included?
                </th>
                <th
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                    padding: "8px",
                  }}
                >
                  Pricing
                </th>
                <th
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                    padding: "8px",
                  }}
                >
                  Active?
                </th>
                <th
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                    padding: "8px",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {normalisedAddOns.map((addOn) => {
                const categoryLabel =
                  CATEGORY_OPTIONS.find((c) => c.value === addOn.category)
                    ?.label || addOn.category;

                return (
                  <tr key={addOn.id}>
                    <td
                      style={{
                        borderBottom: "1px solid #eee",
                        padding: "8px",
                      }}
                    >
                      {addOn.name || <em>(No name)</em>}
                    </td>
                    <td
                      style={{
                        borderBottom: "1px solid #eee",
                        padding: "8px",
                      }}
                    >
                      {categoryLabel}
                    </td>
                    <td
                      style={{
                        borderBottom: "1px solid #eee",
                        padding: "8px",
                      }}
                    >
                      {addOn.included ? "Yes" : "No"}
                    </td>
                    <td
                      style={{
                        borderBottom: "1px solid #eee",
                        padding: "8px",
                      }}
                    >
                      {renderPricingSummary(addOn)}
                    </td>
                    <td
                      style={{
                        borderBottom: "1px solid #eee",
                        padding: "8px",
                      }}
                    >
                      {addOn.active ? "Yes" : "No"}
                    </td>
                    <td
                      style={{
                        borderBottom: "1px solid #eee",
                        padding: "8px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleStartEdit(addOn)}
                        style={{ marginRight: "8px" }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(addOn.id)}
                        style={{ marginRight: "8px" }}
                      >
                        {addOn.active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(addOn.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Editor panel */}
      {editingAddOn && (
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "4px",
            padding: "16px",
            marginBottom: "16px",
          }}
        >
          <h3 style={{ marginTop: 0 }}>
            {isCreating ? "Create Add-on" : "Edit Add-on"}
          </h3>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", marginBottom: "4px" }}>
              Name
            </label>
            <input
              type="text"
              value={editingAddOn.name}
              onChange={(e) => handleChangeField("name", e.target.value)}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", marginBottom: "4px" }}>
              Description (optional)
            </label>
            <textarea
              value={editingAddOn.description || ""}
              onChange={(e) =>
                handleChangeField("description", e.target.value)
              }
              style={{ width: "100%", padding: "8px", minHeight: "60px" }}
            />
          </div>

          <div style={{ marginBottom: "12px", display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "4px" }}>
                Category
              </label>
              <select
                value={editingAddOn.category}
                onChange={(e) =>
                  handleChangeField("category", e.target.value)
                }
                style={{ width: "100%", padding: "8px" }}
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "4px" }}>
                Included (free)
              </label>
              <input
                type="checkbox"
                checked={editingAddOn.included}
                onChange={(e) =>
                  handleChangeField("included", e.target.checked)
                }
              />{" "}
              <span>Show as Included, no extra cost</span>
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "4px" }}>
                Active
              </label>
              <input
                type="checkbox"
                checked={editingAddOn.active}
                onChange={(e) =>
                  handleChangeField("active", e.target.checked)
                }
              />{" "}
              <span>Visible in Booker when active</span>
            </div>
          </div>

          <div
            style={{
              marginBottom: "12px",
              padding: "12px",
              border: "1px solid #eee",
              borderRadius: "4px",
            }}
          >
            <h4 style={{ marginTop: 0 }}>Pricing</h4>

            <div style={{ display: "flex", gap: "16px", marginBottom: "8px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "4px" }}>
                  Pricing model
                </label>
                <select
                  value={editingAddOn.pricing.model}
                  onChange={(e) =>
                    handleChangePricingField("model", e.target.value)
                  }
                  style={{ width: "100%", padding: "8px" }}
                >
                  {PRICING_MODEL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "4px" }}>
                  Amount
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editingAddOn.pricing.amount}
                  onChange={(e) =>
                    handleChangePricingField(
                      "amount",
                      Number(e.target.value) || 0
                    )
                  }
                  style={{ width: "100%", padding: "8px" }}
                />
              </div>

              {editingAddOn.pricing.model === "PER_PERIOD" && (
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: "4px" }}>
                    Period unit
                  </label>
                  <select
                    value={editingAddOn.pricing.periodUnit}
                    onChange={(e) =>
                      handleChangePricingField("periodUnit", e.target.value)
                    }
                    style={{ width: "100%", padding: "8px" }}
                  >
                    {PERIOD_UNIT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <p style={{ fontSize: "12px", color: "#555", marginTop: "4px" }}>
              If the Add-on is marked as Included, this price will not be added
              to the total but will still be shown to guests as Included.
            </p>
          </div>

          <div style={{ marginTop: "12px" }}>
            <button
              type="button"
              onClick={handleSaveEditing}
              style={{ marginRight: "8px" }}
            >
              Save Add-on
            </button>
            <button type="button" onClick={handleCancelEdit}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Save to config */}
      <div>
        <button type="button" onClick={handleSaveToServer}>
          Save Add-ons to config
        </button>
      </div>
    </div>
  );
};

export default AddOnsTab;
