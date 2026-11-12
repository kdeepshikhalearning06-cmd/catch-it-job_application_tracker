"use client";

import { useState } from "react";

// Landing-page form for people who want access. Google lets an app that is still being verified
// have 100 Gmail users, so this keeps a list of who to let in next.
export default function RequestAccess() {
  const [state, setState] = useState({ busy: false, done: false, error: "" });

  const submit = async (e) => {
    e.preventDefault();
    const form = Object.fromEntries(new FormData(e.currentTarget));
    setState({ busy: true, done: false, error: "" });
    const res = await fetch("/api/access", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    }).catch(() => null);
    const body = await res?.json().catch(() => ({}));
    if (!res?.ok) return setState({ busy: false, done: false, error: body?.error || "That didn't go through. Please try again." });
    setState({ busy: false, done: true, error: "" });
  };

  if (state.done) {
    return <p className="msg" role="status"><b>Thanks, you&rsquo;re on the list.</b> I&rsquo;ll email you when your spot opens. Meanwhile, try the demo above.</p>;
  }
  return (
    <form onSubmit={submit}>
      <input name="name" placeholder="Your name" autoComplete="name" required maxLength={80} />
      <input name="email" type="email" placeholder="Gmail you apply from" autoComplete="email" required maxLength={200} />
      <input name="college" placeholder="College (optional)" maxLength={120} />
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px" }} />
      <button className="btn" type="submit" disabled={state.busy}>{state.busy ? "Sending…" : "Request access"}</button>
      {state.error ? <p className="msg" role="alert">{state.error}</p> : null}
    </form>
  );
}
