// Date helpers. Everything is shown in India time (IST, UTC+5:30).

const IST_MS = 5.5 * 3600 * 1000;
const DAY_MS = 24 * 3600 * 1000;
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "2026-10-23" for the IST calendar day that contains this moment.
export const dayKey = (when) => new Date(new Date(when).getTime() + IST_MS).toISOString().slice(0, 10);

export const startOfDay = (key) => new Date(Date.parse(`${key}T00:00:00+05:30`));

export const addDays = (key, n) => dayKey(startOfDay(key).getTime() + n * DAY_MS + DAY_MS / 2);

// Index 0 = Monday.
const weekdayIndex = (key) => (new Date(`${key}T12:00:00Z`).getUTCDay() + 6) % 7;

export function weekOf(now) {
  const today = dayKey(now);
  const first = addDays(today, -weekdayIndex(today));
  return Array.from({ length: 7 }, (_, i) => {
    const key = addDays(first, i);
    return { key, label: DAYS.at(i), num: Number(key.slice(8)) };
  });
}

export function clock(when) {
  const d = new Date(new Date(when).getTime() + IST_MS);
  const h = d.getUTCHours();
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(d.getUTCMinutes()).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
}

// "today, 5:00 pm", "tomorrow, 3:00 pm", "Fri 23 Oct, 3:00 pm"
export function formatDeadline(deadline, now) {
  const key = dayKey(deadline);
  const today = dayKey(now);
  if (key === today) return `today, ${clock(deadline)}`;
  if (key === addDays(today, 1)) return `tomorrow, ${clock(deadline)}`;
  if (key === addDays(today, -1)) return `yesterday, ${clock(deadline)}`;
  const d = new Date(startOfDay(key).getTime() + IST_MS);
  return `${DAYS.at(weekdayIndex(key))} ${d.getUTCDate()} ${MONTHS.at(d.getUTCMonth())}, ${clock(deadline)}`;
}

// "in 5 hours", "in 2 days", "3 hours ago"
export function relative(deadline, now) {
  const diff = new Date(deadline).getTime() - new Date(now).getTime();
  const abs = Math.abs(diff);
  const mins = Math.round(abs / 60000);
  const hours = Math.round(abs / 3600000);
  const days = Math.round(abs / DAY_MS);
  const unit = mins < 60 ? `${mins} min` : hours < 48 ? `${hours} hour${hours === 1 ? "" : "s"}` : `${days} days`;
  return diff >= 0 ? `in ${unit}` : `${unit} ago`;
}

// The value for <input type="datetime-local">, in IST.
export const toLocalInput = (deadline) =>
  deadline ? new Date(new Date(deadline).getTime() + IST_MS).toISOString().slice(0, 16) : "";

// The other way: what the user typed (IST) back to an ISO time.
export const fromLocalInput = (value) => (value ? new Date(`${value}:00+05:30`).toISOString() : null);

// Start of tomorrow in IST: where a snoozed item comes back.
export const tomorrowStart = (now) => startOfDay(addDays(dayKey(now), 1)).toISOString();

export const isHidden = (item, now) => Boolean(item.snoozed_until) && Date.parse(item.snoozed_until) > new Date(now).getTime();

const byDeadline = (a, b) => Date.parse(a.deadline) - Date.parse(b.deadline);

// Splits confirmed items for the chosen day.
export function groupForDay(items, selectedKey, now) {
  const today = dayKey(now);
  const t = new Date(now).getTime();
  const overdue = [];
  const due = [];
  const undated = [];
  for (const item of items) {
    if (item.status !== "confirmed" || isHidden(item, now)) continue;
    if (!item.deadline) {
      if (selectedKey === today) undated.push(item);
      continue;
    }
    const past = Date.parse(item.deadline) < t;
    const key = dayKey(item.deadline);
    if (selectedKey === today) {
      if (past) overdue.push(item);
      else if (key === today) due.push(item);
    } else if (key === selectedKey) {
      (past ? overdue : due).push(item);
    }
  }
  return { overdue: overdue.sort(byDeadline), due: due.sort(byDeadline), undated };
}

// For the week strip: how many items each day has, and whether any is already late.
export function dayMarks(items, days, now) {
  const t = new Date(now).getTime();
  const marks = {};
  for (const day of days) marks[day.key] = { count: 0, late: false };
  for (const item of items) {
    if (item.status !== "confirmed" || !item.deadline || isHidden(item, now)) continue;
    const mark = marks[dayKey(item.deadline)];
    if (!mark) continue;
    mark.count += 1;
    if (Date.parse(item.deadline) < t) mark.late = true;
  }
  return marks;
}

// Counts for the top of Today, and the next thing due. Only confirmed, not snoozed items count.
export function summary(items, now) {
  const t = new Date(now).getTime();
  const today = dayKey(now);
  const weekEnd = startOfDay(addDays(today, 7)).getTime();
  const live = items.filter((i) => i.status === "confirmed" && i.deadline && !isHidden(i, now)).sort(byDeadline);
  const future = live.filter((i) => Date.parse(i.deadline) >= t);
  return {
    overdue: live.length - future.length,
    today: future.filter((i) => dayKey(i.deadline) === today).length,
    week: future.filter((i) => Date.parse(i.deadline) < weekEnd).length,
    toCheck: items.filter((i) => i.status === "proposed").length,
    next: future[0] ?? null,
    comingUp: future.filter((i) => dayKey(i.deadline) !== today && Date.parse(i.deadline) < weekEnd),
  };
}

// "15 h 20 m", "2 d 4 h" or "35 m" until the deadline.
export function countdown(deadline, now) {
  const mins = Math.max(0, Math.round((Date.parse(deadline) - new Date(now).getTime()) / 60000));
  if (mins < 60) return `${mins} m`;
  const h = Math.floor(mins / 60);
  if (h < 48) return `${h} h ${mins % 60} m`;
  return `${Math.floor(h / 24)} d ${h % 24} h`;
}

// The small day word under the time on Today: "Yesterday", "Today", "Tomorrow" or "Mon".
export function dayWord(deadline, now) {
  const key = dayKey(deadline);
  const today = dayKey(now);
  if (key === today) return "Today";
  if (key === addDays(today, 1)) return "Tomorrow";
  if (key === addDays(today, -1)) return "Yesterday";
  return DAYS.at(weekdayIndex(key));
}
