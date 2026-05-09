"use client";

import { useEffect, useState, useCallback } from "react";
import api from "../lib/api";

const resultColor = (home, away) => {
  if (home > away) return { home: "#00e87a", away: "#3d5060" };
  if (away > home) return { home: "#3d5060", away: "#00e87a" };
  return { home: "#e8a020", away: "#e8a020" };
};

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [filter,  setFilter]  = useState("all"); // "all" | "home" | "away" | "draw"

  const loadMatches = useCallback(async () => {
    try {
      const res = await api.get("/matches");
      setMatches(res.data);
    } catch {
      setError("Could not load matches. Is your Java/Scala server running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const filtered = matches.filter((m) => {
    if (filter === "all")  return true;
    if (filter === "draw") return m.homeGoals === m.awayGoals;
    if (filter === "home") return m.homeGoals > m.awayGoals;
    if (filter === "away") return m.awayGoals > m.homeGoals;
    return true;
  });

  const stats = {
    total: matches.length,
    home:  matches.filter((m) => m.homeGoals > m.awayGoals).length,
    away:  matches.filter((m) => m.awayGoals > m.homeGoals).length,
    draws: matches.filter((m) => m.homeGoals === m.awayGoals).length,
    goals: matches.reduce((s, m) => s + (m.homeGoals ?? 0) + (m.awayGoals ?? 0), 0),
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "28px 24px 48px",
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* Header */}
      <header style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(34px, 4vw, 52px)",
            letterSpacing: "3px",
            color: "#eef0f6",
            lineHeight: 1,
          }}
        >
          Match Results
        </h1>
        <p
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 15,
            color: "#3d5060",
            letterSpacing: "0.5px",
            marginTop: 6,
          }}
        >
          Full fixture list from your Java/Scala backend
        </p>
      </header>

      {/* Stat pills */}
      {!loading && !error && (
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 24,
          }}
        >
          {[
            { label: "Total",  value: stats.total, color: "#4da8ff"  },
            { label: "Home W", value: stats.home,  color: "#00e87a"  },
            { label: "Away W", value: stats.away,  color: "#e05050"  },
            { label: "Draws",  value: stats.draws, color: "#e8a020"  },
            { label: "Goals",  value: stats.goals, color: "#a060ff"  },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              style={{
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 10,
                padding: "10px 18px",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                minWidth: 80,
              }}
            >
              <span
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 24,
                  color,
                  letterSpacing: "1px",
                  lineHeight: 1,
                }}
              >
                {value}
              </span>
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "1.2px",
                  textTransform: "uppercase",
                  color: "#2a3a48",
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 20,
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 10,
          padding: 4,
          width: "fit-content",
        }}
      >
        {["all", "home", "away", "draw"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.8px",
              textTransform: "uppercase",
              border: "none",
              borderRadius: 7,
              padding: "6px 16px",
              cursor: "pointer",
              transition: "all 0.15s",
              background: filter === f ? "rgba(255,255,255,0.09)" : "transparent",
              color: filter === f ? "#eef0f6" : "#3d5060",
            }}
          >
            {f === "all" ? "All" : f === "home" ? "Home W" : f === "away" ? "Away W" : "Draws"}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: "14px 18px",
            borderRadius: 10,
            background: "rgba(220,50,50,0.07)",
            border: "1px solid rgba(220,50,50,0.2)",
            color: "#e05050",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 15,
            marginBottom: 20,
          }}
        >
          {error}
        </div>
      )}

      {/* Match list */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 12,
        }}
      >
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 80,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  animation: "pulse 1.5s ease infinite",
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))
          : filtered.map((m) => {
              const colors = resultColor(m.homeGoals, m.awayGoals);
              return (
                <div
                  key={m.id}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    backdropFilter: "blur(14px)",
                    WebkitBackdropFilter: "blur(14px)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 12,
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    transition: "background 0.12s, border-color 0.12s",
                    animation: "fadeUp 0.35s ease both",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                  }}
                >
                  {/* Home team */}
                  <span
                    style={{
                      flex: 1,
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: 16,
                      fontWeight: 700,
                      color: colors.home,
                      textAlign: "right",
                      letterSpacing: "0.3px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {m.homeTeam}
                  </span>

                  {/* Score */}
                  <div
                    style={{
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: 0,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      overflow: "hidden",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: 22,
                        color: colors.home,
                        padding: "4px 12px",
                        letterSpacing: "1px",
                        lineHeight: 1,
                      }}
                    >
                      {m.homeGoals ?? 0}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: 14,
                        color: "#2a3a48",
                        padding: "0 2px",
                      }}
                    >
                      :
                    </span>
                    <span
                      style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: 22,
                        color: colors.away,
                        padding: "4px 12px",
                        letterSpacing: "1px",
                        lineHeight: 1,
                      }}
                    >
                      {m.awayGoals ?? 0}
                    </span>
                  </div>

                  {/* Away team */}
                  <span
                    style={{
                      flex: 1,
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: 16,
                      fontWeight: 700,
                      color: colors.away,
                      textAlign: "left",
                      letterSpacing: "0.3px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {m.awayTeam}
                  </span>
                </div>
              );
            })}
      </div>

      {!loading && filtered.length === 0 && !error && (
        <p
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 16,
            color: "#2a3a48",
            letterSpacing: "0.5px",
            textAlign: "center",
            marginTop: 40,
          }}
        >
          No matches found for this filter.
        </p>
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}