"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "../../components/AppShell";
import NotifyCard from "../../components/NotifyCard";
import { googleCalendarUrl } from "../../lib/calendar.mjs";
import { useItems } from "../../lib/useItems";
import { dayKey, weekOf, dayMarks, groupForDay, formatDeadline, relative, tomorrowStart } from "../../lib/when.mjs";

function TodayCard({ item, now, late, onChange }) {
  return (
    <div className={`card ${late ? "late" : ""}`}>
      <Link className="act" href={`/item/${item.id}`}>{item.my_name || item.action}</Link>
      {item.my_name ? <div className="orig">{item.action}</div> : null}
      <div className="orig">{[item.company, item.role].filter(Boolean).join(" · ")}</div>
      {item.deadline ? (
        <div className="meta">{late ? "Was due" : "Due"} <span className="when">{formatDeadline(item.deadline, now)}</span> · {relative(item.deadline, now)}</div>
      ) : (
        <div className="meta">No date set</div>
      )}
      <div className="btns">
        <button className="b p" onClick={() => onChange(item.id, { status: "done" })}>Done</button>
        <button className="b" onClick={() => onChange(item.id, { snoozed_until: tomorrowStart(now) })}>Snooze</button>
        {item.link ? <a className="b" href={item.link} target="_blank" rel="noreferrer">Open link</a> : null}
        {item.deadline && !late ? <a className="b" href={googleCalendarUrl(item)} target="_blank" rel="noreferrer">Add to calendar</a> : null}
      </div>
    </div>
  );
}

export default function TodayPage() {
  const { loading, items, error, update, reset, signOut } = useItems();
  const [now] = useState(() => new Date());
  const today = dayKey(now);
  const [selected, setSelected] = useState(today);
  const days = weekOf(now);
  const marks = dayMarks(items, days, now);
  const { overdue, due, undated } = groupForDay(items, selected, now);
  const proposedCount = items.filter((i) => i.status === "proposed").length;
  const isDemo = items.some((i) => i.source === "demo");
  const selectedDay = days.find((d) => d.key === selected);
  const nothing = overdue.length + due.length + undated.length === 0;

  return (
    <AppShell reviewCount={proposedCount} isDemo={isDemo} onReset={reset} onSignOut={signOut} error={error}>
      <div className="titlerow">
        <h1 className="page-title">{selected === today ? "Today" : `${selectedDay?.label} ${selectedDay?.num}`}</h1>
        <Link className="b" href="/add">+ Add</Link>
      </div>
      <NotifyCard />
      <div className="strip" role="tablist" aria-label="This week">
        {days.map((d) => {
          const m = marks[d.key];
          return (
            <button
              key={d.key}
              role="tab"
              aria-selected={d.key === selected}
              className={`day ${d.key === selected ? "sel" : ""} ${m.late ? "late" : ""} ${m.count ? "has" : ""}`}
              onClick={() => setSelected(d.key)}
            >
              <span>{d.label}</span>
              <b>{d.num}</b>
              <i aria-label={m.count ? `${m.count} due${m.late ? ", some late" : ""}` : "nothing due"} />
            </button>
          );
        })}
      </div>
      {loading ? <p className="sub">Loading…</p> : null}
      {overdue.length ? <div className="grp late">Overdue</div> : null}
      {overdue.map((item) => <TodayCard key={item.id} item={item} now={now} late onChange={update} />)}
      {due.length ? <div className="grp">{selected === today ? "Due today" : "Due"}</div> : null}
      {due.map((item) => <TodayCard key={item.id} item={item} now={now} onChange={update} />)}
      {undated.length ? <div className="grp">No date</div> : null}
      {undated.map((item) => <TodayCard key={item.id} item={item} now={now} onChange={update} />)}
      {!loading && items.length === 0 ? (
        <div className="empty">
          <strong>Nothing here yet.</strong>
          <p>Catchit will fill this once your email is connected. Until then, <Link href="/add">add one yourself</Link>.</p>
        </div>
      ) : null}
      {!loading && items.length > 0 && nothing ? (
        <div className="empty">
          <strong>{selected === today ? "You're clear." : "Nothing due this day."}</strong>
          {proposedCount ? <p>{proposedCount} found by Catchit are waiting. <Link href="/review">Go to Review</Link></p> : <p>Pick another day above.</p>}
        </div>
      ) : null}
    </AppShell>
  );
}
