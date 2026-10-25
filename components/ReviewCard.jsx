"use client";

import { useState } from "react";
import { toLocalInput, fromLocalInput } from "../lib/when.mjs";
import { CompanyLine, Due } from "./ItemBits";

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
        <label className="field">My name for this <small>(optional)</small>
          <input value={myName} onChange={(e) => setMyName(e.target.value)} placeholder="For example: Infosys test" />
        </label>
        <label className="field">Deadline <small>(India time)</small>
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
      <CompanyLine item={item} />
      <div className="act">{item.my_name || item.action}</div>
      {item.my_name ? <div className="orig">{item.action}</div> : null}
      {item.deadline ? (
        <Due item={item} now={now} />
      ) : (
        <div className="meta"><span className="flag">No date found</span> Tap Edit to add one if you know it.</div>
      )}
      {item.evidence ? <blockquote className="quote"><span>From your email</span>&ldquo;{item.evidence}&rdquo;</blockquote> : null}
      {item.confidence && item.confidence !== "high" ? <div className="meta unsure"><span className="flag warn">Please check</span> Catchit is not sure about this one.</div> : null}
      <div className="btns">
        <button className="b p" onClick={() => onChange(item.id, { status: "confirmed" })}>Confirm</button>
        <button className="b" onClick={() => setEditing(true)}>Edit</button>
        <button className="b ghost" onClick={() => onChange(item.id, { status: "dismissed" })}>Dismiss</button>
      </div>
    </div>
  );
}
