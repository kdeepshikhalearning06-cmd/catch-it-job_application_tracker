"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase.mjs";
import { startDemo } from "../../lib/demo.mjs";
import Logo from "../../components/Logo";

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
    <div className="page">
      <header className="page-head">
        <Logo />
        <Link href="/" className="back">← Home</Link>
      </header>
      <main className="page-body">
        <div className="panel">
          <span className="eyebrow">Get started</span>
          <h1>Connect the Gmail you apply from</h1>
          <p className="lead">Catchit reads your job emails and shows every test, interview and deadline it finds. It takes about a minute.</p>
          <a className="btn full" href="/api/gmail/start">Connect my Gmail</a>
          {gmailProblem ? <p className="note error-text">{gmailProblem}</p> : null}
          <ul className="trust">
            <li>Read-only, and only the last 14 days of email</li>
            <li>Never sends, changes or deletes anything</li>
            <li>Disconnect or delete your data any time</li>
          </ul>
          <div className="callout">
            <span className="ic" aria-hidden="true">💡</span>
            <span>
              Catchit is a student project, so Google shows a &ldquo;Google hasn&rsquo;t verified this app&rdquo; screen.
              Tap <b>Continue</b>, or <b>Advanced</b> then <b>Go to Catchit</b>. <a href="/privacy">How we use your data</a>
            </span>
          </div>
          <div className="or">or</div>
          <button className="btn alt full" onClick={demo} disabled={busy}>{busy ? "Opening the demo…" : "Try the demo with sample emails"}</button>
          <details className="pw">
            <summary>Have a Catchit password? (demo and judges)</summary>
            <form onSubmit={signIn} className="form">
              <label className="field">Email
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              </label>
              <label className="field">Password
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
              </label>
              <button className="b p" disabled={busy} type="submit">Log in</button>
            </form>
          </details>
          {message ? <p className="note error-text">{message}</p> : null}
        </div>
      </main>
    </div>
  );
}
