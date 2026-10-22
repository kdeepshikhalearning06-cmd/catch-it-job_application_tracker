"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase.mjs";
import { scanGmail } from "../../../lib/scan.mjs";

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
        setMessage("Reading the last 14 days of your email. This can take up to a minute…");
        await scanGmail({ force: true });
        router.replace("/review");
      } catch (err) {
        setFailed(true);
        setMessage(err.message || "Something went wrong.");
      }
    })();
  }, [router]);

  return (
    <main>
      <h1>{failed ? "Could not finish" : "One moment"}</h1>
      <p className={failed ? "error-text" : "lead"}>{message}</p>
      {failed ? (
        <p>
          {expired ? <a className="btn" href="/api/gmail/start">Connect Gmail again</a> : <a href="/login">Back to log in</a>}
        </p>
      ) : null}
    </main>
  );
}
