"use client";

import { useState } from "react";
import { formatDeadline, relative, toLocalInput, fromLocalInput } from "../lib/when.mjs";

export default function ReviewCard({ item, now, onChange }) {
  const [editing, setEditing] = useState(false);
  const [action, setAction] = useState(item.action);
  const [myName, setMyName] = useState(item.my_name ?? "");
  const [when, setWhen] = useState(toLocalInput(item.deadline));

  const save = () => {
    onChange(item.id, {
      action: action.trim() || item.action,
      my_name: myName.trim() || null,
      deadline: fromLocalInput(when),
    });
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="card">
        <label className="field">What you need to do
          <input value={action} onChange={(e) => setAction(e.target.value)} />
        </label>
        <label className="field">My name for this (optional)
          <input value={myName} onChange={(e) => setMyName(e.target.value)} placeholder="For example: Infosys test" />
        </label>
        <label className="field">Deadline (India time)
          <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
        </label>
        <div className="btns">
          <button className="b p" onClick={save}>Save</button>
          <button className="b" onClick={() => setEditing(false)}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="act">{item.my_name || item.action}</div>
      {item.my_name ? <div className="orig">{item.action}</div> : null}
      <div className="orig">{[item.company, item.role].filter(Boolean).join(" · ")}</div>
      {item.deadline ? (
        <div className="meta">Due <span className="when">{formatDeadline(item.deadline, now)}</span> · {relative(item.deadline, now)}</div>
      ) : (
        <div className="meta"><span className="flag">No date found</span> Add one if you know it.</div>
      )}
      {item.evidence ? <blockquote className="quote">From your email: &ldquo;{item.evidence}&rdquo;</blockquote> : null}
      {item.confidence && item.confidence !== "high" ? <div className="meta">Catchit is not sure about this one. Please check it.</div> : null}
      <div className="btns">
        <button className="b p" onClick={() => onChange(item.id, { status: "confirmed" })}>Confirm</button>
        <button className="b" onClick={() => setEditing(true)}>Edit</button>
        <button className="b" onClick={() => onChange(item.id, { status: "dismissed" })}>Dismiss</button>
      </div>
    </div>
  );
}
