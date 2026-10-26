import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./supabase.mjs";
import { resetDemo, inDemo, markDemo } from "./demo.mjs";

// Loads the signed-in user's items and gives pages a way to change them.
export function useItems() {
  const router = useRouter();
  const [state, setState] = useState({ loading: true, items: [], user: null, error: null });
  const [demoFlag, setDemoFlag] = useState(false);
  useEffect(() => setDemoFlag(inDemo()), []);

  const load = useCallback(async () => {
    const sb = supabase();
    const { data: { session } } = await sb.auth.getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    const { data, error } = await sb.from("items").select("*").order("deadline", { ascending: true, nullsFirst: false });
    setState({ loading: false, items: data ?? [], user: session.user, error: error ? error.message : null });
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const update = useCallback(async (id, patch) => {
    setState((s) => ({ ...s, items: s.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) }));
    const { error } = await supabase().from("items").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) {
      setState((s) => ({ ...s, error: error.message }));
      load();
    }
  }, [load]);

  const add = useCallback(async (fields) => {
    const { data: { session } } = await supabase().auth.getSession();
    if (!session) throw new Error("Please sign in again.");
    const { error } = await supabase().from("items").insert({
      user_id: session.user.id,
      source: "manual",
      status: "confirmed",
      confidence: "high",
      ...fields,
    });
    if (error) throw new Error(error.message);
  }, []);

  const remove = useCallback(async (id) => {
    const { error } = await supabase().from("items").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }, []);

  const reset = useCallback(async () => {
    try {
      await resetDemo();
    } catch (err) {
      setState((s) => ({ ...s, error: err.message }));
    }
    load();
  }, [load]);

  const signOut = useCallback(async () => {
    markDemo(false);
    await supabase().auth.signOut();
    router.replace("/");
  }, [router]);

  const isDemo = demoFlag || state.items.some((i) => i.source === "demo");
  return { ...state, isDemo, update, add, remove, reset, signOut, reload: load };
}
