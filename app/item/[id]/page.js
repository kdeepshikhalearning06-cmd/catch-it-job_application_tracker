"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AppShell from "../../../components/AppShell";
import { useItems } from "../../../lib/useItems";
import { formatDeadline, relative } from "../../../lib/when.mjs";
import CalendarButton from "../../../components/CalendarButton";
import { CompanyLine } from "../../../components/ItemBits";

const STAGES = [
  ["applied", "Applied"],
  ["assessment", "Assessment"],
  ["interview", "Interview"],
  ["offer", "Offer"],
  ["rejected", "Rejected"],
];

export default function ItemPage() {
  const { id } = useParams();
  const router = useRouter();
  const { loading, items, error, update, remove, reset, signOut, isDemo } = useItems();
  const [now] = useState(() => new Date());
  const item = items.find((i) => String(i.id) === String(id));
  const late = Boolean(item?.deadline && item.status !== "done" && Date.parse(item.deadline) < now.getTime());
  const [notes, setNotes] = useState("");
  const [problem, setProblem] = useState("");

  useEffect(() => {
    if (item) setNotes(item.notes ?? "");
  }, [item?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const del = async () => {
    try {
      await remove(item.id);
      router.push("/today");
    } catch (err) {
      setProblem(err.message);
    }
  };

  return (
    <AppShell reviewCount={items.filter((i) => i.status === "proposed").length} isDemo={isDemo} onReset={reset} onSignOut={signOut} error={error}>
      <Link className="back" href="/today">← Back to Today</Link>
      {loading ? <p className="sub">Loading…</p> : null}
      {!loading && !item ? (
        <div className="empty"><span className="ic" aria-hidden="true">🔎</span><strong>We couldn&rsquo;t find this one.</strong><p>It may have been deleted. <Link href="/today">Go to Today</Link></p></div>
      ) : null}
      {item ? (
        <div className={`card detail ${late ? "late" : ""}`}>
          <CompanyLine item={item} fallback="No company added" />
          <h1>{item.my_name || item.action}</h1>
          {item.my_name ? <div className="orig">{item.action}</div> : null}
          <div className="facts">
            <div className={`fact ${late ? "late" : ""}`}>
              <span>{late ? "Was due" : "Due"}</span>
              <b>{item.deadline ? formatDeadline(item.deadline, now) : "No date set"}</b>
              {item.deadline ? <div className="orig">{relative(item.deadline, now)}</div> : null}
            </div>
            <div className="fact">
              <span>Status</span>
              <b>{item.status === "done" ? "Done" : item.status === "proposed" ? "Waiting in Review" : "To do"}</b>
            </div>
          </div>
          {item.evidence ? <blockquote className="quote"><span>From the email</span>&ldquo;{item.evidence}&rdquo;</blockquote> : null}
          <div className="section-label">Your notes</div>
          <label className="field">Where you are with this company
            <select className="select" value={item.stage} onChange={(e) => update(item.id, { stage: e.target.value })}>
              {STAGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <label className="field">Notes <small>(for example, which CV you sent)</small>
            <textarea className="area" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => notes !== (item.notes ?? "") && update(item.id, { notes: notes.trim() || null })} placeholder="Saved when you tap outside the box" />
          </label>
          {problem ? <p className="error-text">{problem}</p> : null}
          <div className="btns">
            {item.status !== "done" ? (
              <button className="b p" onClick={() => update(item.id, { status: "done" })}>Mark done</button>
            ) : (
              <button className="b" onClick={() => update(item.id, { status: "confirmed" })}>Mark not done</button>
            )}
            {item.link ? <a className="b" href={item.link} target="_blank" rel="noreferrer">Open link</a> : null}
            <CalendarButton item={item} />
            <button className="b danger" onClick={del}>Delete</button>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
