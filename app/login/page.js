"use client";

import { useState } from "react";
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
      <h1>Log in</h1>
      <form onSubmit={signIn} className="form">
        <label className="field">Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label className="field">Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </label>
        <button className="btn" disabled={busy} type="submit">Log in</button>
      </form>
      <p className="note">Just looking? <button className="linkbtn" onClick={demo} disabled={busy}>Try the demo with sample emails</button></p>
      {message ? <p className="note error-text">{message}</p> : null}
    </main>
  );
}
