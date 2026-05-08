/* eslint-disable react-hooks/immutability */
"use client";

import { useEffect, useState } from "react";
import api from "./lib/api";
import logos from "./lib/logos";

export default function Home() {

  const [table, setTable] = useState([]);

  useEffect(() => {
    loadLeague();
  }, []);

  const loadLeague = async () => {

    try {

      const res = await api.get("/league");

      setTable(res.data);

    } catch (err) {

      console.error(err);
    }
  };

  const playSeason = async () => {

    try {

      await api.post("/play-season");

      await loadLeague();

      alert("Season played ⚽");

    } catch (err) {

      console.error(err);
    }
  };

  const simulate = async () => {

    try {

      await api.post("/simulate");

      await loadLeague();

      alert("Matches simulated ⚽");

    } catch (err) {

      console.error(err);
    }
  };

  const reset = async () => {

    try {

      await api.post("/reset-season");

      await loadLeague();

      alert("Season reset 🔄");

    } catch (err) {

      console.error(err);
    }
  };

  return (

    <div className="p-6">

      <h1 className="text-4xl font-bold mb-6">
        ⚽ Football Manager
      </h1>

      <div className="flex gap-4 mb-6">

        <button
          className="glass px-6 py-3 hover:scale-105 transition"
          onClick={playSeason}
        >
          ▶ Play Season
        </button>

        <button
          className="glass px-6 py-3 hover:scale-105 transition"
          onClick={simulate}
        >
          ⚽ Simulate
        </button>

        <button
          className="glass px-6 py-3 hover:scale-105 transition"
          onClick={reset}
        >
          🔄 Reset
        </button>

      </div>

      <div className="glass p-6">

        <h2 className="text-2xl font-semibold mb-4">
          🏆 League Table
        </h2>

        <table className="w-full">

          <thead>

            <tr className="text-left border-b border-gray-600">

              <th className="p-3">Team</th>
              <th>P</th>
              <th>W</th>
              <th>D</th>
              <th>L</th>
              <th>GF</th>
              <th>GA</th>
              <th>Pts</th>

            </tr>

          </thead>

          <tbody>

            {table.map((t, i) => (

              <tr
                key={i}
                className="border-b border-gray-800 hover:bg-white/5 transition"
              >

                <td className="flex items-center gap-3 p-3">

                  <img
                    src={logos[t.team]}
                    width="30"
                    height="30"
                    alt={t.team}
                  />

                  {t.team}

                </td>

                <td>{t.played}</td>
                <td>{t.wins}</td>
                <td>{t.draws}</td>
                <td>{t.losses}</td>
                <td>{t.goalsFor}</td>
                <td>{t.goalsAgainst}</td>
                <td className="font-bold">{t.points}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}