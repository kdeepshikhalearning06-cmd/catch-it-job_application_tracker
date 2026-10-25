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
