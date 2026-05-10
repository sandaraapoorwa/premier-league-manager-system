"use client";

import { useEffect, useState } from "react";
import api from "./lib/api";
import logos from "./lib/logos";
import Calendar from "./calender/calender";

export default function Home() {
  const [table,        setTable]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [busy,         setBusy]         = useState(null);
  const [flash,        setFlash]        = useState(null);
  const [error,        setError]        = useState(null);
  const [tab,          setTab]          = useState("league");
  const [currentMD,    setCurrentMD]    = useState(0);
  const [totalMD,      setTotalMD]      = useState(0);
  const [allTeams,     setAllTeams]     = useState([]);

  useEffect(() => {
    loadLeague();
    loadMatchdayStatus();
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const res = await api.get("/teams");
      setAllTeams(res.data);
    } catch {}
  };

  const loadMatchdayStatus = async () => {
    try {
      const res = await api.get("/matchdays/status");
      const data = res.data;
      if (!data.length) return;
      setTotalMD(data.length);
      const lastPlayed = [...data].reverse().find(d => d.status === "completed");
      setCurrentMD(lastPlayed ? lastPlayed.matchday : 0);
    } catch {}
  };

  const loadLeague = async () => {
    try {
      const res = await api.get("/league");
      setTable(res.data);
    } catch {
      setError("Cannot reach backend — is your Scala server running?");
    } finally {
      setLoading(false);
    }
  };

  const act = async (key, endpoint, label) => {
    setBusy(key);
    setError(null);
    if (key === "reset") {
      setTable([]);
      setCurrentMD(0);
    }
    try {
      await api.post(endpoint);
      await loadLeague();
      await loadMatchdayStatus();
      if (key === "reset") await loadTeams();
      setFlash(
        key === "matchday" ? null : `${label} complete`
      );
      if (key !== "matchday") setTimeout(() => setFlash(null), 3000);
    } catch {
      setError(`${label} failed — check your backend.`);
    } finally {
      setBusy(null);
    }
  };

  const simulateNextMatchday = async () => {
    setBusy("matchday");
    setError(null);
    try {
      const next = currentMD + 1;
      await api.post(`/matchday/${next}/simulate`);
      await loadLeague();
      await loadMatchdayStatus();
    } catch {
      setError("Simulate Matchday failed — check your backend.");
    } finally {
      setBusy(null);
    }
  };

  const accentOf = (i) => {
    if (i < 4)  return "#4da8ff";
    if (i < 6)  return "#e8a020";
    if (i > 16) return "#e05050";
    return null;
  };

  const gd = (t) => (t.goalsFor ?? 0) - (t.goalsAgainst ?? 0);
  const isFinished = totalMD > 0 && currentMD >= totalMD;

  const tabStyle = (t) => ({
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 15, fontWeight: 700, letterSpacing: "1px",
    textTransform: "uppercase", padding: "8px 22px", borderRadius: 8,
    border: tab === t ? "1px solid rgba(255,255,255,0.15)" : "1px solid transparent",
    background: tab === t ? "rgba(255,255,255,0.07)" : "transparent",
    color: tab === t ? "#eef0f6" : "#3d5060",
    cursor: "pointer", transition: "all 0.15s",
  });

  // Merge table data with allTeams so every team shows even with 0 stats
  const displayTable = (() => {
    if (table.length > 0) return table;
    return allTeams.map(t => ({
      team: t.name, played: 0, wins: 0, draws: 0,
      losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0,
    }));
  })();

  return (
    <div style={{
      minHeight: "100vh", padding: "32px 28px 56px",
      position: "relative", zIndex: 1, fontFamily: "'Barlow', sans-serif",
    }}>

      {/* Header */}
      <header style={{ marginBottom: 24 }}>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(40px, 5vw, 60px)",
          letterSpacing: "3px", color: "#eef0f6", lineHeight: 1,
        }}>
          Football Manager
        </h1>
        <p style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 15, color: "#3d5060", letterSpacing: "0.5px", marginTop: 8,
        }}>
          Simulate seasons · Track leagues · Build your legacy
        </p>
      </header>

      {/* Tab switcher */}
      <div style={{
        display: "flex", gap: 6, marginBottom: 28,
        borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 16,
      }}>
        <button style={tabStyle("league")}   onClick={() => setTab("league")}>⬛ League</button>
        <button style={tabStyle("calendar")} onClick={() => setTab("calendar")}>📅 Calendar</button>
      </div>

      {tab === "calendar" && <Calendar />}

      {tab === "league" && <>

        {/* Season finished banner */}
        {isFinished && (
          <div style={{
            marginBottom: 20, padding: "14px 20px", borderRadius: 12,
            background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.3)",
            color: "#ffd700", fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 20, letterSpacing: "2px", textAlign: "center",
          }}>
            🏆 SEASON COMPLETE — {displayTable[0]?.team} ARE CHAMPIONS!
          </div>
        )}

        {/* Matchday progress badge */}
        {!isFinished && currentMD > 0 && (
          <div style={{
            marginBottom: 20, padding: "10px 18px", borderRadius: 10,
            background: "rgba(77,168,255,0.08)", border: "1px solid rgba(77,168,255,0.2)",
            color: "#4da8ff", fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 14, letterSpacing: "0.5px", display: "flex",
            alignItems: "center", gap: 10,
          }}>
            <span style={{
              background: "#4da8ff", color: "#000", borderRadius: 6,
              padding: "2px 10px", fontWeight: 700, fontSize: 13,
            }}>
              MD {currentMD}/{totalMD}
            </span>
            Matchday {currentMD} simulated
          </div>
        )}

        {/* Notifications */}
        {flash && (
          <div style={{
            marginBottom: 20, padding: "12px 18px", borderRadius: 10,
            background: "rgba(0,200,100,0.08)", border: "1px solid rgba(0,200,100,0.25)",
            color: "#00e87a", fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 15, letterSpacing: "0.4px",
          }}>
            {flash}
          </div>
        )}
        {error && (
          <div style={{
            marginBottom: 20, padding: "12px 18px", borderRadius: 10,
            background: "rgba(220,50,50,0.07)", border: "1px solid rgba(220,50,50,0.22)",
            color: "#e05050", fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 15, letterSpacing: "0.4px",
          }}>
            {error}
          </div>
        )}

        {/* Action cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 14, marginBottom: 36,
        }}>
          {[
            { key: "season",   label: "Play Season",       sub: "Simulate a full league season",  icon: "▶", onClick: () => act("season", "/play-season", "Play Season") },
            { key: "matchday", label: isFinished ? "Season Done" : `Simulate Matchday ${currentMD + 1}`, sub: isFinished ? "Reset to play again" : `Play matchday ${currentMD + 1} of ${totalMD}`, icon: "◈", onClick: simulateNextMatchday, disabled: isFinished },
            { key: "reset",    label: "Reset Season",      sub: "Wipe results and start fresh",   icon: "↺", onClick: () => act("reset", "/reset-season", "Reset Season") },
          ].map(({ key, label, sub, icon, onClick, disabled }) => {
            const isActive = busy === key;
            return (
              <button
                key={key}
                onClick={onClick}
                disabled={!!busy || disabled}
                onMouseEnter={(e) => {
                  if (!busy && !disabled) {
                    e.currentTarget.style.background  = "rgba(255,255,255,0.07)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)";
                    e.currentTarget.style.transform   = "translateY(-3px)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background  = isActive ? "rgba(0,200,100,0.08)" : "rgba(255,255,255,0.03)";
                  e.currentTarget.style.borderColor = isActive ? "rgba(0,200,100,0.25)" : "rgba(255,255,255,0.08)";
                  e.currentTarget.style.transform   = "translateY(0)";
                }}
                style={{
                  background: isActive ? "rgba(0,200,100,0.08)" : "rgba(255,255,255,0.03)",
                  backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
                  border: `1px solid ${isActive ? "rgba(0,200,100,0.25)" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 14, padding: "22px 20px 18px", textAlign: "left",
                  cursor: (busy || disabled) ? "not-allowed" : "pointer",
                  transition: "all 0.15s",
                  opacity: (busy && !isActive) || disabled ? 0.4 : 1,
                  transform: "translateY(0)",
                }}
              >
                <div style={{
                  fontSize: 20, color: isActive ? "#00e87a" : "#2a3a50",
                  marginBottom: 10, fontFamily: "monospace",
                }}>
                  {isActive ? "…" : icon}
                </div>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 17, fontWeight: 700, letterSpacing: "0.4px",
                  color: "#eef0f6", marginBottom: 5,
                }}>
                  {isActive ? "Working…" : label}
                </div>
                <div style={{ fontSize: 13, color: "#3d5060", lineHeight: 1.4 }}>
                  {sub}
                </div>
              </button>
            );
          })}
        </div>

        {/* League table */}
        <div style={{
          background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 18, overflow: "hidden",
        }}>
          <div style={{
            padding: "18px 24px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 26, letterSpacing: "2px", color: "#eef0f6",
            }}>
              Premier League Table
            </h2>
            <div style={{ display: "flex", gap: 14 }}>
              {[
                { color: "#4da8ff", label: "UCL" },
                { color: "#e8a020", label: "UEL" },
                { color: "#e05050", label: "REL" },
              ].map(({ color, label }) => (
                <span key={label} style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 11, fontWeight: 600, letterSpacing: "1px", color,
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, display: "inline-block" }} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Column headers */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "32px 220px 44px 44px 44px 44px 52px 52px 52px 62px",
            padding: "8px 24px", borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}>
            {["#", "Club", "P", "W", "D", "L", "GF", "GA", "GD", "Pts"].map((h, i) => (
              <span key={i} style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 11, fontWeight: 600, letterSpacing: "1.2px",
                textTransform: "uppercase", color: "#1e2e3a",
                textAlign: i <= 1 ? "left" : "center",
              }}>
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {loading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{
                margin: "6px 24px", height: 44, borderRadius: 10,
                background: "rgba(255,255,255,0.025)",
                animation: "fm-pulse 1.5s ease infinite",
                animationDelay: `${i * 0.08}s`,
              }} />
            ))
          ) : (
            displayTable.map((t, i) => {
              const accent = accentOf(i);
              const isEmpty = table.length === 0;
              return (
                <div
                  key={i}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.045)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = i < 3 ? "rgba(255,255,255,0.018)" : "transparent"; }}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "32px 220px 44px 44px 44px 44px 52px 52px 52px 62px",
                    padding: "10px 24px", borderBottom: "1px solid rgba(255,255,255,0.028)",
                    alignItems: "center",
                    background: i < 3 && !isEmpty ? "rgba(255,255,255,0.018)" : "transparent",
                    borderLeft: !isEmpty && accent ? `2px solid ${accent}` : "2px solid transparent",
                    transition: "background 0.12s", cursor: "default",
                    animation: "fm-fadeup 0.4s ease both",
                    animationDelay: `${i * 0.03}s`,
                    opacity: isEmpty ? 0.4 : 1,
                  }}
                >
                  <span style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 13, fontWeight: 700,
                    color: !isEmpty && accent ? accent : "#1e2e3a", textAlign: "center",
                  }}>
                    {i + 1}
                  </span>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {logos?.[t.team] ? (
                      <img src={logos[t.team]} alt={t.team} style={{
                        width: 26, height: 26, objectFit: "contain", flexShrink: 0,
                        filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.5))",
                      }} />
                    ) : (
                      <div style={{
                        width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                        background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "'Bebas Neue', sans-serif", fontSize: 8, color: "#3d5060",
                      }}>
                        {(t.team ?? "?").slice(0, 3).toUpperCase()}
                      </div>
                    )}
                    <span style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: 15, fontWeight: 600, color: "#c8d4e0",
                      letterSpacing: "0.3px",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {t.team}
                    </span>
                  </div>

                  {[t.played, t.wins, t.draws, t.losses, t.goalsFor, t.goalsAgainst].map((v, vi) => (
                    <span key={vi} style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: 14, color: isEmpty ? "#1e2e3a" : "#3d5060", textAlign: "center",
                    }}>
                      {isEmpty ? "—" : (v ?? "—")}
                    </span>
                  ))}

                  <span style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 14, textAlign: "center",
                    color: isEmpty ? "#1e2e3a" : gd(t) > 0 ? "#00c870" : gd(t) < 0 ? "#e05050" : "#3d5060",
                  }}>
                    {isEmpty ? "—" : gd(t) > 0 ? `+${gd(t)}` : gd(t)}
                  </span>

                  <span style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 16, fontWeight: 700,
                    color: isEmpty ? "#1e2e3a" : "#eef0f6",
                    textAlign: "center",
                    background: i < 3 && !isEmpty ? "rgba(0,200,100,0.07)" : "transparent",
                    borderRadius: 6, padding: "2px 0",
                  }}>
                    {isEmpty ? "—" : (t.points ?? "—")}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </>}

      <style>{`
        @keyframes fm-fadeup {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fm-pulse {
          0%, 100% { opacity: 0.3; }
          50%       { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}