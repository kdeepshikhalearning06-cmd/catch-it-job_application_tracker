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

  useEffect(() => {
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
        setMessage("Reading your job emails from the last 14 days. This takes up to a minute, so keep this screen open…");
        // If the first pass doesn't finish (slow phone network, busy AI model), the background check
        // reads the rest within 15 minutes, so the person goes to Review either way.
        const r = await scanGmail({ force: true }).catch(() => null);
        router.replace(!r || r.left ? "/review?scan=later" : "/review");
      } catch (err) {
        setFailed(true);
        setMessage(err.message || "Something went wrong.");
      }
    })();
  }, [router]);

  return (
    <div className="page">
      <header className="page-head">
        <Logo />
      </header>
      <main className="page-body">
        <div className="panel">
          {failed ? null : <div className="spinner" aria-hidden="true" />}
          <h1>{failed ? "Could not finish" : "One moment"}</h1>
          <p className={failed ? "error-text" : "lead"}>{message}</p>
          {failed ? (
            <p>
              {expired ? <a className="btn" href="/api/gmail/start">Connect Gmail again</a> : <a className="btn alt" href="/login">Back to sign in</a>}
            </p>
          ) : null}
        </div>
      </main>
    </div>
  );
}
