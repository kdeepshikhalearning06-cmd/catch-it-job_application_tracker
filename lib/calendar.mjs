// "Add to Google Calendar" link: opens a prefilled event in the person's own calendar.
// No Google permission is needed; the person saves the event themselves.

const stamp = (ms) => new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

// A 30-minute block that ends at the deadline, so the event sits where the work has to be done.
export function googleCalendarUrl(item) {
  if (!item?.deadline) return null;
  const end = new Date(item.deadline).getTime();
  const start = end - 30 * 60 * 1000;
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
  const end = new Date(item.deadline).getTime();
  const esc = (s) => String(s).replace(/[\;,]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");
  const details = [item.company, item.link ? `Link: ${item.link}` : null, "Added from Catchit"].filter(Boolean).join("\n");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Catchit//EN",
    "BEGIN:VEVENT",
    `UID:${item.id ?? end}@catchit`,
    `DTSTAMP:${stamp(Date.now())}`,
    `DTSTART:${stamp(end - 30 * 60 * 1000)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(item.my_name || item.action)}`,
    `DESCRIPTION:${esc(details)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}
