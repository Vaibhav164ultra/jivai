# MEMORY.md

- **Web Speech API Component:** Created a minimal toggling Speech Recognition component using Vite + React.
- **Low-Sensitivity Microphone Support:** Configured the component with `interimResults = true` and on-screen rendering so users can verify micro-inputs in real-time even if they have low microphone sensitivity.
- **Latency Optimization:** Switched from `continuous = true` (which has high segment-finalization delay) to `continuous = false` combined with an automatic restart loop on the `onend` event. This forces the Speech Recognition engine to finalize segments and print text much faster.
- **UI Integration:** Integrated emergency assistant UI components (`ChatArea`, `MicButton`, `ActionPanel`) with the optimized speech recognition engine, allowing real-time speech-to-text in the text input box, live interim speech styling, and simulated smart emergency responses.
