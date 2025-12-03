// admin-ui/src/pages/Dashboard/RoomOverview/index.jsx

import React, { useEffect, useState } from "react";

const RoomOverviewPage = () => {
  const [rooms, setRooms] = useState([]);
  const [addOnsById, setAddOnsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ─────────────────────────────────────
  // Load config via load_config function
  // ─────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    const loadConfig = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/.netlify/functions/load_config");
        if (!res.ok) {
          throw new Error(`load_config failed: ${res.status}`);
        }

        const payload = await res.json();
        const data = payload?.data ?? payload ?? {};

        const roomsData = Array.isArray(data.rooms) ? data.rooms : [];
        const addOns = Array.isArray(data.addOns) ? data.addOns : [];

        const addOnMap = {};
        addOns.forEach((addOn) => {
          if (addOn && addOn.id) {
            addOnMap[addOn.id] = addOn;
          }
        });

        if (isMounted) {
          setRooms(roomsData);
          setAddOnsById(addOnMap);
        }
      } catch (err) {
        console.error("Error loading config for Room Overview:", err);
        if (isMounted) {
          setError(
            "Unable to load room configuration. Please try again later."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  // ─────────────────────────────────────
  // Small helpers
  // ─────────────────────────────────────

  const truncateText = (text, maxLength = 220) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength - 3)}…`;
  };

  const formatLayoutName = (layout) => {
    if (!layout) return "";
    if (layout.type === "CUSTOM" && layout.customName) {
      return layout.customName;
    }
    if (layout.type) {
      const lower = String(layout.type).toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    }
    return "";
  };

  const formatCapacity = (layout) => {
  if (!layout) return '';

  const capacityMin =
    layout.capacityMin != null ? layout.capacityMin : layout.min;
  const capacityMax =
    layout.capacityMax != null ? layout.capacityMax : layout.max;

  if (capacityMin != null && capacityMax != null) {
    return `${capacityMin}–${capacityMax}`;
  }
  if (capacityMax != null) {
    return `Up to ${capacityMax}`;
  }
  if (capacityMin != null) {
    return `${capacityMin}+`;
  }
  return '';
};


  const formatPriceRule = (priceRule) => {
    if (!priceRule) return "—";
    const upper = String(priceRule).toUpperCase();
    if (upper === "HIGHER") return "Higher of per-person / per-room";
    if (upper === "LOWER") return "Lower of per-person / per-room";
    return priceRule;
  };

  const getAddOnName = (id) => {
    const addOn = addOnsById[id];
    if (!addOn) return id;
    return addOn.name || addOn.label || id;
  };

  // ─────────────────────────────────────
  // Render helpers
  // ─────────────────────────────────────

  const renderImageGrid = (room) => {
    const images = Array.isArray(room.images) ? room.images : [];
    const slots = 6;

    return (
      <div className="room-images-grid">
        {Array.from({ length: slots }).map((_, index) => {
          const url = images[index];
          if (url) {
            return (
              <div className="room-image-wrapper" key={index}>
                <img
                  src={url}
                  alt={`${room.name || room.code || "Room"} image ${
                    index + 1
                  }`}
                />
              </div>
            );
          }
          return (
            <div className="room-image-placeholder" key={index}>
              <span>Placeholder</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderFeatures = (room) => {
    const features = Array.isArray(room.features) ? room.features : [];
    if (!features.length) return null;

    return (
      <div className="room-section">
        <div className="section-title">Features</div>
        <div>
          {features.map((feature, index) => (
            <span key={`${feature}-${index}`} className="badge feature-badge">
              {feature}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderLayouts = (room) => {
    const layouts = Array.isArray(room.layouts) ? room.layouts : [];
    if (!layouts.length) {
      return (
        <div className="room-section">
          <div className="section-title">Layouts</div>
          <div className="muted-text">No layouts configured.</div>
        </div>
      );
    }

    return (
      <div className="room-section">
        <div className="section-title">Layouts</div>
        {layouts.map((layout, index) => (
          <div key={index} className="layout-item">
            <div className="layout-name">
              {formatLayoutName(layout) || "Unnamed layout"}
            </div>
            {formatCapacity(layout) && (
              <div className="layout-capacity">
                Capacity: {formatCapacity(layout)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

 const renderPricing = (room) => {
  // Room Setup stores pricing as room.pricing { perPerson, perRoom, rule }
  const pricing = room.pricing || {};
  const perPerson = pricing.perPerson ?? null;
  const perRoom = pricing.perRoom ?? null;
  const rule = pricing.rule || null;

  return (
    <div className="room-section">
      <div className="section-title">Pricing Preview</div>
      <div className="pricing-row">
        <span className="pricing-label">Per-person rate:</span>{' '}
        {perPerson != null && perPerson !== '' ? perPerson : '—'}
      </div>
      <div className="pricing-row">
        <span className="pricing-label">Per-room / event rate:</span>{' '}
        {perRoom != null && perRoom !== '' ? perRoom : '—'}
      </div>
      <div className="pricing-row">
        <span className="pricing-label">Pricing rule:</span>{' '}
        {rule ? formatPriceRule(rule) : '—'}
      </div>
    </div>
  );
};

const renderAddOns = (room) => {
  const includedIds = Array.isArray(room.includedAddOns)
    ? room.includedAddOns
    : Array.isArray(room.includedAddOnIds)
    ? room.includedAddOnIds
    : [];

  const optionalIds = Array.isArray(room.optionalAddOns)
    ? room.optionalAddOns
    : Array.isArray(room.optionalAddOnIds)
    ? room.optionalAddOnIds
    : [];

  const hasAny = includedIds.length > 0 || optionalIds.length > 0;
  if (!hasAny) {
    return null;
  }

  return (
    <div className="room-section">
      <div className="section-title">Add-ons</div>
      {includedIds.length > 0 && (
        <div className="add-on-group">
          <div className="add-on-label">Included</div>
          <div>
            {includedIds.map((id) => (
              <span key={id} className="badge add-on-badge add-on-badge-included">
                {getAddOnName(id)}
              </span>
            ))}
          </div>
        </div>
      )}
      {optionalIds.length > 0 && (
        <div className="add-on-group">
          <div className="add-on-label">Optional</div>
          <div>
            {optionalIds.map((id) => (
              <span key={id} className="badge add-on-badge add-on-badge-optional">
                {getAddOnName(id)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


  const renderBuffers = (room) => {
    // Support both new and any legacy field names, just in case.
    const before =
      room.bufferBeforeMinutes ??
      room.bufferBefore ??
      0;
    const after =
      room.bufferAfterMinutes ??
      room.bufferAfter ??
      0;

    return (
      <div className="room-section">
        <div className="section-title">Buffers</div>
        <div className="buffer-row">
          <span>
            <span className="pricing-label">Buffer before:</span> {before} min
          </span>
          <span>
            <span className="pricing-label">Buffer after:</span> {after} min
          </span>
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────
  // Render main page
  // ─────────────────────────────────────

  return (
    <div className="room-overview-page">
      {/* Local styles – keep everything self-contained */}
      <style>{`
        .room-overview-page {
          padding: 24px;
        }
        .room-overview-header {
          margin-bottom: 16px;
        }
        .room-overview-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0 0 4px 0;
        }
        .helper-text {
          font-size: 0.9rem;
          color: #64748b;
          max-width: 720px;
        }
        .feedback {
          font-size: 0.9rem;
          color: #64748b;
          margin-top: 8px;
        }
        .feedback-error {
          color: #b91c1c;
        }
        .room-overview-grid {
          display: grid;
          grid-template-columns: repeat(1, minmax(0, 1fr));
          gap: 24px;
          margin-top: 16px;
        }
        @media (min-width: 768px) {
          .room-overview-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (min-width: 1024px) {
          .room-overview-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        .room-card {
          background-color: #ffffff;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .room-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
        }
        .room-card-title {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .room-name {
          font-size: 1.05rem;
          font-weight: 600;
          margin: 0;
        }
        .room-code {
          font-size: 0.8rem;
          color: #64748b;
        }
        .status-badge {
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 500;
          white-space: nowrap;
        }
        .status-active {
          background-color: #dcfce7;
          color: #166534;
        }
        .status-inactive {
          background-color: #fee2e2;
          color: #991b1b;
        }
        .room-description {
          font-size: 0.9rem;
          color: #475569;
          margin-top: 4px;
        }
        .section-title {
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #94a3b8;
          margin-bottom: 4px;
        }
        .room-section {
          margin-top: 8px;
        }
        .room-images-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 6px;
        }
        .room-image-wrapper,
        .room-image-placeholder {
          position: relative;
          padding-top: 66.6667%;
          border-radius: 8px;
          overflow: hidden;
        }
        .room-image-wrapper {
          background-color: #0f172a;
        }
        .room-image-wrapper img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .room-image-placeholder {
          background-color: #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          color: #64748b;
          border: 1px dashed #cbd5f5;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 0.75rem;
          margin: 2px 6px 2px 0;
          background-color: #e2e8f0;
          color: #334155;
        }
        .feature-badge {
          background-color: #eff6ff;
          color: #1d4ed8;
        }
        .layout-item {
          font-size: 0.85rem;
          color: #475569;
          margin-top: 2px;
        }
        .layout-name {
          font-weight: 500;
        }
        .layout-capacity {
          font-size: 0.8rem;
          color: #64748b;
        }
        .pricing-row {
          font-size: 0.85rem;
          color: #475569;
          margin-top: 2px;
        }
        .pricing-label {
          font-weight: 500;
        }
        .buffer-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 8px;
          font-size: 0.85rem;
          color: #475569;
        }
        .add-on-group {
          margin-bottom: 4px;
        }
        .add-on-label {
          font-size: 0.8rem;
          font-weight: 500;
          color: #64748b;
          margin-bottom: 2px;
        }
        .add-on-badge-included {
          background-color: #dcfce7;
          color: #166534;
        }
        .add-on-badge-optional {
          background-color: #dbeafe;
          color: #1e3a8a;
        }
        .muted-text {
          font-size: 0.8rem;
          color: #94a3b8;
        }
        .empty-state {
          font-size: 0.9rem;
          color: #64748b;
          margin-top: 16px;
        }
      `}</style>

      <div className="room-overview-header">
        <h1 className="room-overview-title">Room Overview</h1>
        <p className="helper-text">
          Read-only visual summary of all rooms. Use this view to compare rooms
          at a glance and preview what bookers will eventually see. No changes
          can be made from this page.
        </p>
      </div>

      {loading && <div className="feedback">Loading room configuration…</div>}

      {!loading && error && (
        <div className="feedback feedback-error">{error}</div>
      )}

      {!loading && !error && rooms.length === 0 && (
        <div className="empty-state">No rooms configured yet.</div>
      )}

      {!loading && !error && rooms.length > 0 && (
        <div className="room-overview-grid">
          {rooms.map((room) => {
            const key = room.id || room.code || room.name || Math.random();

            return (
              <div className="room-card" key={key}>
                {/* BASIC INFO */}
                <div className="room-card-header">
                  <div className="room-card-title">
                    <div className="room-name">
                      {room.name || "Untitled room"}
                    </div>
                    {room.code && (
                      <div className="room-code">Code: {room.code}</div>
                    )}
                  </div>
                  <span
                    className={
                      "status-badge " +
                      (room.active ? "status-active" : "status-inactive")
                    }
                  >
                    {room.active ? "Active" : "Inactive"}
                  </span>
                </div>

                {room.description && (
                  <div className="room-description">
                    {truncateText(room.description)}
                  </div>
                )}

                {/* IMAGES */}
                <div className="room-section">
                  <div className="section-title">Images</div>
                  {renderImageGrid(room)}
                </div>

                {/* FEATURES */}
                {renderFeatures(room)}

                {/* LAYOUTS */}
                {renderLayouts(room)}

                {/* PRICING */}
                {renderPricing(room)}

                {/* ADD-ONS */}
                {renderAddOns(room)}

                {/* BUFFERS */}
                {renderBuffers(room)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RoomOverviewPage;
