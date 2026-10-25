"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase.mjs";
import { startDemo } from "../../lib/demo.mjs";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [gmailProblem, setGmailProblem] = useState("");

  useEffect(() => {
    const reason = new URLSearchParams(window.location.search).get("gmail");
    if (!reason) return;
    setGmailProblem(
      reason === "denied"
        ? "You chose not to connect Gmail. Nothing was read."
        : "Gmail did not connect. Please tap Connect my Gmail again. If Google says access is blocked, send your Gmail ID to the person who invited you so they can add you as a tester.",
    );
  }, []);

  const signIn = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const { error } = await supabase().auth.signInWithPassword({ email, password });
    if (error) {
      setMessage("That email and password did not work.");
      setBusy(false);
      return;
    }
    router.push("/today");
  };

  const demo = async () => {
    setBusy(true);
    setMessage("");
    try {
      await startDemo();
      router.push("/today");
    } catch (err) {
      setMessage(err.message);
      setBusy(false);
    }
  };

  return (
    <main>
      <Link href="/" className="brand">Catchit</Link>
      <h1>Get started</h1>
      <p className="lead">Connect the Gmail you use for job applications. Catchit reads it (read-only) and shows you every test, interview and deadline it finds.</p>
      <p>
        <a className="btn" href="/api/gmail/start">Connect my Gmail</a>
      </p>
      <div className="callout">
        <b>Heads up:</b> Catchit is a student project, so Google shows a &ldquo;Google hasn&rsquo;t verified this app&rdquo; screen.
        Tap <b>Continue</b>, or <b>Advanced</b> then <b>Go to Catchit</b>. Catchit never sends, changes or deletes an email. <a href="/privacy">Privacy</a>
      </div>
      {gmailProblem ? <p className="note error-text">{gmailProblem}</p> : null}
      <p className="note">Just looking? <button className="linkbtn" onClick={demo} disabled={busy}>Try the demo with sample emails</button></p>
      <details className="pw">
        <summary>Have a Catchit password? (demo and judges)</summary>
        <form onSubmit={signIn} className="form">
          <label className="field">Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </label>
          <label className="field">Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          </label>
          <button className="b" disabled={busy} type="submit">Log in</button>
        </form>
      </details>
      {message ? <p className="note error-text">{message}</p> : null}
    </main>
  );
}
