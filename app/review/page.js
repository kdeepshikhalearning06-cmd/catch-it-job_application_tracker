"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "../../components/AppShell";
import ReviewCard from "../../components/ReviewCard";
import { useItems } from "../../lib/useItems";
import { scanGmail } from "../../lib/scan.mjs";

export default function ReviewPage() {
  const { loading, items, error, update, reset, signOut, reload, isDemo } = useItems();
  const [scan, setScan] = useState({ busy: false, text: "" });
  const [now] = useState(() => new Date());
  const [later, setLater] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("scan") === "later") setLater(true);
  }, []);
  const proposed = items.filter((i) => i.status === "proposed");

  const runScan = async () => {
    setScan({ busy: true, text: "Reading your recent email…" });
    try {
      const r = await scanGmail();
      await reload();
      const more = r.left ? ` ${r.left} more are still being read in the background. New ones will show up here within 15 minutes.` : "";
      setScan({ busy: false, text: r.found ? `Found ${r.found} new from ${r.email}.${more}` : `Nothing new in ${r.email}.${more}` });
    } catch (err) {
      if (err.notConnected) {
        window.location.href = "/api/gmail/start";
        return;
      }
      setScan({ busy: false, text: err.message });
    }
  };

  return (
    <AppShell reviewCount={proposed.length} isDemo={isDemo} onReset={reset} onSignOut={signOut} error={error}>
      <div className="titlerow">
        <h1 className="page-title">Review</h1>
        {isDemo ? (
          <Link className="b" href="/auth/finish?demo=1">Scan my Gmail</Link>
        ) : (
          <button className="b" onClick={runScan} disabled={scan.busy}>{scan.busy ? "Scanning…" : "Scan my Gmail"}</button>
        )}
      </div>
      <p className="sub">Catchit found these in your emails. Confirm what&rsquo;s right, fix what isn&rsquo;t.</p>
      {later && !scan.text ? (
        <p className="scan-note">Catchit is still reading some of your emails in the background. Anything new shows up here within 15 minutes, and you&rsquo;ll get a notification if reminders are on.</p>
      ) : null}
      {scan.text ? <p className="scan-note">{scan.text}</p> : null}
      {loading ? <p className="sub">Loading…</p> : null}
      {!loading && proposed.length === 0 ? (
        <div className="empty">
          <span className="ic" aria-hidden="true">✅</span>
          <strong>All caught up.</strong>
          <p>Everything Catchit found has been checked. <Link href="/today">See Today</Link></p>
        </div>
      ) : null}
      {proposed.map((item) => (
        <ReviewCard key={item.id} item={item} now={now} onChange={update} />
      ))}
    </AppShell>
  );
}
