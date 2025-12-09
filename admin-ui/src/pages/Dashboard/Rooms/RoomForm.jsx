// admin-ui/src/pages/Dashboard/Rooms/RoomForm.jsx

import React from "react";
import RoomImagesEditor from "./RoomImagesEditor";
import RoomLayoutsEditor from "./RoomLayoutsEditor";
import RoomPricingEditor from "./RoomPricingEditor";
import RoomBuffersAndAddOns from "./RoomBuffersAndAddOns";

const PREDEFINED_FEATURES = [
  "WiFi",
  "Projector",
  "Whiteboard",
  "Natural Light",
  "Conference Phone",
  "TV Screen",
  "Sound System",
];

const RoomForm = ({ room, addOns, onChange, onCodeChange }) => {
  const updateField = (field, value) => {
    onChange({ ...room, [field]: value });
  };

  const handleCodeInputChange = (e) => {
    const newCode = e.target.value;
    onChange({ ...room, code: newCode });
    if (typeof onCodeChange === "function") {
      onCodeChange(room, newCode);
    }
  };

  const toggleFeature = (feature) => {
    const hasFeature = room.features?.includes(feature);
    const nextFeatures = hasFeature
      ? room.features.filter((f) => f !== feature)
      : [...(room.features || []), feature];

    updateField("features", nextFeatures);
  };

  const handleImagesChange = (images) => {
    updateField("images", images);
  };

  const handleLayoutsChange = (layouts) => {
    updateField("layouts", layouts);
  };

  const handlePricingChange = (pricing) => {
    updateField("pricing", pricing);
  };

  const handleBuffersAndAddOnsChange = (changes) => {
    onChange({ ...room, ...changes });
  };

  return (
    <div className="room-form">
      {/* BASIC DETAILS */}
      <section
        className="room-section"
        style={{ marginBottom: "1.5rem", borderBottom: "1px solid #eee" }}
      >
        <h3>Basic Details</h3>
        <div
          className="room-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
          }}
        >
          <div className="form-group">
            <label>Room Code</label>
            <input
              type="text"
              value={room.code || ""}
              onChange={handleCodeInputChange}
              placeholder="RM-001"
            />
            <small>
              Leave blank to auto-generate the next available code (RM-001,
              RM-002…).
            </small>
          </div>

          <div className="form-group">
            <label>Room Name</label>
            <input
              type="text"
              value={room.name || ""}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="e.g. Boardroom A"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={room.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
              rows={3}
              placeholder="Short description of this room…"
            />
          </div>

          <div className="form-group">
            <label>Active</label>
            <div>
              <label style={{ display: "inline-flex", alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={!!room.active}
                  onChange={(e) => updateField("active", e.target.checked)}
                  style={{ marginRight: "0.4rem" }}
                />
                Room is active (bookable)
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* IMAGES */}
      <section
        className="room-section"
        style={{ marginBottom: "1.5rem", borderBottom: "1px solid #eee" }}
      >
        <h3>Room Images</h3>
        <p style={{ fontSize: "0.9rem", color: "#555" }}>
          Upload up to 6 images. You can upload, replace, delete and reorder
          images. Only the image URLs are stored in the configuration.
        </p>
        <RoomImagesEditor
          images={room.images || []}
          onChange={handleImagesChange}
        />
      </section>

      {/* FEATURES */}
      <section
        className="room-section"
        style={{ marginBottom: "1.5rem", borderBottom: "1px solid #eee" }}
      >
        <h3>Room Features</h3>
        <p style={{ fontSize: "0.9rem", color: "#555" }}>
          Tick the features available in this room.
        </p>
        <div
          className="features-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(affig...)" // <-- keep your existing layout here
          }}
        >
          {PREDEFINED_FEATURES.map((feature) => (
            <label
              key={feature}
              style={{ display: "inline-flex", alignItems: "center" }}
            >
              <input
                type="checkbox"
                checked={room.features?.includes(feature) || false}
                onChange={() => toggleFeature(feature)}
                style={{ marginRight: "0.4rem" }}
              />
              {feature}
            </label>
          ))}
        </div>
      </section>

      {/* LAYOUTS */}
      <section
        className="room-section"
        style={{ marginBottom: "1.5rem", borderBottom: "1px solid #eee" }}
      >
        <h3>Room Layouts</h3>
        <p style={{ fontSize: "0.9rem", color: "#555" }}>
          Define which layouts this room supports and the min/max capacities for
          each.
        </p>
        <RoomLayoutsEditor
          layouts={room.layouts || []}
          onChange={handleLayoutsChange}
        />
      </section>

      {/* PRICING */}
      <section
        className="room-section"
        style={{ marginBottom: "1.5rem", borderBottom: "1px solid #eee" }}
      >
        <h3>Base Pricing</h3>
        <RoomPricingEditor
          pricing={room.pricing || { perPerson: 0, perRoom: 0, rule: "higher" }}
          onChange={handlePricingChange}
        />
      </section>

      {/* BUFFER + ADD-ONS */}
      <section className="room-section" style={{ marginBottom: "1.5rem" }}>
        <h3>Buffer &amp; Add-Ons</h3>
        <RoomBuffersAndAddOns
          bufferBefore={room.bufferBefore}
          bufferAfter={room.bufferAfter}
          includedAddOns={room.includedAddOns || []}
          optionalAddOns={room.optionalAddOns || []}
          addOns={addOns}
          onChange={handleBuffersAndAddOnsChange}
        />
      </section>
    </div>
  );
};

export default RoomForm;
