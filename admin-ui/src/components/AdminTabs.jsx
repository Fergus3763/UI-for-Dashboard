// AdminTabs.jsx — minimal, dependency-free tabs for the Admin UI.
// Usage:
// <AdminTabs
//   tabs={[{ key:'venue', label:'Venue', content:<VenueContent/> }, ...]}
//   activeKey={activeTab}
//   onChange={setActiveTab}
// />

import React from "react";

export default function AdminTabs({ tabs = [], activeKey, onChange }) {
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #ddd",
              background: activeKey === t.key ? "#eef4ff" : "#fff",
              cursor: "pointer",
              fontWeight: activeKey === t.key ? 600 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div>
        {(tabs.find(t => t.key === activeKey) || {}).content}
      </div>
    </div>
  );
}
