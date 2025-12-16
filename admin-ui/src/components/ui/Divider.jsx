import React from "react";

export default function Divider({ style }) {
  return (
    <hr
      style={{
        border: 0,
        height: 1,
        background: "rgba(17, 24, 39, 0.08)",
        margin: "12px 0",
        ...style,
      }}
    />
  );
}

