"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/",        label: "Dashboard" },
  { href: "/league",  label: "League"    },
  { href: "/matches", label: "Matches"   },
  { href: "/players", label: "Players"   },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        margin: "16px 24px 0",
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: "14px",
        padding: "6px 8px",
        display: "flex",
        alignItems: "center",
        gap: "4px",
      }}
    >
      {/* Logo */}
      <div
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "20px",
          letterSpacing: "2px",
          color: "#eef0f6",
          paddingRight: "16px",
          paddingLeft: "8px",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          marginRight: "8px",
          lineHeight: 1,
        }}
      >
        FM<span style={{ color: "#00e87a" }}>.</span>
      </div>

      {links.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              letterSpacing: "0.6px",
              textTransform: "uppercase",
              textDecoration: "none",
              padding: "7px 16px",
              borderRadius: "9px",
              transition: "all 0.15s",
              background: active ? "rgba(255,255,255,0.09)" : "transparent",
              color: active ? "#eef0f6" : "#5a7080",
              borderBottom: active ? "2px solid #00e87a" : "2px solid transparent",
            }}
          >
            {label}
          </Link>
        );
      })}

      {/* Right side — live indicator */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px", paddingRight: "8px" }}>
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#00e87a",
            boxShadow: "0 0 6px #00e87a",
            display: "inline-block",
            animation: "pulse 2s ease infinite",
          }}
        />
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "#3d4e60",
          }}
        >
          Live
        </span>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </nav>
  );
}