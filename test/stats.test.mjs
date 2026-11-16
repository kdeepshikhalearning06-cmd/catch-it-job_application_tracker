import test from "node:test";
import assert from "node:assert/strict";
import { summarize } from "../lib/stats.mjs";

test("counts only other people's connections after the fix and their answers", () => {
  const tokens = [
    { user_id: "a", email: "kdeepshikhalearning07@gmail.com", connected_at: "2026-11-14T10:00:00Z" },
    { user_id: "b", email: "tester@example.com", connected_at: "2026-11-13T10:00:00Z" },
    { user_id: "c", email: "old@example.com", connected_at: "2026-10-27T10:00:00Z" },
  ];
  const items = [
    { user_id: "a", seen_before: "missed" },
    { user_id: "b", seen_before: "seen" },
    { user_id: "b", seen_before: "missed" },
    { user_id: "c", seen_before: null },
  ];
  assert.deepEqual(summarize(tokens, items), { connectedSinceFix: 1, answered: 2, seen: 1, missed: 1 });
});

test("empty data gives zeros", () => {
  assert.deepEqual(summarize(null, null), { connectedSinceFix: 0, answered: 0, seen: 0, missed: 0 });
});
