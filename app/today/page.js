"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "../../components/AppShell";
import NotifyCard from "../../components/NotifyCard";
import { CompanyLine } from "../../components/ItemBits";
import CalendarButton from "../../components/CalendarButton";
import { useItems } from "../../lib/useItems";
import { dayKey, weekOf, dayMarks, groupForDay, relative, tomorrowStart, isHidden, summary, countdown, dayWord, clock, formatDeadline } from "../../lib/when.mjs";

const STAGE = { applied: "Applied", assessment: "Assessment", interview: "Interview", offer: "Offer", rejected: "Rejected" };

function TodayCard({ item, now, late, onChange }) {
  const soon = !late && item.deadline && Date.parse(item.deadline) - now.getTime() < 2 * 24 * 3600 * 1000;
  return (
    <div className="trow">
      <div className={`tm ${late ? "late" : ""}`}>
        {item.deadline ? <>{clock(item.deadline)}<small>{dayWord(item.deadline, now)}</small></> : <small>No date</small>}
      </div>
      <div className={`card ${late ? "late" : ""}`}>
        <CompanyLine item={item} />
        <Link className="act" href={`/item/${item.id}`}>{item.my_name || item.action}</Link>
        {item.my_name ? <div className="orig">{item.action}</div> : null}
        <div className="chips">
          {item.deadline ? (
            <span className={`pill ${late ? "" : soon ? "soon" : ""}`}>{late ? relative(item.deadline, now).replace(" ago", " late") : relative(item.deadline, now)}</span>
          ) : null}
          {STAGE[item.stage] ? <span className="pill">{STAGE[item.stage]}</span> : null}
        </div>
        <div className="btns">
          <button className="b p" onClick={() => onChange(item.id, { status: "done" })}>Done</button>
          <button className="b" onClick={() => onChange(item.id, { snoozed_until: tomorrowStart(now) })}>Snooze</button>
          {item.link ? <a className="b" href={item.link} target="_blank" rel="noreferrer">Open link</a> : null}
          {!late ? <CalendarButton item={item} /> : null}
        </div>
      </div>
    </div>
  );
}

const backWord = (iso, now) => {
  const w = dayWord(iso, now);
  return w === "Today" || w === "Tomorrow" ? w.toLowerCase() : `on ${w}`;
};

const Group = ({ title, items, late, now, onChange }) =>
  items.length ? (
    <>
      <div className={`grp ${late ? "late" : ""}`}>{title} <span className="count">{items.length}</span></div>
      {items.map((item) => <TodayCard key={item.id} item={item} now={now} late={late} onChange={onChange} />)}
    </>
  ) : null;

export default function TodayPage() {
  const { loading, items, error, update, reset, signOut, isDemo } = useItems();
  const [now] = useState(() => new Date());
  // After a snooze, a short bar says when it comes back and offers Undo.
  const [undo, setUndo] = useState(null);
  useEffect(() => {
    if (!undo) return;
    const t = setTimeout(() => setUndo(null), 6000);
    return () => clearTimeout(t);
  }, [undo]);
  const change = (id, patch) => {
    update(id, patch);
    if (patch.snoozed_until) setUndo(items.find((i) => i.id === id) ?? null);
  };
  const snoozed = items.filter((i) => i.status === "confirmed" && isHidden(i, now));
  const today = dayKey(now);
  const [selected, setSelected] = useState(today);
  const days = weekOf(now);
  const marks = dayMarks(items, days, now);
  const { overdue, due, undated } = groupForDay(items, selected, now);
  const s = summary(items, now);
  const selectedDay = days.find((d) => d.key === selected);
  const isToday = selected === today;
  const comingUp = isToday ? s.comingUp : [];
  const nothing = overdue.length + due.length + undated.length + comingUp.length === 0;
  const dateLine = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", timeZone: "Asia/Kolkata" });

  return (
    <AppShell reviewCount={s.toCheck} isDemo={isDemo} onReset={reset} onSignOut={signOut} error={error}>
      <p className="dateline">{dateLine}</p>
      <h1 className="headline">
        {s.overdue ? <span className="r">{s.overdue} overdue. </span> : null}
        {s.week ? `${s.week} due this week.` : s.overdue ? null : "You're clear this week."}
      </h1>

      <div className="tiles">
        <div className={`tile ${s.overdue ? "r" : ""}`}><b>{s.overdue}</b><span>Overdue</span></div>
        <div className="tile"><b>{s.today}</b><span>Today</span></div>
        <div className="tile"><b>{s.week}</b><span>This week</span></div>
        <Link href="/review" className={`tile ${s.toCheck ? "y" : ""}`}><b>{s.toCheck}</b><span>To check</span></Link>
      </div>

      {s.next ? (
        <div className="nextup">
          <div className="lab">Next up</div>
          <Link className="nx-title" href={`/item/${s.next.id}`}>{s.next.my_name || s.next.action}</Link>
          <div className="nx-co">{[s.next.company, s.next.role].filter(Boolean).join(" · ")}</div>
          <div className="nx-row">
            <div><b>{countdown(s.next.deadline, now)}</b><small>{formatDeadline(s.next.deadline, now)}</small></div>
            {s.next.link ? <a className="nx-btn" href={s.next.link} target="_blank" rel="noreferrer">Open link</a> : <Link className="nx-btn" href={`/item/${s.next.id}`}>Details</Link>}
          </div>
        </div>
      ) : null}

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
      <Group title="Overdue" items={overdue} late now={now} onChange={change} />
      <Group title={isToday ? "Due today" : `Due ${selectedDay?.label} ${selectedDay?.num}`} items={due} now={now} onChange={change} />
      <Group title="Coming up" items={comingUp} now={now} onChange={change} />
      <Group title="No date" items={undated} now={now} onChange={change} />

      {!loading && items.length === 0 ? (
        <div className="empty">
          <span className="ic" aria-hidden="true">📭</span>
          <strong>Nothing here yet.</strong>
          <p>Catchit will fill this once your email is connected. Until then, <Link href="/add">add one yourself</Link>.</p>
        </div>
      ) : null}
      {!loading && items.length > 0 && nothing ? (
        <div className="empty">
          <span className="ic" aria-hidden="true">{isToday ? "🎉" : "🗓️"}</span>
          <strong>{isToday ? "You're clear." : "Nothing due this day."}</strong>
          {s.toCheck ? <p>{s.toCheck} found by Catchit are waiting. <Link href="/review">Go to Review</Link></p> : <p>Pick another day above.</p>}
        </div>
      ) : null}

      {snoozed.length ? (
        <>
          <div className="grp">Snoozed <span className="count">{snoozed.length}</span></div>
          {snoozed.map((item) => (
            <div key={item.id} className="snz">
              <div>
                <b>{item.my_name || item.action}</b>
                <small>Back {backWord(item.snoozed_until, now)} · {item.deadline ? `due ${formatDeadline(item.deadline, now)}` : "no date"}</small>
              </div>
              <button className="b" onClick={() => update(item.id, { snoozed_until: null })}>Unsnooze</button>
            </div>
          ))}
        </>
      ) : null}

      {undo ? (
        <div className="toast" role="status">
          <span>Snoozed until tomorrow morning.</span>
          <button onClick={() => { update(undo.id, { snoozed_until: null }); setUndo(null); }}>Undo</button>
        </div>
      ) : null}

      <Link href="/add" className="fab" aria-label="Add a task">
        {/* Drawn, not typed: a "+" character sits off-centre in most fonts. */}
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
      </Link>
    </AppShell>
  );
}
