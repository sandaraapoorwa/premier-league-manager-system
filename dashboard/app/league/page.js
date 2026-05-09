"use client";

import { useState } from "react";
import api from "../lib/api";
import logos from "../lib/logos";

export default function LeaguePage() {
  const [status,  setStatus]  = useState("idle");   // "idle" | "loading" | "success" | "error"
  const [message, setMessage] = useState("");
  const [results, setResults] = useState(null);      // whatever your backend returns

  const playSeason = async () => {
    setStatus("loading");
    setMessage("");
    setResults(null);
    try {
      console.log("Sending /play-season request…");
      const res = await api.post("/play-season");
      console.log("SUCCESS:", res.data);
      setStatus("success");
      setMessage("Season simulated successfully!");
      setResults(res.data);
    } catch (err) {
      console.error("FULL ERROR:", err);
      if (err.response) console.log("Response:", err.response.data);
      setStatus("error");
      setMessage(
        err.response?.data?.message
          ?? err.message
          ?? "Request failed — check your Scala server."
      );
    }
  };

  const reset = () => {
    setStatus("idle");
    setMessage("");
    setResults(null);
  };

  // ── helpers ──────────────────────────────────────────────────────────────
  const isLoading = status === "loading";
  const isSuccess = status === "success";
  const isError   = status === "error";

  return (
    <div style={{
      minHeight: "100vh",
      padding: "32px 28px 56px",
      position: "relative",
      zIndex: 1,
      fontFamily: "'Barlow', sans-serif",
    }}>

      {/* ── Header ── */}
      <header style={{ marginBottom: 36 }}>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(38px, 5vw, 56px)",
          letterSpacing: "3px",
          color: "#eef0f6",
          lineHeight: 1,
        }}>
          League Control
        </h1>
        <p style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 15,
          color: "#3d5060",
          letterSpacing: "0.5px",
          marginTop: 8,
        }}>
          Trigger season simulation and inspect the response from your Scala backend
        </p>
      </header>

      {/* ── Main action card ── */}
      <div style={{
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 18,
        padding: "32px 28px",
        marginBottom: 24,
        display: "flex",
        alignItems: "center",
        gap: 28,
        flexWrap: "wrap",
      }}>

        {/* Icon block */}
        <div style={{
          width: 72, height: 72, borderRadius: 16, flexShrink: 0,
          background: isSuccess
            ? "rgba(0,200,100,0.1)"
            : isError
            ? "rgba(220,50,50,0.1)"
            : "rgba(255,255,255,0.05)",
          border: `1px solid ${
            isSuccess ? "rgba(0,200,100,0.3)"
            : isError  ? "rgba(220,50,50,0.3)"
            : "rgba(255,255,255,0.1)"
          }`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          color: isSuccess ? "#00e87a" : isError ? "#e05050" : "#2a3a50",
          fontFamily: "monospace",
          transition: "all 0.3s",
        }}>
          {isLoading ? (
            <span style={{ animation: "fm-spin 1s linear infinite", display: "inline-block" }}>◌</span>
          ) : isSuccess ? "✓" : isError ? "✕" : "▶"}
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 24, letterSpacing: "2px", color: "#eef0f6", marginBottom: 6,
          }}>
            {isLoading ? "Simulating Season…"
              : isSuccess ? "Season Complete"
              : isError   ? "Simulation Failed"
              : "Play Full Season"}
          </div>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 15, color: "#3d5060", lineHeight: 1.5,
          }}>
            {isLoading
              ? "Sending request to your Scala backend — please wait."
              : isSuccess
              ? message
              : isError
              ? message
              : "Runs all fixtures for the current season and returns updated standings."}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          {(status === "idle" || isError) && (
            <button
              onClick={playSeason}
              onMouseEnter={(e) => {
                e.currentTarget.style.background  = "rgba(0,200,100,0.15)";
                e.currentTarget.style.borderColor = "rgba(0,200,100,0.4)";
                e.currentTarget.style.transform   = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background  = "rgba(0,200,100,0.08)";
                e.currentTarget.style.borderColor = "rgba(0,200,100,0.25)";
                e.currentTarget.style.transform   = "translateY(0)";
              }}
              style={{
                background: "rgba(0,200,100,0.08)",
                border: "1px solid rgba(0,200,100,0.25)",
                borderRadius: 10,
                padding: "10px 24px",
                color: "#00e87a",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 16, fontWeight: 700, letterSpacing: "0.6px",
                cursor: "pointer",
                transition: "all 0.15s",
                transform: "translateY(0)",
              }}
            >
              {isError ? "Retry" : "Play Season"}
            </button>
          )}
          {(isSuccess || isError) && (
            <button
              onClick={reset}
              onMouseEnter={(e) => {
                e.currentTarget.style.background  = "rgba(255,255,255,0.07)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background  = "rgba(255,255,255,0.03)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              }}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                padding: "10px 20px",
                color: "#3d5060",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 15, letterSpacing: "0.5px",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ── Response viewer ── */}
      {isSuccess && results && (
        <div style={{
          animation: "fm-fadeup 0.4s ease both",
        }}>
          {/* If backend returns an array (e.g. league table rows) */}
          {Array.isArray(results) ? (
            <div style={{
              background: "rgba(255,255,255,0.03)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16,
              overflow: "hidden",
            }}>
              <div style={{
                padding: "14px 22px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 20, letterSpacing: "2px", color: "#eef0f6",
              }}>
                Updated Standings
              </div>
              {results.map((t, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "10px 22px",
                  borderBottom: "1px solid rgba(255,255,255,0.03)",
                  transition: "background 0.12s",
                  animation: "fm-fadeup 0.35s ease both",
                  animationDelay: `${i * 0.03}s`,
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 13, fontWeight: 700, color: "#1e2e3a", width: 22, textAlign: "center",
                  }}>
                    {i + 1}
                  </span>
                  {logos?.[t.team] && (
                    <img src={logos[t.team]} alt={t.team} style={{
                      width: 24, height: 24, objectFit: "contain",
                      filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.4))",
                    }} />
                  )}
                  <span style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 15, fontWeight: 600, color: "#c8d4e0", flex: 1,
                  }}>
                    {t.team ?? t.name ?? JSON.stringify(t)}
                  </span>
                  {t.points !== undefined && (
                    <span style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 20, color: "#eef0f6", letterSpacing: "1px",
                    }}>
                      {t.points} <span style={{ fontSize: 11, color: "#1e2e3a", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "1px" }}>PTS</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* Fallback: raw JSON viewer */
            <div style={{
              background: "rgba(255,255,255,0.03)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14,
              overflow: "hidden",
            }}>
              <div style={{
                padding: "10px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 12, fontWeight: 600, letterSpacing: "1.5px",
                textTransform: "uppercase", color: "#1e2e3a",
              }}>
                Backend Response
              </div>
              <pre style={{
                padding: "18px 20px",
                fontFamily: "'Courier Prime', 'Courier New', monospace",
                fontSize: 13,
                color: "#4a7a60",
                overflowX: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                margin: 0,
                maxHeight: 400,
                overflowY: "auto",
              }}>
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* ── Endpoint reference card ── */}
      <div style={{
        marginTop: 28,
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: 14,
        padding: "16px 22px",
      }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 11, fontWeight: 600, letterSpacing: "1.5px",
          textTransform: "uppercase", color: "#1e2e3a", marginBottom: 10,
        }}>
          Endpoint
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 12, fontWeight: 700, letterSpacing: "1px",
            background: "rgba(0,200,100,0.08)", border: "1px solid rgba(0,200,100,0.2)",
            color: "#00e87a", borderRadius: 6, padding: "3px 10px",
          }}>
            POST
          </span>
          <code style={{
            fontFamily: "'Courier Prime', 'Courier New', monospace",
            fontSize: 14,
            color: "#4a6070",
          }}>
            /play-season
          </code>
        </div>
      </div>

      <style>{`
        @keyframes fm-fadeup {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fm-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}