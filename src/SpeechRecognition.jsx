import { useState, useRef } from "react";

export default function SpeechRecognition() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef(null);
  const shouldListenRef = useRef(false);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Speech Recognition API not supported in this browser.");
      return;
    }

    setTranscript("");
    setInterimTranscript("");
    shouldListenRef.current = true;

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Setting to false forces faster finalization of speech segments
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
        setTranscript((prev) => prev + finalSpeech);
        setInterimTranscript("");
      } else {
        setInterimTranscript(interimSpeech);
      }
    };

    recognition.onerror = (event) => {
      // Ignore 'no-speech' error to keep auto-restarting smoothly
      if (event.error !== "no-speech") {
        console.error("Recognition error:", event.error);
      }
    };

    recognition.onend = () => {
      if (shouldListenRef.current) {
        // Automatically restart to keep listening without the delay of continuous=true
        try {
          recognition.start();
        } catch (error) {
          console.error("Failed to restart speech recognition:", error);
        }
      } else {
        setListening(false);
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  };

  const stopListening = () => {
    shouldListenRef.current = false;
    recognitionRef.current?.stop();
    setListening(false);
  };

  return (
    <div>
      <button onClick={listening ? stopListening : startListening}>
        {listening ? "Stop" : "Start"} Listening
      </button>
      <p>{listening ? "Listening... (Speak closer or louder into your mic)" : "Not listening"}</p>
      
      <div style={{ marginTop: "20px", border: "1px solid #ccc", padding: "10px", minHeight: "80px", maxWidth: "400px" }}>
        <strong>Live Transcript:</strong>
        <p style={{ margin: "5px 0 0 0", whiteSpace: "pre-wrap" }}>
          {transcript}
          <span style={{ color: "#888" }}>{interimTranscript}</span>
        </p>
      </div>
    </div>
  );
}


