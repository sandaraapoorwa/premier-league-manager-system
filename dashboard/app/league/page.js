"use client";

import api from "./lib/api";

export default function Home() {

  const playSeason = async () => {

    try {

      console.log("Sending request...");

      const res = await api.post("/play-season");

      console.log("SUCCESS:", res.data);

      alert("Season played ⚽");

    } catch (err) {

      console.error("FULL ERROR:", err);

      if (err.response) {
        console.log("Response:", err.response.data);
      }

      alert("Request failed");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>⚽ Football Manager</h1>

      <button onClick={playSeason}>
        ▶ Play Season
      </button>
    </div>
  );
}