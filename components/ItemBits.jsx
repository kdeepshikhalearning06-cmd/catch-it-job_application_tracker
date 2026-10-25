import { formatDeadline, relative } from "../lib/when.mjs";

const COLORS = ["#046a38", "#1f5fa8", "#8a3ffc", "#b45309", "#0e7490", "#be185d"];

// Company initial on a colour picked from the name, so the same company always looks the same.
export function CompanyLine({ item, fallback = "" }) {
  const name = item.company || "";
  const text = [item.company, item.role].filter(Boolean).join(" · ") || fallback;
  if (!text) return null;
  const color = COLORS[[...name].reduce((n, c) => n + c.charCodeAt(0), 0) % COLORS.length];
  return (
    <div className="company">
      {name ? <span className="avatar" style={{ background: color }} aria-hidden="true">{name.trim()[0].toUpperCase()}</span> : null}
      <span>{text}</span>
    </div>
  );
}

export function Due({ item, now, late = false }) {
  if (!item.deadline) return null;
  const soon = !late && Date.parse(item.deadline) - now.getTime() < 2 * 24 * 3600 * 1000;
  return (
    <div className="meta">
      <span>{late ? "Was due" : "Due"}</span>
      <span className="when">{formatDeadline(item.deadline, now)}</span>
      <span className={`pill ${soon ? "soon" : ""}`}>{relative(item.deadline, now)}</span>
    </div>
  );
}
