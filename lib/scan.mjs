import { supabase } from "./supabase.mjs";

// Asks the server to read Gmail for the signed-in user. Resolves with the result, throws a plain message on failure.
export async function scanGmail({ force = false } = {}) {
  const { data: { session } } = await supabase().auth.getSession();
  if (!session) throw new Error("Please sign in again.");
  const res = await fetch(`/api/gmail/scan${force ? "?force=1" : ""}`, {
    method: "POST",
    headers: { authorization: `Bearer ${session.access_token}` },
    signal: AbortSignal.timeout(75000),
  }).catch(() => {
    throw new Error("The scan is taking longer than usual. Catchit keeps reading in the background, so check back in a few minutes.");
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.error === "not_connected" ? "Gmail is not connected yet." : body.error || "The scan failed.");
    err.notConnected = body.error === "not_connected";
    throw err;
  }
  return body;
}
