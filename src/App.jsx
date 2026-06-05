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
  
  // New States
  const [coords, setCoords] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isMetronomeActive, setIsMetronomeActive] = useState(false);

  const recognitionRef = useRef(null);
  const shouldListenRef = useRef(false);
  const messagesEndRef = useRef(null);
  
  // Metronome Refs
  const audioCtxRef = useRef(null);
  const metronomeIntervalRef = useRef(null);

  // Fetch coordinates on startup
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          console.error("Error fetching location:", error);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  // Auto-scroll chat area to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Clean up Audio and TTS on unmount
  useEffect(() => {
    return () => {
      if (metronomeIntervalRef.current) clearInterval(metronomeIntervalRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Speech Synthesis Helper
  const speakText = (text) => {
    if (isMuted || !window.speechSynthesis) return;
    
    // Stop any current reading
    window.speechSynthesis.cancel();
    
    const cleanText = text.replace(/[🚨💓🔍📋]/g, ""); // Strip UI emojis for cleaner voice output
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  // Metronome logic (110 BPM)
  const startMetronome = () => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      alert("Web Audio API is not supported in this browser.");
      return;
    }

    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    let nextBeatTime = ctx.currentTime;
    const scheduler = () => {
      // Schedule beeps 100ms in advance
      while (nextBeatTime < ctx.currentTime + 0.1) {
        playBeep(ctx, nextBeatTime);
        nextBeatTime += 60 / 110; // 110 BPM = ~0.545s intervals
      }
    };

    const interval = setInterval(scheduler, 25);
    metronomeIntervalRef.current = interval;
    setIsMetronomeActive(true);
    
    // Add info message to chat
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "ai",
        text: "💓 CPR Rhythm Guide started (110 compressions per minute). Match your chest compressions to the audio clicks and pulsing icon.",
      }
    ]);
    speakText("CPR rhythm guide started. Compressing now.");
  };

  const stopMetronome = () => {
    if (metronomeIntervalRef.current) {
      clearInterval(metronomeIntervalRef.current);
      metronomeIntervalRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    setIsMetronomeActive(false);
  };

  const playBeep = (ctx, time) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(800, time); // Clear 800Hz tone
    gainNode.gain.setValueAtTime(0.3, time);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.08); // Fast decay for a click/beep sound
    
    osc.start(time);
    osc.stop(time + 0.1);
  };

  const toggleMetronome = () => {
    if (isMetronomeActive) {
      stopMetronome();
    } else {
      startMetronome();
    }
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Speech Recognition API not supported in this browser.");
      alert("Speech Recognition API is not supported in this browser. Please try Chrome, Safari, or Edge.");
      return;
    }

    // Stop speaking so the mic doesn't pick up the speech synthesis
    window.speechSynthesis?.cancel();

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

    // If speech was running, stop it momentarily
    const wasListening = isListening;
    if (wasListening) {
      stopSpeechRecognition();
    }

    // Trigger mock AI response
    setTimeout(() => {
      let replyText = "Understood. Please stay calm. Can you tell me if the person is awake and breathing normally? If not, check their pulse immediately.";
      const textLower = trimmed.toLowerCase();
      
      if (textLower.includes("collapse") || textLower.includes("faint") || textLower.includes("pass out")) {
        replyText = "Lay them flat on their back. Elevate their legs slightly if possible. Check if they are breathing. If they are unresponsive and not breathing, begin CPR (30 compressions, then 2 rescue breaths). Check the CPR Coach button below for timing help.";
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

      // Speak reply aloud
      speakText(replyText);

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

  const copyCoordinates = () => {
    if (!coords) return;
    const locString = `Latitude: ${coords.latitude}, Longitude: ${coords.longitude}`;
    navigator.clipboard.writeText(locString)
      .then(() => alert("Coordinates copied to clipboard!"))
      .catch((err) => console.error("Could not copy text: ", err));
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
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
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
          
          {coords ? (
            <button 
              onClick={copyCoordinates}
              title="Click to copy coordinates"
              style={{
                background: "rgba(34,211,238,0.08)",
                border: "1px solid rgba(34,211,238,0.2)",
                borderRadius: 6,
                padding: "2px 8px",
                color: "#22d3ee",
                fontSize: 10,
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                width: "fit-content",
                marginTop: 4
              }}
            >
              📍 GPS: {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)} (Copy)
            </button>
          ) : (
            <span style={{ color: "#3d5a6a", fontSize: 10, marginTop: 4 }}>
              📍 Locating GPS...
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Mute/Unmute TTS Trigger */}
          <button
            onClick={() => {
              setIsMuted((prev) => {
                const next = !prev;
                if (next) window.speechSynthesis?.cancel(); // stop reading immediately if muted
                return next;
              });
            }}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: isMuted ? "#ef4444" : "#22d3ee",
              borderRadius: 8,
              padding: "6px 10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            title={isMuted ? "Unmute Voice" : "Mute Voice"}
          >
            {isMuted ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="1" y1="1" x2="23" y2="23" />
                <path d="M9 9v6a3 3 0 0 0 3 3h1.586l4.707 4.707A1 1 0 0 0 20 22V4a1 1 0 0 0-1.707-.707L13.586 8H12a3 3 0 0 0-3 3z" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            )}
          </button>

          <button
            onClick={() => setDiscreet(true)}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#556070",
              borderRadius: 8,
              padding: "7px 12px",
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
        </div>
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
          <ActionPanel 
            isMetronomeActive={isMetronomeActive} 
            onToggleMetronome={toggleMetronome} 
          />
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
