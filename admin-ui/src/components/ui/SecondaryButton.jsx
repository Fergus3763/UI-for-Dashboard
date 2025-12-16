import React from "react";

export default function SecondaryButton({ children, style, ...props }) {
  return (
    <button
      {...props}
      style={{
        appearance: "none",
        borderRadius: 10,
        padding: "10px 12px",
        border: "1px solid rgba(17, 24, 39, 0.14)",
        background: "rgba(17, 24, 39, 0.04)",
        color: "rgba(17, 24, 39, 0.88)",
        fontWeight: 750,
        fontSize: 13,
        lineHeight: "16px",
        cursor: "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

