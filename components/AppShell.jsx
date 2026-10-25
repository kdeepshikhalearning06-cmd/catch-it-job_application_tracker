"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import FirstRunGuide from "./FirstRunGuide";
import Logo from "./Logo";

const ICONS = {
  review: <path d="M4 5h16v11H14l-2 3-2-3H4z M8 9.5l2 2 4-4" />,
  today: <path d="M4 6h16v14H4z M4 10h16 M8 3v4 M16 3v4 M8 14h3" />,
  account: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c1.2-4 4.3-6 8-6s6.8 2 8 6" />,
};

const Icon = ({ name }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {ICONS[name]}
  </svg>
);

export default function AppShell({ reviewCount, isDemo, onReset, onSignOut, error, children }) {
  const path = usePathname();
  const tab = (href, label, icon, count) => (
    <Link href={href} className={`tab ${path === href ? "on" : ""}`} aria-current={path === href ? "page" : undefined}>
      <Icon name={icon} />
      {label}
      {count ? <span className="badge" aria-label={`${count} to review`}>{count}</span> : null}
    </Link>
  );
  return (
    <div className="shell">
      <header className="topbar">
        <Logo href="/today" />
        <nav className="tabs" aria-label="Main">
          {tab("/review", "Review", "review", reviewCount)}
          {tab("/today", "Today", "today")}
          {tab("/account", "Account", "account")}
        </nav>
      </header>
      {isDemo ? (
        <div className="banner">
          <span><b>Demo mode.</b> Every email here is a sample.</span>
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
