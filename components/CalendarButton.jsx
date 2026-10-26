"use client";

import { useState } from "react";
import { googleCalendarUrl, icsDataUrl, eventWindow } from "../lib/calendar.mjs";

const time = (ms) => new Date(ms).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });
const day = (ms) => new Date(ms).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Kolkata" });

// Real accounts go straight to Google Calendar. The demo has no Google account behind it,
// so it shows the event Catchit would fill in, with ways to save it anywhere.
export default function CalendarButton({ item }) {
  const [open, setOpen] = useState(false);
  if (!item.deadline) return null;
  const url = googleCalendarUrl(item);
  if (item.source !== "demo") return <a className="b" href={url} target="_blank" rel="noreferrer">Add to calendar</a>;

  const { start, end } = eventWindow(item);
  return (
    <>
      <button className="b" onClick={() => setOpen(true)}>Add to calendar</button>
      {open ? (
        <div className="cal-overlay" role="dialog" aria-modal="true" aria-label="Calendar event preview" onClick={() => setOpen(false)}>
          <div className="cal-sheet" onClick={(e) => e.stopPropagation()}>
            <p className="cal-kicker">Google Calendar · new event</p>
            <div className="cal-event">
              <b>{item.my_name || item.action}</b>
              <span>{day(start)} · {time(start)} – {time(end)}</span>
              {item.company ? <span>{item.company}</span> : null}
              {item.link ? <span className="cal-link">Link: {item.link}</span> : null}
              {item.evidence ? <span className="cal-quote">From the email: “{item.evidence}”</span> : null}
              <span className="cal-from">Added from Catchit</span>
            </div>
            <p className="cal-note">This is the demo, so there’s no Google account behind it. With your own Gmail, this button opens Google Calendar with this event already filled in. You just tap Save.</p>
            <div className="btns">
              <a className="b p" href={icsDataUrl(item)} download="catchit-event.ics">Save to my calendar (.ics)</a>
              <a className="b" href={url} target="_blank" rel="noreferrer">Open Google Calendar</a>
              <button className="b" onClick={() => setOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
