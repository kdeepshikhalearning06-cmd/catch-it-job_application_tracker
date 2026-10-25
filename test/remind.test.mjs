import test from "node:test";
import assert from "node:assert/strict";
import { dueReminders, reminderMessage, foundMessage } from "../lib/remind.mjs";
import { googleCalendarUrl } from "../lib/calendar.mjs";

// Sunday 25 Oct 2026, 10:00 am IST
const now = new Date("2026-10-25T04:30:00Z");
const at = (hours) => new Date(now.getTime() + hours * 3600 * 1000).toISOString();
const item = (id, hours, extra = {}) => ({ id, status: "confirmed", action: "Complete the assessment", company: "Infosys", deadline: at(hours), ...extra });

test("a day-before reminder inside 24 hours, an hours-before one inside 2 hours", () => {
  const got = dueReminders([item("a", 20), item("b", 1.5), item("c", 30)], now);
  assert.deepEqual(got.map((r) => [r.item.id, r.kind]), [["a", "day"], ["b", "hours"]]);
});

test("nothing for past, undated, unconfirmed, snoozed or already sent items", () => {
  const items = [
    item("past", -1),
    item("nodate", 0, { deadline: null }),
    item("proposed", 5, { status: "proposed" }),
    item("done", 5, { status: "done" }),
    item("snoozed", 5, { snoozed_until: at(12) }),
    item("sent", 5),
  ];
  assert.deepEqual(dueReminders(items, now, new Set(["sent:day"])), []);
});

test("an item already reminded a day before still gets the 2-hour reminder", () => {
  const got = dueReminders([item("a", 1)], now, new Set(["a:day"]));
  assert.deepEqual(got.map((r) => r.kind), ["hours"]);
});

test("the notification uses the person's own name for the item", () => {
  const m = reminderMessage(item("a", 1.5, { my_name: "Infosys test", link: "https://x.example" }), "hours", now);
  assert.equal(m.title, "Due soon: Infosys test");
  assert.match(m.body, /due today, 11:30 am/);
  assert.match(m.body, /Tap for the link\./);
  assert.equal(m.url, "/item/a");
});

test("the day-before reminder says Today or Tomorrow by India date", () => {
  assert.equal(reminderMessage(item("a", 8), "day", now).title, "Today: Complete the assessment");
  assert.equal(reminderMessage(item("b", 20), "day", now).title, "Tomorrow: Complete the assessment");
});

test("found message counts new actions", () => {
  assert.equal(foundMessage([item("a", 3)]).title, "Catchit found 1 new action");
  const m = foundMessage([item("a", 3), item("b", 4)]);
  assert.equal(m.title, "Catchit found 2 new actions");
  assert.match(m.body, /^Infosys: Complete the assessment and 1 more/);
});

test("Google Calendar link ends the event at the deadline", () => {
  const url = new URL(googleCalendarUrl({ action: "Do the test", deadline: "2026-10-26T18:29:00Z", link: "https://t.example" }));
  assert.equal(url.searchParams.get("action"), "TEMPLATE");
  assert.equal(url.searchParams.get("text"), "Do the test");
  assert.equal(url.searchParams.get("dates"), "20261026T175900Z/20261026T182900Z");
  assert.match(url.searchParams.get("details"), /Link: https:\/\/t.example/);
  assert.equal(googleCalendarUrl({ action: "x", deadline: null }), null);
});
