"use client";

import { useEffect, useState, useCallback } from "react";
import api from "../lib/api";

const POSITIONS = ["All", "GK", "DEF", "MID", "FWD"];

const posColor = {
  GK:  { bg: "rgba(232,160,32,0.1)",  border: "rgba(232,160,32,0.25)",  text: "#e8a020" },
  DEF: { bg: "rgba(77,168,255,0.1)",  border: "rgba(77,168,255,0.25)",  text: "#4da8ff" },
  MID: { bg: "rgba(0,232,122,0.1)",   border: "rgba(0,232,122,0.25)",   text: "#00e87a" },
  FWD: { bg: "rgba(224,80,80,0.1)",   border: "rgba(224,80,80,0.25)",   text: "#e05050" },
};

const ratingColor = (r) => {
  if (r >= 85) return "#00e87a";
  if (r >= 75) return "#e8a020";
  return "#4da8ff";
};

const initials = (name) =>
  (name || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

export default function PlayersPage() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [pos,     setPos]     = useState("All");
  const [search,  setSearch]  = useState("");
  const [sortBy,  setSortBy]  = useState("rating"); // "rating" | "name" | "club"

  const loadPlayers = useCallback(async () => {
    try {
      const res = await api.get("/players");
      setPlayers(res.data);
    } catch {
      setError("Could not load players. Is your Java/Scala server running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  const visible = players
    .filter((p) => pos === "All" || p.position === pos)
    .filter((p) =>
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.club?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
      if (sortBy === "name")   return (a.name ?? "").localeCompare(b.name ?? "");
      if (sortBy === "club")   return (a.club ?? "").localeCompare(b.club ?? "");
      return 0;
    });

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
          Squad & Players
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
          {players.length} players from your Java/Scala backend
        </p>
      </header>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 24,
          alignItems: "center",
        }}
      >
        {/* Search */}
        <input
          type="text"
          placeholder="Search name or club…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 10,
            padding: "9px 16px",
            color: "#eef0f6",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 15,
            letterSpacing: "0.4px",
            outline: "none",
            width: 220,
          }}
        />

        {/* Position filter */}
        <div
          style={{
            display: "flex",
            gap: 3,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 10,
            padding: 3,
          }}
        >
          {POSITIONS.map((p) => (
            <button
              key={p}
              onClick={() => setPos(p)}
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.8px",
                border: "none",
                borderRadius: 7,
                padding: "6px 14px",
                cursor: "pointer",
                transition: "all 0.12s",
                background: pos === p ? "rgba(255,255,255,0.09)" : "transparent",
                color: pos === p ? "#eef0f6" : "#3d5060",
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 10,
            padding: "9px 14px",
            color: "#7a8aa0",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 14,
            letterSpacing: "0.4px",
            outline: "none",
            cursor: "pointer",
          }}
        >
          <option value="rating">Sort: Rating</option>
          <option value="name">Sort: Name</option>
          <option value="club">Sort: Club</option>
        </select>
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

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 14,
        }}
      >
        {loading
          ? Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 120,
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  animation: "pulse 1.5s ease infinite",
                  animationDelay: `${i * 0.07}s`,
                }}
              />
            ))
          : visible.map((p, i) => {
              const pc = posColor[p.position] ?? posColor["MID"];
              const rc = ratingColor(p.rating ?? 0);
              return (
                <div
                  key={i}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 14,
                    padding: "18px 18px 16px",
                    transition: "all 0.14s",
                    animation: "fadeUp 0.35s ease both",
                    animationDelay: `${Math.min(i * 0.03, 0.5)}s`,
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
                    {/* Avatar */}
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: pc.bg,
                        border: `1px solid ${pc.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: 16,
                        color: pc.text,
                        letterSpacing: "1px",
                        flexShrink: 0,
                      }}
                    >
                      {initials(p.name)}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: 16,
                          fontWeight: 700,
                          color: "#c8d4e0",
                          letterSpacing: "0.3px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {p.name}
                      </div>
                      <div
                        style={{
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: 13,
                          color: "#3d5060",
                          letterSpacing: "0.3px",
                          marginTop: 2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {p.club ?? "Unknown Club"}
                      </div>
                    </div>

                    {/* Rating */}
                    <div
                      style={{
                        flexShrink: 0,
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: 28,
                        color: rc,
                        lineHeight: 1,
                        letterSpacing: "1px",
                      }}
                    >
                      {p.rating ?? "—"}
                    </div>
                  </div>

                  {/* Footer */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderTop: "1px solid rgba(255,255,255,0.05)",
                      paddingTop: 10,
                    }}
                  >
                    {/* Position badge */}
                    <span
                      style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "1.2px",
                        textTransform: "uppercase",
                        background: pc.bg,
                        border: `1px solid ${pc.border}`,
                        color: pc.text,
                        borderRadius: 6,
                        padding: "3px 9px",
                      }}
                    >
                      {p.position ?? "N/A"}
                    </span>

                    {/* Rating bar */}
                    <div
                      style={{
                        flex: 1,
                        marginLeft: 12,
                        height: 3,
                        background: "rgba(255,255,255,0.06)",
                        borderRadius: 2,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min((p.rating ?? 0), 100)}%`,
                          height: "100%",
                          background: rc,
                          borderRadius: 2,
                          transition: "width 0.6s ease",
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
      </div>

      {!loading && visible.length === 0 && !error && (
        <p
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 16,
            color: "#2a3a48",
            letterSpacing: "0.5px",
            textAlign: "center",
            marginTop: 48,
          }}
        >
          No players match your filter.
        </p>
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        input::placeholder { color: #2a3a48; }
      `}</style>
    </div>
  );
}