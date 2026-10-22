import test from "node:test";
import assert from "node:assert/strict";
import { dayKey, weekOf, formatDeadline, relative, toLocalInput, fromLocalInput, groupForDay, dayMarks, tomorrowStart, isHidden } from "../lib/when.mjs";
import { demoItems } from "../lib/seed.mjs";

// Thursday 22 Oct 2026, 11:00 am IST
const now = new Date("2026-10-22T05:30:00Z");

test("dayKey uses India time", () => {
  assert.equal(dayKey("2026-10-22T20:00:00Z"), "2026-10-23");
  assert.equal(dayKey("2026-10-22T05:30:00Z"), "2026-10-22");
});

test("the week runs Monday to Sunday", () => {
  const days = weekOf(now);
  assert.deepEqual(days.map((d) => d.label), ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
  assert.equal(days[0].key, "2026-10-19");
  assert.equal(days[3].key, "2026-10-22");
  assert.equal(days[6].key, "2026-10-25");
});

test("formats deadlines for people", () => {
  assert.equal(formatDeadline("2026-10-22T11:30:00Z", now), "today, 5:00 pm");
  assert.equal(formatDeadline("2026-10-23T09:30:00Z", now), "tomorrow, 3:00 pm");
  assert.equal(formatDeadline("2026-10-25T18:29:00Z", now), "Sun 25 Oct, 11:59 pm");
  assert.equal(relative("2026-10-22T11:30:00Z", now), "in 6 hours");
  assert.equal(relative("2026-10-22T03:30:00Z", now), "2 hours ago");
});

test("local input round trip stays in IST", () => {
  const iso = "2026-10-22T11:30:00.000Z";
  assert.equal(toLocalInput(iso), "2026-10-22T17:00");
  assert.equal(fromLocalInput("2026-10-22T17:00"), iso);
  assert.equal(fromLocalInput(""), null);
});

test("today splits overdue, due and undated", () => {
  const items = demoItems(now).map((r, i) => ({ id: i, ...r }));
  const g = groupForDay(items, "2026-10-22", now);
  assert.deepEqual(g.overdue.map((i) => i.action), ["Return the signed offer form"]);
  assert.deepEqual(g.due.map((i) => i.action), ["Upload your degree certificate"]);
  assert.equal(g.undated.length, 0);
  const fri = groupForDay(items, "2026-10-23", now);
  assert.deepEqual(fri.due.map((i) => i.action), ["Attend the first-round interview"]);
  assert.equal(fri.overdue.length, 0);
});

test("proposed items never show on Today", () => {
  const items = demoItems(now).map((r, i) => ({ id: i, ...r }));
  const all = ["2026-10-22", "2026-10-23", "2026-10-24", "2026-10-25"].flatMap((k) => {
    const g = groupForDay(items, k, now);
    return [...g.overdue, ...g.due, ...g.undated];
  });
  assert.ok(all.every((i) => i.status === "confirmed"));
});

test("week marks count items and flag late ones", () => {
  const items = demoItems(now).map((r, i) => ({ id: i, ...r }));
  const marks = dayMarks(items, weekOf(now), now);
  assert.equal(marks["2026-10-21"].count, 1);
  assert.equal(marks["2026-10-21"].late, true);
  assert.equal(marks["2026-10-22"].count, 1);
  assert.equal(marks["2026-10-24"].count, 1);
  assert.equal(marks["2026-10-24"].late, false);
});

test("a snoozed item is hidden until tomorrow", () => {
  const item = { status: "confirmed", deadline: "2026-10-22T04:00:00Z", snoozed_until: tomorrowStart(now) };
  assert.equal(tomorrowStart(now), "2026-10-22T18:30:00.000Z");
  assert.equal(isHidden(item, now), true);
  assert.equal(isHidden(item, new Date("2026-10-22T18:31:00Z")), false);
  assert.equal(groupForDay([item], "2026-10-22", now).overdue.length, 0);
});

test("the demo inbox has a mix for Review and Today", () => {
  const items = demoItems(now);
  assert.equal(items.filter((i) => i.status === "proposed").length, 4);
  assert.equal(items.filter((i) => i.status === "confirmed").length, 5);
  assert.ok(items.every((i) => i.source === "demo" && i.evidence));
});
