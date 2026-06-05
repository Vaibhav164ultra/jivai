import { useState, useRef, useEffect } from "react";
import MicButton from "./components/MicButton";
import ChatArea from "./components/ChatArea";
import ActionPanel from "./components/ActionPanel";

const INITIAL_MESSAGES = [
  {
    id: "1",
    role: "ai",
    text: "I'm Jiv AI — your emergency guide. Tap the mic or type what's happening. I'll help you right now.",
  }
];

export default function App() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [interimText, setInterimText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [showActions, setShowActions] = useState(true);
  const [discreet, setDiscreet] = useState(false);

  const recognitionRef = useRef(null);
  const shouldListenRef = useRef(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll chat area to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startSpeechRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Speech Recognition API not supported in this browser.");
      alert("Speech Recognition API is not supported in this browser. Please try Chrome, Safari, or Edge.");
      return;
    }

    shouldListenRef.current = true;
    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Forces faster finalization on natural pauses
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalSpeech = "";
      let interimSpeech = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalSpeech += text + " ";
          console.log("Transcript segment:", text);
        } else {
          interimSpeech += text;
        }
      }

      if (finalSpeech) {
        setInputValue((prev) => prev + finalSpeech);
        setInterimText("");
      } else {
        setInterimText(interimSpeech);
      }
    };

    recognition.onerror = (event) => {
      if (event.error !== "no-speech") {
        console.error("Recognition error:", event.error);
      }
    };

    recognition.onend = () => {
      if (shouldListenRef.current) {
        try {
          recognition.start();
        } catch (error) {
          console.error("Failed to restart speech recognition:", error);
        }
      } else {
        setIsListening(false);
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  const stopSpeechRecognition = () => {
    shouldListenRef.current = false;
    recognitionRef.current?.stop();
    setIsListening(false);
    
    // Commit any remaining interim text to the input value
    if (interimText) {
      setInputValue((prev) => prev + interimText + " ");
      setInterimText("");
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition();
    }
  };

  const handleSendMessage = (textToSend = inputValue) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    // Add user message
    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      text: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setInterimText("");

    // If speech was running, stop it momentarily so it doesn't pick up the environment/keyboard sounds
    const wasListening = isListening;
    if (wasListening) {
      stopSpeechRecognition();
    }

    // Trigger mock AI response
    setTimeout(() => {
      let replyText = "Understood. Please stay calm. Can you tell me if the person is awake and breathing normally? If not, check their pulse immediately.";
      const textLower = trimmed.toLowerCase();
      
      if (textLower.includes("collapse") || textLower.includes("faint") || textLower.includes("pass out")) {
        replyText = "Lay them flat on their back. Elevate their legs slightly if possible. Check if they are breathing. If they are unresponsive and not breathing, begin CPR (30 compressions, then 2 breaths).";
      } else if (textLower.includes("heart") || textLower.includes("chest pain") || textLower.includes("stroke")) {
        replyText = "Have them sit down in a comfortable position, loosen tight clothing, and call emergency services immediately. Keep them warm and calm.";
      } else if (textLower.includes("cpr") || textLower.includes("breath")) {
        replyText = "Place your hands in the center of the chest. Push hard and fast at a rate of 100-120 compressions per minute. Deliver 2 rescue breaths after every 30 compressions.";
      } else if (textLower.includes("bleed") || textLower.includes("blood") || textLower.includes("cut")) {
        replyText = "Apply firm, direct pressure to the wound with a clean cloth. Elevate the injured area above the heart if possible. Do not remove the cloth if it gets soaked.";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          text: replyText,
        },
      ]);

      // Resume listening if it was active before sending
      if (wasListening) {
        startSpeechRecognition();
      }
    }, 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

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
        <ChatArea messages={messages} />
        <div ref={messagesEndRef} />
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
        <MicButton isListening={isListening} onToggle={toggleListening} />

        <div style={{ width: "100%", maxWidth: 480, display: "flex", gap: 8 }}>
          <input
            value={inputValue + (interimText ? interimText : "")}
            onChange={(e) => {
              setInputValue(e.target.value);
              setInterimText("");
            }}
            onKeyDown={handleKeyDown}
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
            onClick={() => handleSendMessage()}
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
