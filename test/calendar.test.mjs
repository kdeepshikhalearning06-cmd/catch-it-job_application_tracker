import { test } from "node:test";
import assert from "node:assert/strict";
import { eventWindow } from "../lib/calendar.mjs";

const at = "2026-10-27T15:00:00+05:30";
const t = Date.parse(at);

test("an interview starts at its time and lasts an hour", () => {
  assert.deepEqual(eventWindow({ action: "Join the first-round interview", deadline: at }), { start: t, end: t + 3600000 });
  assert.deepEqual(eventWindow({ action: "Attend the HR call", deadline: at }), { start: t, end: t + 3600000 });
});

test("something to hand in ends at the deadline", () => {
  assert.deepEqual(eventWindow({ action: "Submit the assignment", deadline: at }), { start: t - 1800000, end: t });
  assert.deepEqual(eventWindow({ action: "Confirm your interview slot", deadline: at }), { start: t - 1800000, end: t });
});
