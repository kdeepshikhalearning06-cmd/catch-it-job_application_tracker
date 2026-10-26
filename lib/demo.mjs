import { supabase } from "./supabase.mjs";
import { demoItems } from "./seed.mjs";

// Remembers on this device that the signed-in account is the demo, so "Reset demo" stays even after every sample is cleared.
const FLAG = "catchit-demo";
export function markDemo(on) {
  try {
    if (on) localStorage.setItem(FLAG, "1");
    else localStorage.removeItem(FLAG);
  } catch {}
}
export function inDemo() {
  try {
    return localStorage.getItem(FLAG) === "1";
  } catch {
    return false;
  }
}

// Logs in as the shared demo user (the password stays on the server) and starts the sample inbox fresh,
// so every visitor sees the full demo even if the last one cleared it.
export async function startDemo() {
  const res = await fetch("/api/demo-login", { method: "POST" });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Demo login failed");
  const sb = supabase();
  const { error } = await sb.auth.setSession({ access_token: body.access_token, refresh_token: body.refresh_token });
  if (error) throw error;
  markDemo(true);
  await resetDemo();
}

export async function seedDemo() {
  const sb = supabase();
  const { data } = await sb.auth.getUser();
  const userId = data?.user?.id;
  if (!userId) throw new Error("Not signed in");
  const { error } = await sb.from("items").insert(demoItems().map((r) => ({ ...r, user_id: userId })));
  if (error) throw error;
}

// In the demo account, clears everything (samples and any task a visitor added), then refills the samples.
export async function resetDemo() {
  const sb = supabase();
  const { data } = await sb.auth.getUser();
  const userId = data?.user?.id;
  if (!userId) throw new Error("Not signed in");
  const { error } = inDemo()
    ? await sb.from("items").delete().eq("user_id", userId)
    : await sb.from("items").delete().eq("source", "demo");
  if (error) throw error;
  await seedDemo();
}
