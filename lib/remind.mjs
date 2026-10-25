// Which confirmed items need a phone reminder now, and what the notification says.
// Two reminders per item: one about a day before, one about 2 hours before.

import { formatDeadline, dayKey } from "./when.mjs";

const HOUR = 3600 * 1000;
export const DAY_BEFORE = 24 * HOUR;
export const HOURS_BEFORE = 2 * HOUR;

// items: rows from the items table. sent: Set of "itemId:kind" already sent.
// Returns [{ item, kind }] where kind is "day" or "hours".
export function dueReminders(items, now, sent = new Set()) {
  const t = new Date(now).getTime();
  const out = [];
  for (const item of items) {
    if (item.status !== "confirmed" || !item.deadline) continue;
    if (item.snoozed_until && new Date(item.snoozed_until).getTime() > t) continue;
    const left = new Date(item.deadline).getTime() - t;
    if (left <= 0) continue;
    if (left <= HOURS_BEFORE) {
      if (!sent.has(`${item.id}:hours`)) out.push({ item, kind: "hours" });
    } else if (left <= DAY_BEFORE) {
      if (!sent.has(`${item.id}:day`)) out.push({ item, kind: "day" });
    }
  }
  return out;
}

const label = (item) => item.my_name || item.action;

// The words on the notification. Kept short: phones cut the body after about two lines.
export function reminderMessage(item, kind, now) {
  const who = item.company ? ` (${item.company})` : "";
  const when = formatDeadline(item.deadline, now);
  return {
    title: kind === "hours" ? `Due soon: ${label(item)}` : `${dayKey(item.deadline) === dayKey(now) ? "Today" : "Tomorrow"}: ${label(item)}`,
    body: `${label(item)}${who}, due ${when}.${item.link ? " Tap to open." : ""}`,
    url: `/item/${item.id}`,
    tag: `${item.id}:${kind}`,
  };
}

// Sent after a background Gmail scan finds new proposals.
export function foundMessage(rows) {
  const first = rows[0];
  const more = rows.length > 1 ? ` and ${rows.length - 1} more` : "";
  return {
    title: rows.length === 1 ? "Catchit found 1 new action" : `Catchit found ${rows.length} new actions`,
    body: `${first.company ? `${first.company}: ` : ""}${first.action}${more}. Tap to review.`,
    url: "/review",
    tag: "found",
  };
}
