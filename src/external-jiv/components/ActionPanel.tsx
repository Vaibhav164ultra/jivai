import { useState } from "react";

const CHECKLIST = [
  { id: "1", label: "Check breathing" },
  { id: "2", label: "Call emergency services" },
  { id: "3", label: "Stay with the person" },
];

export default function ActionPanel() {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          style={{
            flex: 1.4,
            padding: "13px 10px",
            borderRadius: 14,
            border: "none",
            background: "linear-gradient(135deg, #dc2626, #b91c1c)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            boxShadow: "0 0 20px rgba(220,38,38,0.4), 0 4px 12px rgba(0,0,0,0.3)",
            transition: "transform 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.02)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <span style={{ fontSize: 20 }}>🚨</span>
          <span>Call 112</span>
        </button>

        <button
          style={{
            flex: 1,
            padding: "13px 10px",
            borderRadius: 14,
            border: "1.5px solid rgba(34,211,238,0.35)",
            background: "rgba(34,211,238,0.08)",
            color: "#22d3ee",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(34,211,238,0.18)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(34,211,238,0.08)";
          }}
        >
          <span style={{ fontSize: 18 }}>🔍</span>
          <span>Find Help</span>
        </button>

        <button
          style={{
            flex: 1,
            padding: "13px 10px",
            borderRadius: 14,
            border: "1.5px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.04)",
            color: "#8aa0b4",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
            e.currentTarget.style.color = "#c0d0e0";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            e.currentTarget.style.color = "#8aa0b4";
          }}
        >
          <span style={{ fontSize: 18 }}>📋</span>
          <span>Guide</span>
        </button>
      </div>

      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14,
          padding: "10px 14px",
          display: "flex",
          gap: 6,
        }}
      >
        {CHECKLIST.map((item) => (
          <button
            key={item.id}
            onClick={() => toggle(item.id)}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "2px 0",
              textAlign: "left",
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 5,
                border: `1.5px solid ${checked.has(item.id) ? "#22d3ee" : "rgba(255,255,255,0.15)"}`,
                background: checked.has(item.id) ? "rgba(34,211,238,0.2)" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.2s",
              }}
            >
              {checked.has(item.id) && (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="2,6 5,9 10,3" />
                </svg>
              )}
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: checked.has(item.id) ? "#22d3ee" : "#6a8090",
                lineHeight: 1.3,
                textDecoration: checked.has(item.id) ? "line-through" : "none",
                transition: "all 0.2s",
              }}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
