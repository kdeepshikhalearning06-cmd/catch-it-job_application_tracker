"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "../../components/AppShell";
import { useItems } from "../../lib/useItems";
import { fromLocalInput } from "../../lib/when.mjs";

export default function AddPage() {
  const router = useRouter();
  const { items, error, add, reset, signOut } = useItems();
  const [action, setAction] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [when, setWhen] = useState("");
  const [link, setLink] = useState("");
  const [saving, setSaving] = useState(false);
  const [problem, setProblem] = useState("");

  const save = async (e) => {
    e.preventDefault();
    if (!action.trim()) {
      setProblem("Write what you need to do.");
      return;
    }
    setSaving(true);
    setProblem("");
    try {
      await add({
        action: action.trim(),
        company: company.trim() || null,
        role: role.trim() || null,
        deadline: fromLocalInput(when),
        link: link.trim() || null,
      });
      router.push("/today");
    } catch (err) {
      setProblem(err.message);
      setSaving(false);
    }
  };

  return (
    <AppShell reviewCount={items.filter((i) => i.status === "proposed").length} isDemo={items.some((i) => i.source === "demo")} onReset={reset} onSignOut={signOut} error={error}>
      <h1 className="page-title">Add one yourself</h1>
      <p className="sub">For things that did not come by email, like a call or a WhatsApp message.</p>
      <form className="card" onSubmit={save}>
        <label className="field">What you need to do
          <input value={action} onChange={(e) => setAction(e.target.value)} placeholder="For example: Send the case study" />
        </label>
        <label className="field">Company (optional)
          <input value={company} onChange={(e) => setCompany(e.target.value)} />
        </label>
        <label className="field">Role (optional)
          <input value={role} onChange={(e) => setRole(e.target.value)} />
        </label>
        <label className="field">Deadline, India time (optional)
          <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
        </label>
        <label className="field">Link (optional)
          <input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://" />
        </label>
        {problem ? <p className="error-text">{problem}</p> : null}
        <div className="btns">
          <button className="b p" type="submit" disabled={saving}>{saving ? "Saving…" : "Add to Today"}</button>
          <Link className="b" href="/today">Cancel</Link>
        </div>
      </form>
    </AppShell>
  );
}
