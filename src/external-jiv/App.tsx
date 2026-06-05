import { useState } from "react";
import MicButton from "./components/MicButton";
import ChatArea from "./components/ChatArea";
import ActionPanel from "./components/ActionPanel";

export default function App() {
  const [isListening, setIsListening] = useState(false);
  const [showActions, setShowActions] = useState(true);
  const [discreet, setDiscreet] = useState(false);

  if (discreet) {
    return (
      <div
        onClick={() => setDiscreet(false)}
        style={{
          minHeight: "100vh",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontFamily: "sans-serif",
        }}
      >
        <p style={{ color: "#999", fontSize: 14 }}>Tap to return</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#080c14",
        fontFamily: "'Inter', system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 60% 40% at 50% 100%, rgba(34,211,238,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 20px 12px",
          flexShrink: 0,
          position: "relative",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#22d3ee",
              boxShadow: "0 0 8px #22d3ee, 0 0 20px rgba(34,211,238,0.4)",
              animation: "pulse-dot 2s ease-in-out infinite",
            }}
          />
          <span style={{ color: "#22d3ee", fontSize: 15, fontWeight: 700, letterSpacing: "0.04em" }}>
            JIV AI
          </span>
          <span style={{ color: "#3d5a6a", fontSize: 12, fontWeight: 500 }}>
            Emergency Assistant
          </span>
        </div>

        <button
          onClick={() => setDiscreet(true)}
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#556070",
            borderRadius: 8,
            padding: "5px 12px",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            letterSpacing: "0.04em",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
            e.currentTarget.style.color = "#8a9ab0";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
            e.currentTarget.style.color = "#556070";
          }}
        >
          QUICK EXIT
        </button>
      </header>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "0 16px 12px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <ChatArea />
      </div>

      {showActions && (
        <div
          style={{
            flexShrink: 0,
            padding: "0 16px 12px",
            position: "relative",
            zIndex: 10,
          }}
        >
          <ActionPanel />
        </div>
      )}

      <div
        style={{
          flexShrink: 0,
          padding: "8px 16px 24px",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          position: "relative",
          zIndex: 10,
        }}
      >
        <MicButton isListening={isListening} onToggle={() => setIsListening((v) => !v)} />

        <div style={{ width: "100%", maxWidth: 480, display: "flex", gap: 8 }}>
          <input
            placeholder="Or type here..."
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: "10px 14px",
              color: "#c8d8e8",
              fontSize: 14,
              outline: "none",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "rgba(34,211,238,0.35)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
            }}
          />
          <button
            style={{
              background: "rgba(34,211,238,0.15)",
              border: "1px solid rgba(34,211,238,0.3)",
              borderRadius: 12,
              padding: "10px 18px",
              color: "#22d3ee",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(34,211,238,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(34,211,238,0.15)";
            }}
          >
            Send
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
}
