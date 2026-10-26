"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "../../components/AppShell";
import NotifyCard from "../../components/NotifyCard";
import ThemePicker from "../../components/ThemePicker";
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
  const { items, user, error, reset, signOut, isDemo } = useItems();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

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
      <div className="profile">
        <span className="avatar" aria-hidden="true">{(user?.email || "?")[0].toUpperCase()}</span>
        <div>
          <h1 className="page-title">Account</h1>
          {user?.email ? <p>{isDemo ? "Demo account" : user.email}</p> : null}
        </div>
      </div>

      <div className="grp">Reminders</div>
      <NotifyCard full />

      <div className="grp">Appearance</div>
      <div className="card rows">
        <div className="rowi">
          <div>
            <b>Theme</b>
            <p>Auto follows your phone&rsquo;s dark mode setting.</p>
          </div>
          <ThemePicker />
        </div>
      </div>

      <div className="grp">Gmail</div>
      <div className="card rows">
        <div className="rowi">
          <div>
            <b>{isDemo ? "Sample inbox" : "Gmail access"}</b>
            <p>Catchit reads only the last 14 days, read-only. It never sends, deletes or changes an email.</p>
          </div>
          {!isDemo ? <a className="b" href="/api/gmail/start">Reconnect</a> : null}
        </div>
        {!isDemo ? (
          <div className="rowi">
            <div>
              <b>Stop reading my email</b>
              <p>Your saved items stay. You can connect again any time.</p>
            </div>
            <button className="b" onClick={disconnect} disabled={busy}>Disconnect</button>
          </div>
        ) : null}
        <div className="rowi">
          <div>
            <b>Privacy</b>
            <p>What Catchit reads, keeps and never touches.</p>
          </div>
          <Link className="b" href="/privacy">Read</Link>
        </div>
      </div>

      <div className="grp">Your data</div>
      <div className="card rows">
        <div className="rowi">
          <div>
            <b>Sign out</b>
            <p>Sign out on this device.</p>
          </div>
          <button className="b" onClick={signOut}>Sign out</button>
        </div>
        {!isDemo ? (
          <div className="rowi">
            <div>
              <b>Delete my account</b>
              <p>Removes your account and everything saved in it. This can&rsquo;t be undone.</p>
            </div>
            <button className="b danger" onClick={remove} disabled={busy}>Delete</button>
          </div>
        ) : null}
      </div>
      {note ? <p className="scan-note" style={{ marginTop: 12 }}>{note}</p> : null}
    </AppShell>
  );
}
