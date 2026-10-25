"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "../../components/AppShell";
import NotifyCard from "../../components/NotifyCard";
import { useItems } from "../../lib/useItems";
import { supabase } from "../../lib/supabase.mjs";

async function call(path) {
  const { data: { session } } = await supabase().auth.getSession();
  if (!session) throw new Error("Please sign in again.");
  const res = await fetch(path, { method: "POST", headers: { authorization: `Bearer ${session.access_token}` } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "Something went wrong.");
  return body;
}

export default function AccountPage() {
  const { items, user, error, reset, signOut } = useItems();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const isDemo = items.some((i) => i.source === "demo");

  const disconnect = async () => {
    if (!window.confirm("Stop Catchit from reading your Gmail? Your saved items stay.")) return;
    setBusy(true);
    try {
      await call("/api/account/disconnect");
      setNote("Gmail is disconnected. Catchit can no longer read your email.");
    } catch (err) {
      setNote(err.message);
    }
    setBusy(false);
  };

  const remove = async () => {
    if (!window.confirm("Delete your Catchit account and everything saved in it? This cannot be undone.")) return;
    setBusy(true);
    try {
      await call("/api/account/delete");
      await supabase().auth.signOut();
      window.location.href = "/";
    } catch (err) {
      setNote(err.message);
      setBusy(false);
    }
  };

  return (
    <AppShell reviewCount={items.filter((i) => i.status === "proposed").length} isDemo={isDemo} onReset={reset} onSignOut={signOut} error={error}>
      <h1 className="page-title">Account</h1>
      {user?.email ? <p className="sub">Signed in as {user.email}</p> : null}

      <div className="grp">Reminders</div>
      <NotifyCard full />

      <div className="grp">Gmail</div>
      <div className="card">
        <p className="meta" style={{ marginTop: 0 }}>Catchit reads only the last 14 days, read-only. It never sends, deletes or changes an email.</p>
        <div className="btns">
          {!isDemo ? <a className="b" href="/api/gmail/start">Connect Gmail again</a> : null}
          {!isDemo ? <button className="b" onClick={disconnect} disabled={busy}>Disconnect Gmail</button> : null}
          <Link className="b" href="/privacy">How we use your data</Link>
        </div>
      </div>

      <div className="grp">Your data</div>
      <div className="card">
        <div className="btns" style={{ marginTop: 0 }}>
          <button className="b" onClick={signOut}>Sign out</button>
          {!isDemo ? <button className="b danger" onClick={remove} disabled={busy}>Delete my account</button> : null}
        </div>
      </div>
      {note ? <p className="sub" style={{ marginTop: 12 }}>{note}</p> : null}
    </AppShell>
  );
}
