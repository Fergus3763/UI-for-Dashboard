import React, { useState } from "react";

export default function AdminLandingPage() {
  // UI-only: collapsible explainer (collapsed by default; never disappears)
  const [explainerExpanded, setExplainerExpanded] = useState(false);

  return (
    <div style={{ padding: 18, maxWidth: 1000 }}>
      {/* Explainer container pattern (matches existing pages) */}
      <div
        style={{
          marginBottom: "1rem",
          borderRadius: 14,
          border: "1px dashed rgba(59, 130, 246, 0.22)",
          background: "rgba(59, 130, 246, 0.06)",
          borderLeft: "6px solid rgba(59, 130, 246, 0.55)",
          padding: 14,
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
                fontSize: 17,
                lineHeight: "20px",
                fontWeight: 880,
                color: "rgba(30, 64, 175, 0.95)",
                fontStyle: "italic",
              }}
            >
              What this area is for
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 12,
                lineHeight: "16px",
                color: "rgba(17, 24, 39, 0.68)",
              }}
            >
              A short, self-guided explanation (read-only guidance).
            </div>
          </div>

          <button
            type="button"
            onClick={() => setExplainerExpanded((v) => !v)}
            style={{
              border: "1px solid rgba(59, 130, 246, 0.32)",
              background: "rgba(59, 130, 246, 0.10)",
              color: "rgba(30, 64, 175, 0.95)",
              borderRadius: 12,
              padding: "10px 12px",
              fontWeight: 820,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
            aria-expanded={explainerExpanded}
          >
            {explainerExpanded ? "Collapse ▴" : "Expand ▾"}
          </button>
        </div>

        {explainerExpanded ? (
          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            <div>
              <div style={{ fontWeight: 860, color: "rgba(17, 24, 39, 0.92)" }}>
                What this dashboard controls
              </div>
              <div
                style={{
                  marginTop: 6,
                  color: "rgba(17, 24, 39, 0.70)",
                  lineHeight: "18px",
                }}
              >
                This dashboard is the administrative control area for your
                meeting room booking system.
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 860, color: "rgba(17, 24, 39, 0.92)" }}>
                How the pages relate
              </div>
              <div
                style={{
                  marginTop: 6,
                  color: "rgba(17, 24, 39, 0.70)",
                  lineHeight: "18px",
                }}
              >
                Venue → Rooms → Simulation → Booker Preview.
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 860, color: "rgba(17, 24, 39, 0.92)" }}>
                What will appear here later
              </div>
              <div
                style={{
                  marginTop: 6,
                  color: "rgba(17, 24, 39, 0.70)",
                  lineHeight: "18px",
                }}
              >
                Additional admin features will expand here over time, as booking
                and RFQ workflows go live.
              </div>
            </div>

            <div style={{ marginTop: 2, fontSize: 12, lineHeight: "16px", color: "rgba(17, 24, 39, 0.62)" }}>
              Tip: Start with Venue Setup and Room Setup using the navigation above.
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

