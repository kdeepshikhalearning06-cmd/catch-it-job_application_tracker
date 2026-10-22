import { supabase } from "./supabase.mjs";
import { demoItems } from "./seed.mjs";

// Logs in as the shared demo user (the password stays on the server) and fills the sample inbox if it is empty.
export async function startDemo() {
  const res = await fetch("/api/demo-login", { method: "POST" });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Demo login failed");
  const sb = supabase();
  const { error } = await sb.auth.setSession({ access_token: body.access_token, refresh_token: body.refresh_token });
  if (error) throw error;
  const { count } = await sb.from("items").select("id", { count: "exact", head: true });
  if (!count) await seedDemo();
}

export async function seedDemo() {
  const sb = supabase();
  const { data } = await sb.auth.getUser();
  const userId = data?.user?.id;
  if (!userId) throw new Error("Not signed in");
  const { error } = await sb.from("items").insert(demoItems().map((r) => ({ ...r, user_id: userId })));
  if (error) throw error;
}

export async function resetDemo() {
  const sb = supabase();
  const { error } = await sb.from("items").delete().eq("source", "demo");
  if (error) throw error;
  await seedDemo();
}
