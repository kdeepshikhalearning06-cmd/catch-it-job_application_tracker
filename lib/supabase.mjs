import { createClient } from "@supabase/supabase-js";

let client;

// One browser client for the whole app. The session is kept in the browser.
export function supabase() {
  if (!client) {
    client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  }
  return client;
}
