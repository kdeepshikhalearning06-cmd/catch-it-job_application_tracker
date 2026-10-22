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

  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams(window.location.hash.slice(1));
        const { error } = await supabase().auth.setSession({
          access_token: params.get("access_token") ?? "",
          refresh_token: params.get("refresh_token") ?? "",
        });
        if (error) throw error;
        window.history.replaceState(null, "", "/auth/finish");
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
      {failed ? <p><a href="/login">Back to log in</a></p> : null}
    </main>
  );
}
