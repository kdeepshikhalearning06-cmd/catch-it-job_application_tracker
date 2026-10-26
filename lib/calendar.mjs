// "Add to Google Calendar" link: opens a prefilled event in the person's own calendar.
// No Google permission is needed; the person saves the event themselves.

const stamp = (ms) => new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

// Interviews, calls and live sessions happen at that time, so the event starts there and lasts an hour.
// Anything to hand in is a 30-minute block that ends at the deadline, so it sits where the work has to be done.
const AT_TIME = /\b(interview|call|meeting|meet|session|webinar|attend|join|discussion)\b/i;
const HAND_IN = /\b(submit|complete|upload|fill|send|share|record|confirm|reply|book|schedule|register|pick)\b/i;
export function eventWindow(item) {
  const t = new Date(item.deadline).getTime();
  const text = `${item.action ?? ""} ${item.my_name ?? ""}`;
  return AT_TIME.test(text) && !HAND_IN.test(text) ? { start: t, end: t + 60 * 60 * 1000 } : { start: t - 30 * 60 * 1000, end: t };
}

export function googleCalendarUrl(item) {
  if (!item?.deadline) return null;
  const { start, end } = eventWindow(item);
  const details = [
    item.company || item.role ? [item.company, item.role].filter(Boolean).join(" · ") : null,
    item.link ? `Link: ${item.link}` : null,
    item.evidence ? `From the email: "${item.evidence}"` : null,
    "Added from Catchit",
  ].filter(Boolean).join("\n");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: item.my_name || item.action,
    dates: `${stamp(start)}/${stamp(end)}`,
    details,
    ctz: "Asia/Kolkata",
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

// The same event as an .ics file, so it opens in any phone or laptop calendar without signing in.
export function icsDataUrl(item) {
  if (!item?.deadline) return null;
  const { start, end } = eventWindow(item);
  const esc = (s) => String(s).replace(/[\;,]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");
  const details = [item.company, item.link ? `Link: ${item.link}` : null, "Added from Catchit"].filter(Boolean).join("\n");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Catchit//EN",
    "BEGIN:VEVENT",
    `UID:${item.id ?? end}@catchit`,
    `DTSTAMP:${stamp(Date.now())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(item.my_name || item.action)}`,
    `DESCRIPTION:${esc(details)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}
