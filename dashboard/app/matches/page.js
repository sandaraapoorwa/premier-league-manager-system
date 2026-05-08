/* eslint-disable react-hooks/immutability */
"use client";

import { useEffect, useState } from "react";
import api from "../lib/api";

export default function MatchesPage() {

  const [matches, setMatches] = useState([]);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {

    try {

      const res = await api.get("/matches");

      setMatches(res.data);

    } catch (err) {

      console.error(err);
    }
  };

  return (
    <div style={{ padding: 20 }}>

      <h1>⚽ Match Results</h1>

      {matches.map((m) => (

        <div
          key={m.id}
          style={{
            border: "1px solid gray",
            padding: 15,
            marginBottom: 10,
            borderRadius: 8
          }}
        >

          <h3>
            {m.homeTeam} {m.homeGoals} - {m.awayGoals} {m.awayTeam}
          </h3>

        </div>
      ))}

    </div>
  );
}