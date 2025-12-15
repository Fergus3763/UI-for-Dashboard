import React from "react";

/**
 * Badge — presentational only
 * Semantic tones only (no logic)
 */

export default function Badge({ tone = "neutral", children, style }) {
  const tones = {
    included: {
      bg: "rgba(16, 185, 129, 0.10)",
      fg: "rgba(5, 122, 85, 1)",
      bd: "rgba(16, 185, 129, 0.22)",
    },
    optional: {
      bg: "rgba(59, 130, 246, 0.10)",
      fg: "rgba(29, 78, 216, 1)",
      bd: "rgba(59, 130, 246, 0.22)",
    },
    neutral: {
      bg: "rgba(17, 24, 39, 0.06)",
      fg: "rgba(17, 24, 39, 0.70)",
      bd: "rgba(17, 24, 39, 0.14)",
    },
    error: {
      bg: "rgba(239, 68, 68, 0.10)",
      fg: "rgba(185, 28, 28, 1)",
      bd: "rgba(239, 68, 68, 0.22)",
    },
  };

  const t = tones[tone] || tones.neutral;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 8px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        lineHeight: "16px",
        whiteSpace: "nowrap",
        background: t.bg,
        color: t.fg,
        border: `1px solid ${t.bd}`,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

