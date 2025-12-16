import React from "react";

export default function Section({ title, description, right, children, style }) {
  return (
    <section style={{ marginTop: 18, ...style }}>
      {title || description || right ? (
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 10,
            flexWrap: "wrap",
          }}
        >
          <div style={{ minWidth: 240 }}>
            {title ? (
              <h2
                style={{
                  margin: 0,
                  fontSize: 16,
                  lineHeight: "20px",
                  fontWeight: 750,
                  color: "rgba(17, 24, 39, 0.95)",
                }}
              >
                {title}
              </h2>
            ) : null}
            {description ? (
              <div
                style={{
                  marginTop: 6,
                  fontSize: 13,
                  lineHeight: "18px",
                  color: "rgba(17, 24, 39, 0.65)",
                }}
              >
                {description}
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

