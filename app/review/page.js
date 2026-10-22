"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "../../components/AppShell";
import ReviewCard from "../../components/ReviewCard";
import { useItems } from "../../lib/useItems";

export default function ReviewPage() {
  const { loading, items, error, update, reset, signOut } = useItems();
  const [now] = useState(() => new Date());
  const proposed = items.filter((i) => i.status === "proposed");
  const isDemo = items.some((i) => i.source === "demo");

  return (
    <AppShell reviewCount={proposed.length} isDemo={isDemo} onReset={reset} onSignOut={signOut} error={error}>
      <h1 className="page-title">Review</h1>
      <p className="sub">Catchit found these in your emails. Confirm what is right, fix what is not.</p>
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
