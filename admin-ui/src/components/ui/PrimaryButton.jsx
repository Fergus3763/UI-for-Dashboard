import React from "react";

export default function PrimaryButton({ children, style, ...props }) {
  return (
    <button
      {...props}
      style={{
        appearance: "none",
        borderRadius: 10,
        padding: "10px 12px",
        border: "1px solid rgba(17, 24, 39, 0.12)",
        background: "rgba(17, 24, 39, 0.92)",
        color: "#fff",
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

