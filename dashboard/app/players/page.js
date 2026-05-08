/* eslint-disable react-hooks/immutability */
"use client";

import { useEffect, useState } from "react";
import api from "../lib/api";

export default function PlayersPage() {

  const [players, setPlayers] = useState([]);

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {

    try {

      const res = await api.get("/players");

      setPlayers(res.data);

    } catch (err) {

      console.error(err);
    }
  };

  return (

    <div style={{ padding: 20 }}>

      <h1>👤 Players</h1>

      {players.map((p, i) => (

        <div
          key={i}
          style={{
            border: "1px solid gray",
            padding: 10,
            marginBottom: 10,
            borderRadius: 8
          }}
        >

          <h3>{p.name}</h3>

          <p>Club: {p.club}</p>

          <p>Position: {p.position}</p>

          <p>Rating: {p.rating}</p>

        </div>
      ))}

    </div>
  );
}