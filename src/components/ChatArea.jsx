export default function ChatArea({ messages }) {
  return (
    <div style={{ maxWidth: 520, margin: "0 auto", paddingTop: 8, paddingBottom: 4 }}>
      {messages.map((msg) => (
        <div
          key={msg.id}
          style={{
            display: "flex",
            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            marginBottom: 10,
          }}
        >
          {msg.role === "ai" && (
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "1.5px solid #22d3ee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginRight: 8,
                marginTop: 2,
                background: "rgba(34,211,238,0.08)",
                boxShadow: "0 0 8px rgba(34,211,238,0.2)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
              </svg>
            </div>
          )}

          <div
            style={{
              maxWidth: "78%",
              padding: "10px 14px",
              borderRadius:
                msg.role === "user" ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
              background:
                msg.role === "user"
                  ? "rgba(34,211,238,0.12)"
                  : "rgba(255,255,255,0.05)",
              border:
                msg.role === "user"
                  ? "1px solid rgba(34,211,238,0.25)"
                  : "1px solid rgba(255,255,255,0.07)",
              color: msg.role === "user" ? "#c8f0f8" : "#d4e4ee",
              fontSize: 15,
              lineHeight: 1.55,
            }}
          >
            {msg.text}
          </div>
        </div>
      ))}
    </div>
  );
}
