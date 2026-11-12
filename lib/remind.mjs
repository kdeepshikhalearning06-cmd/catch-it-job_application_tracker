// Which items need a phone reminder now, and what the notification says.
// Two reminders per item: one about a day before, one about 2 hours before.
// Items still waiting in Review are reminded too, so a deadline Catchit found never slips just because
// nobody opened the app to confirm it. Dismissed and done items are not.

import { formatDeadline, dayKey } from "./when.mjs";

const HOUR = 3600 * 1000;
export const DAY_BEFORE = 24 * HOUR;
export const HOURS_BEFORE = 2 * HOUR;
export const REMINDED = new Set(["confirmed", "proposed"]);

// items: rows from the items table. sent: Set of "itemId:kind" already sent.
// Returns [{ item, kind }] where kind is "day" or "hours".
export function dueReminders(items, now, sent = new Set()) {
  const t = new Date(now).getTime();
  const out = [];
  for (const item of items) {
    if (!REMINDED.has(item.status) || !item.deadline) continue;
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
  const unchecked = item.status === "proposed";
  const tap = unchecked ? " Not checked yet: tap to confirm." : item.link ? " Tap for the link." : "";
  return {
    title: kind === "hours" ? `Due soon: ${label(item)}` : `${dayKey(item.deadline) === dayKey(now) ? "Today" : "Tomorrow"}: ${label(item)}`,
    body: `${label(item)}${who}, due ${when}.${tap}`,
    url: `/item/${item.id}`,
    tag: `${item.id}:${kind}`,
  };
}

// Sent after a background Gmail scan finds new proposals. Leads with the soonest dated one, with its deadline.
export function foundMessage(rows, now = new Date()) {
  const dated = rows.filter((r) => r.deadline && new Date(r.deadline) > new Date(now)).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  const first = dated[0] ?? rows[0];
  const due = first.deadline && dated.length ? `, due ${formatDeadline(first.deadline, now)}` : "";
  const more = rows.length > 1 ? ` and ${rows.length - 1} more` : "";
  return {
    title: rows.length === 1 ? "Catchit found 1 new action" : `Catchit found ${rows.length} new actions`,
    body: `${first.company ? `${first.company}: ` : ""}${first.action}${due}${more}. Tap to review.`,
    url: "/review",
    tag: "found",
  };
}

// Sent once when Google stops accepting the saved Gmail token, so the person knows Catchit has stopped checking.
export function reconnectMessage() {
  return {
    title: "Catchit can't read your Gmail",
    body: "Google ended Catchit's access, so new job emails aren't being checked. Tap to reconnect.",
    url: "/today",
    tag: "reconnect",
  };
}
