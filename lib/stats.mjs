import { adminClient } from "./admin.mjs";

// The landing page shows these numbers live, so nobody has to edit them by hand.
// Deepshikha's own accounts are left out: a tap on her own test account is not a user's answer.
export const FIX_DATE = Date.parse("2026-11-12T17:00:00Z");
const OWNER = /^kdeepshikha/i;
const FALLBACK = { connectedSinceFix: 5, answered: 8, seen: 8, missed: 0 };

export function summarize(tokens, items) {
  const others = (tokens ?? []).filter((t) => !OWNER.test(String(t.email ?? "")));
  const ids = new Set(others.map((t) => t.user_id));
  const answers = (items ?? []).filter((i) => ids.has(i.user_id) && (i.seen_before === "seen" || i.seen_before === "missed"));
  return {
    connectedSinceFix: others.filter((t) => Date.parse(t.connected_at) > FIX_DATE).length,
    answered: answers.length,
    seen: answers.filter((i) => i.seen_before === "seen").length,
    missed: answers.filter((i) => i.seen_before === "missed").length,
  };
}

export async function proofStats() {
  try {
    const db = adminClient();
    const [t, i] = await Promise.all([
      db.from("gmail_tokens").select("user_id,email,connected_at"),
      db.from("items").select("user_id,seen_before").not("seen_before", "is", null),
    ]);
    if (t.error || i.error) return FALLBACK;
    return summarize(t.data, i.data);
  } catch {
    return FALLBACK;
  }
}
