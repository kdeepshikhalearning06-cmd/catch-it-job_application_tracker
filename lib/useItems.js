import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./supabase.mjs";
import { resetDemo } from "./demo.mjs";

// Loads the signed-in user's items and gives pages a way to change them.
export function useItems() {
  const router = useRouter();
  const [state, setState] = useState({ loading: true, items: [], user: null, error: null });

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

  const reset = useCallback(async () => {
    try {
      await resetDemo();
    } catch (err) {
      setState((s) => ({ ...s, error: err.message }));
    }
    load();
  }, [load]);

  const signOut = useCallback(async () => {
    await supabase().auth.signOut();
    router.replace("/");
  }, [router]);

  return { ...state, update, reset, signOut, reload: load };
}
