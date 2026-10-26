"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AppShell from "../../../components/AppShell";
import { useItems } from "../../../lib/useItems";
import { formatDeadline, relative, toLocalInput, fromLocalInput } from "../../../lib/when.mjs";
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
  const [editing, setEditing] = useState(null);

  const startEdit = () =>
    setEditing({
      action: item.action ?? "",
      my_name: item.my_name ?? "",
      company: item.company ?? "",
      when: toLocalInput(item.deadline),
      link: item.link ?? "",
    });

  const saveEdit = async () => {
    const link = editing.link.trim();
    if (link && !/^https?:\/\//i.test(link)) return setProblem("Links need to start with https://");
    setProblem("");
    try {
      await update(item.id, {
        action: editing.action.trim() || item.action,
        my_name: editing.my_name.trim() || null,
        company: editing.company.trim() || null,
        deadline: fromLocalInput(editing.when),
        link: link || null,
      });
      setEditing(null);
    } catch (err) {
      setProblem(err.message);
    }
  };
  const field = (key) => ({ value: editing[key], onChange: (e) => setEditing({ ...editing, [key]: e.target.value }) });

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
      {item && editing ? (
        <div className="card detail">
          <h1>Edit this task</h1>
          <label className="field">What you need to do
            <input {...field("action")} />
          </label>
          <label className="field">My name for this <small>(optional)</small>
            <input {...field("my_name")} placeholder="For example: Infosys test" />
          </label>
          <label className="field">Company
            <input {...field("company")} />
          </label>
          <label className="field">Deadline <small>(India time)</small>
            <input type="datetime-local" {...field("when")} />
          </label>
          <label className="field">Link <small>(optional)</small>
            <input type="url" {...field("link")} placeholder="https://" />
          </label>
          {problem ? <p className="error-text">{problem}</p> : null}
          <div className="btns">
            <button className="b p" onClick={saveEdit}>Save</button>
            <button className="b" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </div>
      ) : null}
      {item && !editing ? (
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
            <button className="b" onClick={startEdit}>Edit</button>
            <CalendarButton item={item} />
            <button className="b danger" onClick={del}>Delete</button>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
