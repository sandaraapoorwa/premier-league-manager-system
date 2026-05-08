"use client";

import Link from "next/link";

export default function Navbar() {

  return (

    <nav className="glass m-4 p-4 flex gap-6 text-lg">

      <Link href="/">🏠 Dashboard</Link>

      <Link href="/league">🏆 League</Link>

      <Link href="/matches">⚽ Matches</Link>

      <Link href="/players">👤 Players</Link>

    </nav>
  );
}