"use client";

import api from "./lib/api";

export default function Home() {

  const playSeason = async () => {
    await api.post("/play-season");
    alert("Season played ⚽");
  };

  const simulate = async () => {
    await api.post("/simulate");
    alert("Matches simulated ⚽");
  };

  const reset = async () => {
    await api.post("/reset-season");
    alert("Season reset 🔄");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>⚽ Football Manager</h1>

      <button onClick={playSeason}>▶ Play Season</button>
      <button onClick={simulate}>⚽ Simulate</button>
      <button onClick={reset}>🔄 Reset</button>
    </div>
  );
}