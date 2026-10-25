"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import FirstRunGuide from "./FirstRunGuide";

export default function AppShell({ reviewCount, isDemo, onReset, onSignOut, error, children }) {
  const path = usePathname();
  const tab = (href, label, count) => (
    <Link href={href} className={`tab ${path === href ? "on" : ""}`}>
      {label}
      {count ? <span className="badge">{count}</span> : null}
    </Link>
  );
  return (
    <div className="shell">
      <header className="topbar">
        <Link href="/today" className="brand">Catchit</Link>
        <nav className="tabs">
          {tab("/review", "Review", reviewCount)}
          {tab("/today", "Today")}
        </nav>
        <Link href="/account" className={`tab ${path === "/account" ? "on" : ""}`}>Account</Link>
      </header>
      {isDemo ? (
        <div className="banner">
          You are using the demo. Every email here is a sample.{" "}
          <button className="linkbtn" onClick={onReset}>Reset demo</button>
        </div>
      ) : null}
      {error ? <div className="banner error">Something went wrong: {error}</div> : null}
      <main className="content">
        {path === "/review" || path === "/today" ? <FirstRunGuide isDemo={isDemo} /> : null}
        {children}
      </main>
    </div>
  );
}
