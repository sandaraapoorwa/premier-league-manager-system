"use client";

import { useEffect, useState } from "react";
import api from "../lib/api";

export default function Calendar() {
  const [matchdays, setMatchdays] = useState([]);
  const [selected,  setSelected]  = useState(null);
  const [fixtures,  setFixtures]  = useState([]);
  const [busy,      setBusy]      = useState(false);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => { loadStatus(); }, []);

  const loadStatus = async () => {
    try {
      const res = await api.get("/matchdays/status");
      setMatchdays(res.data);
    } finally {
      setLoading(false);
    }
  };

  const selectMatchday = async (md) => {
    setSelected(md);
    const res = await api.get(`/matchday/${md}`);
    setFixtures(res.data);
  };

  const simulate = async () => {
    if (!selected) return;
    setBusy(true);
    await api.post(`/matchday/${selected}/simulate`);
    await loadStatus();
    await selectMatchday(selected);
    setBusy(false);
  };

  const statusColor = (s) =>
    s === "completed" ? "#00c870" : s === "partial" ? "#e8a020" : "#1e2e3a";

  const parsedScorers = (match) => {
    try { return JSON.parse(match.goalScorers || "{}"); }
    catch { return {}; }
  };

  return (
    <div style={{
      minHeight: "100vh",
      padding: "32px 28px 56px",
      fontFamily: "'Barlow', sans-serif",
      display: "grid",
      gridTemplateColumns: "280px 1fr",
      gap: 24,
    }}>

      {/* ── Sidebar: matchday list ── */}
      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 18,
        overflow: "hidden",
        height: "fit-content",
      }}>
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 22, letterSpacing: "2px", color: "#eef0f6",
        }}>
          Season Calendar
        </div>

        {loading ? (
          <div style={{ padding: 20, color: "#3d5060", fontSize: 14 }}>Loading…</div>
        ) : (
          matchdays.map(({ matchday, status, played, total }) => (
            <div
              key={matchday}
              onClick={() => selectMatchday(matchday)}
              style={{
                padding: "12px 20px",
                cursor: "pointer",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                background: selected === matchday
                  ? "rgba(255,255,255,0.07)" : "transparent",
                borderLeft: selected === matchday
                  ? "2px solid #4da8ff" : "2px solid transparent",
                display: "flex", justifyContent: "space-between",
                alignItems: "center",
                transition: "background 0.12s",
              }}
            >
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 14, fontWeight: 600, color: "#c8d4e0",
              }}>
                Matchday {matchday}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 700,
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: "0.8px",
                color: statusColor(status),
              }}>
                {status === "completed" ? `${played}/${total} ✓`
                 : status === "partial"  ? `${played}/${total}`
                 : "Pending"}
              </span>
            </div>
          ))
        )}
      </div>

      {/* ── Main: fixtures panel ── */}
      <div>
        {!selected ? (
          <div style={{
            padding: "60px 0", textAlign: "center",
            color: "#1e2e3a", fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 16, letterSpacing: "0.5px",
          }}>
            Select a matchday from the calendar
          </div>
        ) : (
          <>
            {/* Header + simulate button */}
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 20,
            }}>
              <h2 style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 30, letterSpacing: "2px", color: "#eef0f6",
              }}>
                Matchday {selected}
              </h2>
              <button
                onClick={simulate}
                disabled={busy}
                style={{
                  background: busy ? "rgba(0,200,100,0.05)" : "rgba(0,200,100,0.1)",
                  border: "1px solid rgba(0,200,100,0.3)",
                  borderRadius: 10, padding: "10px 22px",
                  color: "#00e87a", cursor: busy ? "not-allowed" : "pointer",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 15, fontWeight: 700, letterSpacing: "0.5px",
                  transition: "all 0.15s",
                }}
              >
                {busy ? "Simulating…" : "▶ Simulate Matchday"}
              </button>
            </div>

            {/* Fixture cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {fixtures.map((m) => {
                const played  = m.homeGoals !== undefined;
                const scorers = parsedScorers(m);
                const homeWin = played && m.homeGoals > m.awayGoals;
                const awayWin = played && m.awayGoals > m.homeGoals;

                return (
                  <div key={m.id} style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 14, padding: "18px 24px",
                    animation: "fm-fadeup 0.3s ease both",
                  }}>

                    {/* Score row */}
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 80px 1fr",
                      alignItems: "center", gap: 12,
                    }}>
                      {/* Home */}
                      <span style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: 17, fontWeight: homeWin ? 700 : 500,
                        color: homeWin ? "#eef0f6" : "#7a8fa0",
                        textAlign: "right",
                      }}>
                        {m.homeTeam}
                      </span>

                      {/* Score / vs */}
                      <div style={{ textAlign: "center" }}>
                        {played ? (
                          <span style={{
                            fontFamily: "'Bebas Neue', sans-serif",
                            fontSize: 26, letterSpacing: "3px",
                            color: "#eef0f6",
                          }}>
                            {m.homeGoals} – {m.awayGoals}
                          </span>
                        ) : (
                          <span style={{
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontSize: 14, color: "#1e2e3a", letterSpacing: "1px",
                          }}>
                            VS
                          </span>
                        )}
                      </div>

                      {/* Away */}
                      <span style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: 17, fontWeight: awayWin ? 700 : 500,
                        color: awayWin ? "#eef0f6" : "#7a8fa0",
                      }}>
                        {m.awayTeam}
                      </span>
                    </div>

                    {/* Scorers row */}
                    {played && (scorers.home?.length > 0 || scorers.away?.length > 0) && (
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 80px 1fr",
                        marginTop: 10, gap: 12,
                      }}>
                        <div style={{ textAlign: "right" }}>
                          {(scorers.home || []).map((s, i) => (
                            <span key={i} style={{
                              display: "inline-block", marginLeft: 8,
                              fontFamily: "'Barlow Condensed', sans-serif",
                              fontSize: 12, color: "#4da8ff",
                            }}>
                              ⚽ {s}
                            </span>
                          ))}
                        </div>
                        <div />
                        <div>
                          {(scorers.away || []).map((s, i) => (
                            <span key={i} style={{
                              display: "inline-block", marginRight: 8,
                              fontFamily: "'Barlow Condensed', sans-serif",
                              fontSize: 12, color: "#4da8ff",
                            }}>
                              ⚽ {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes fm-fadeup {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}