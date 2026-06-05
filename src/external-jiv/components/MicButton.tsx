interface MicButtonProps {
  isListening: boolean;
  onToggle: () => void;
}

export default function MicButton({ isListening, onToggle }: MicButtonProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {isListening && [1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 88 + i * 28,
              height: 88 + i * 28,
              borderRadius: "50%",
              border: `1px solid rgba(34,211,238,${0.3 / i})`,
              animation: `mic-ring 1.8s ease-out ${i * 0.3}s infinite`,
              pointerEvents: "none",
            }}
          />
        ))}

        <button
          onClick={onToggle}
          style={{
            width: 88,
            height: 88,
            borderRadius: "50%",
            border: `2px solid ${isListening ? "#22d3ee" : "rgba(34,211,238,0.3)"}`,
            background: isListening
              ? "radial-gradient(circle, rgba(34,211,238,0.25) 0%, rgba(34,211,238,0.08) 100%)"
              : "radial-gradient(circle, rgba(34,211,238,0.08) 0%, rgba(34,211,238,0.03) 100%)",
            boxShadow: isListening
              ? "0 0 30px rgba(34,211,238,0.5), 0 0 60px rgba(34,211,238,0.25), inset 0 0 20px rgba(34,211,238,0.1)"
              : "0 0 12px rgba(34,211,238,0.15), inset 0 0 10px rgba(34,211,238,0.04)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s ease",
            animation: isListening ? "mic-breathe 1.5s ease-in-out infinite" : undefined,
            position: "relative",
            zIndex: 1,
          }}
          aria-label={isListening ? "Stop listening" : "Start listening"}
        >
          {isListening ? (
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              {[14, 22, 32, 22, 14].map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: 3,
                    height: h,
                    borderRadius: 2,
                    background: "#22d3ee",
                    boxShadow: "0 0 6px rgba(34,211,238,0.8)",
                    animation: `wave-bar 0.6s ease-in-out ${i * 0.1}s infinite alternate`,
                  }}
                />
              ))}
            </div>
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="2" width="6" height="11" rx="3" />
              <path d="M5 10a7 7 0 0 0 14 0" />
              <line x1="12" y1="19" x2="12" y2="22" />
              <line x1="8" y1="22" x2="16" y2="22" />
            </svg>
          )}
        </button>
      </div>

      <p
        style={{
          color: isListening ? "#22d3ee" : "#4a6a7a",
          fontSize: 14,
          fontWeight: 500,
          textAlign: "center",
          transition: "color 0.3s",
          textShadow: isListening ? "0 0 10px rgba(34,211,238,0.4)" : undefined,
          margin: 0,
        }}
      >
        {isListening ? "Listening… speak now" : "Tap and speak. I'm here to help."}
      </p>

      <style>{`
        @keyframes mic-ring {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes mic-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
        @keyframes wave-bar {
          from { transform: scaleY(0.5); }
          to { transform: scaleY(1.3); }
        }
      `}</style>
    </div>
  );
}
