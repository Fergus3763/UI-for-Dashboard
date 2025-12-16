import React from "react";

export default function Card({ title, subtitle, right, children, style }) {
  return (
    <section
      style={{
        border: "1px solid rgba(17, 24, 39, 0.10)",
        borderRadius: 14,
        padding: 14,
        background: "#fff",
        boxShadow: "none",
        ...style,
      }}
    >
      {title || subtitle || right ? (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div style={{ minWidth: 240 }}>
            {title ? (
              <div
                style={{
                  fontWeight: 760,
                  fontSize: 14,
                  lineHeight: "18px",
                  color: "rgba(17, 24, 39, 0.92)",
                }}
              >
                {title}
              </div>
            ) : null}
            {subtitle ? (
              <div
                style={{
                  marginTop: 6,
                  fontSize: 12,
                  lineHeight: "16px",
                  color: "rgba(17, 24, 39, 0.62)",
                }}
              >
                {subtitle}
              </div>
            ) : null}
          </div>
          {right ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {right}
            </div>
          ) : null}
        </div>
      ) : null}

      {children}
    </section>
  );
}

