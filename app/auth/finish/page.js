"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase.mjs";
import { scanGmail } from "../../../lib/scan.mjs";
import Logo from "../../../components/Logo";

// Lands here after Google. Takes the session from the address, then reads the inbox once.
export default function Finish() {
  const router = useRouter();
  const [message, setMessage] = useState("Signing you in…");
  const [failed, setFailed] = useState(false);
  const [expired, setExpired] = useState(false);
  const [step, setStep] = useState(0);
  const [secs, setSecs] = useState(0);
  const [demo, setDemo] = useState(false);

  // One scan call has no progress events, so the middle steps move on a timer while it runs.
  useEffect(() => {
    if (step < 1 || step > 2) return;
    const t = setInterval(() => setSecs((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [step]);
  useEffect(() => {
    if (step === 1 && secs >= 8) setStep(2);
  }, [step, secs]);

  useEffect(() => {
    // The demo has a sample inbox instead of Gmail, so the same steps play on a timer and land on Review.
    if (new URLSearchParams(window.location.search).get("demo")) {
      setDemo(true);
      setStep(1);
      setMessage("This is a sample inbox, so it only takes a few seconds.");
      const timers = [setTimeout(() => setStep(2), 2500), setTimeout(() => setStep(3), 5000), setTimeout(() => router.replace("/review"), 6200)];
      return () => timers.forEach(clearTimeout);
    }
    (async () => {
      try {
        const params = new URLSearchParams(window.location.hash.slice(1));
        const access = params.get("access_token");
        const refresh = params.get("refresh_token");
        if (access && refresh) {
          const { error } = await supabase().auth.setSession({ access_token: access, refresh_token: refresh });
          if (error) throw error;
          window.history.replaceState(null, "", "/auth/finish");
        } else {
          const { data: { session } } = await supabase().auth.getSession();
          if (!session) {
            setExpired(true);
            throw new Error("This sign-in link was already used or has expired.");
          }
        }
        setStep(1);
        setMessage("This takes up to a minute. Keep this screen open.");
        // If the first pass doesn't finish (slow phone network, busy AI model), the background check
        // reads the rest within 15 minutes, so the person goes to Review either way.
        const r = await scanGmail({ force: true }).catch(() => null);
        setStep(3);
        router.replace(!r || r.left ? "/review?scan=later" : "/review");
      } catch (err) {
        setFailed(true);
        setMessage(err.message || "Something went wrong.");
      }
    })();
  }, [router]);

  if (failed) {
    return (
      <div className="page">
        <header className="page-head">
          <Logo />
        </header>
        <main className="page-body">
          <div className="panel">
            <h1>Could not finish</h1>
            <p className="error-text">{message}</p>
            <p>
              {expired ? <a className="btn" href="/api/gmail/start">Connect Gmail again</a> : <a className="btn alt" href="/login">Back to sign in</a>}
            </p>
          </div>
        </main>
      </div>
    );
  }

  const state = (i) => (step > i ? "done" : step === i ? "now" : "next");
  return (
    <div className="page">
      <header className="page-head">
        <Logo />
      </header>
      <main className="finish">
        <div className="panel finish-main">
          <span className="eyebrow">Setting up</span>
          <h1>{step >= 3 ? "All set" : "Reading your inbox"}</h1>
          <p className="lead">{step === 0 ? message : step >= 3 ? "Opening Review…" : message}</p>
          <div className="fbar" aria-hidden="true"><i style={{ width: `${[8, 30 + Math.min(secs, 8) * 3, 62 + Math.min(secs - 8, 25), 100][step]}%` }} /></div>
          <ol className="fsteps">
            {(demo ? DEMO_STEPS : STEPS).map((s, i) => (
              <li key={s.t} className={state(i)}>
                <span className="dot" aria-hidden="true">{state(i) === "done" ? "✓" : i + 1}</span>
                <div>
                  <b>{s.t}</b>
                  <small>{s.d}</small>
                </div>
              </li>
            ))}
          </ol>
          <p className="fsafe">🔒 Read-only. Catchit never sends, deletes or changes an email.</p>
        </div>
        <aside className="finish-side" aria-label="What Catchit looks for">
          <p className="fside-h">What Catchit is looking for</p>
          {EXAMPLES.map((e, i) => (
            <div key={e.k} className="fcard float" style={{ "--t": `${5 + i * 0.6}s`, "--fd": `${-i * 1.3}s` }}>
              <span className={`fk fk-${e.c}`}>{e.k}</span>
              <b>{e.a}</b>
              <small>{e.w}</small>
            </div>
          ))}
          <p className="fside-n">Job alerts, newsletters and promotions are skipped.</p>
        </aside>
      </main>
    </div>
  );
}

const STEPS = [
  { t: "Signed in with Google", d: "Your Gmail is connected, read-only" },
  { t: "Reading your job emails", d: "Only the last 14 days, only job-related mail" },
  { t: "Finding what companies asked", d: "Tests, interviews, forms and their deadlines" },
  { t: "Ready to review", d: "You confirm each one before it's reminded" },
];

const DEMO_STEPS = [
  { t: "Opened the demo inbox", d: "A sample Gmail full of job emails, read-only" },
  ...STEPS.slice(1),
];

const EXAMPLES = [
  { k: "Assessment", c: "a", a: "Complete the online test", w: "by Fri, 11:59 pm" },
  { k: "Interview", c: "b", a: "Join the first-round interview", w: "Tue, 3:00 pm" },
  { k: "Form", c: "c", a: "Submit the candidate form", w: "within 48 hours" },
];
