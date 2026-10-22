"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AppShell from "../../../components/AppShell";
import { useItems } from "../../../lib/useItems";
import { formatDeadline, relative } from "../../../lib/when.mjs";

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
  const { loading, items, error, update, remove, reset, signOut } = useItems();
  const [now] = useState(() => new Date());
  const item = items.find((i) => String(i.id) === String(id));
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
    <AppShell reviewCount={items.filter((i) => i.status === "proposed").length} isDemo={items.some((i) => i.source === "demo")} onReset={reset} onSignOut={signOut} error={error}>
      <p className="sub"><Link href="/today">← Back to Today</Link></p>
      {loading ? <p className="sub">Loading…</p> : null}
      {!loading && !item ? (
        <div className="empty"><strong>We could not find this one.</strong><p>It may have been deleted. <Link href="/today">Go to Today</Link></p></div>
      ) : null}
      {item ? (
        <div className="card">
          <div className="act">{item.my_name || item.action}</div>
          {item.my_name ? <div className="orig">{item.action}</div> : null}
          <div className="orig">{[item.company, item.role].filter(Boolean).join(" · ") || "No company added"}</div>
          {item.deadline ? (
            <div className="meta">Due <span className="when">{formatDeadline(item.deadline, now)}</span> · {relative(item.deadline, now)}</div>
          ) : (
            <div className="meta">No date set</div>
          )}
          {item.evidence ? <blockquote className="quote">From the email: &ldquo;{item.evidence}&rdquo;</blockquote> : null}
          <label className="field" style={{ marginTop: 12 }}>Where you are with this company
            <select className="select" value={item.stage} onChange={(e) => update(item.id, { stage: e.target.value })}>
              {STAGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <label className="field">Notes (for example, which CV you sent)
            <textarea className="area" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => notes !== (item.notes ?? "") && update(item.id, { notes: notes.trim() || null })} />
          </label>
          {problem ? <p className="error-text">{problem}</p> : null}
          <div className="btns">
            {item.status !== "done" ? (
              <button className="b p" onClick={() => update(item.id, { status: "done" })}>Mark done</button>
            ) : (
              <button className="b" onClick={() => update(item.id, { status: "confirmed" })}>Mark not done</button>
            )}
            {item.link ? <a className="b" href={item.link} target="_blank" rel="noreferrer">Open link</a> : null}
            <button className="b" onClick={del}>Delete</button>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
