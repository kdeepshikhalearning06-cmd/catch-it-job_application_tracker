"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "../../components/AppShell";
import ReviewCard from "../../components/ReviewCard";
import { useItems } from "../../lib/useItems";
import { scanGmail } from "../../lib/scan.mjs";

export default function ReviewPage() {
  const { loading, items, error, update, reset, signOut, reload } = useItems();
  const [scan, setScan] = useState({ busy: false, text: "" });
  const [now] = useState(() => new Date());
  const proposed = items.filter((i) => i.status === "proposed");
  const isDemo = items.some((i) => i.source === "demo");

  const runScan = async () => {
    setScan({ busy: true, text: "Reading the last 14 days of your email…" });
    try {
      const r = await scanGmail();
      await reload();
      const more = r.left ? ` ${r.left} more are waiting, scan again to read them.` : "";
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
      <h1 className="page-title">Review</h1>
      <p className="sub">Catchit found these in your emails. Confirm what is right, fix what is not.</p>
      {!isDemo ? (
        <div className="btns" style={{ margin: "0 0 12px" }}>
          <button className="b" onClick={runScan} disabled={scan.busy}>{scan.busy ? "Scanning…" : "Scan my Gmail"}</button>
        </div>
      ) : null}
      {scan.text ? <p className="sub">{scan.text}</p> : null}
      {loading ? <p className="sub">Loading…</p> : null}
      {!loading && proposed.length === 0 ? (
        <div className="empty">
          <strong>Nothing to review.</strong>
          <p>Everything Catchit found has been dealt with. <Link href="/today">See Today</Link></p>
        </div>
      ) : null}
      {proposed.map((item) => (
        <ReviewCard key={item.id} item={item} now={now} onChange={update} />
      ))}
    </AppShell>
  );
}
