"use client";

import { useEffect, useState } from "react";

const KEY = "catchit-theme";
const OPTIONS = [["system", "Auto"], ["light", "Light"], ["dark", "Dark"]];

// Light, dark, or follow the phone. Saved on this device only.
export default function ThemePicker() {
  const [theme, setTheme] = useState("system");

  useEffect(() => {
    try {
      setTheme(localStorage.getItem(KEY) || "system");
    } catch {}
  }, []);

  const pick = (value) => {
    setTheme(value);
    try {
      if (value === "system") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, value);
    } catch {}
    if (value === "system") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = value;
  };

  return (
    <div className="theme-pick" role="group" aria-label="Appearance">
      {OPTIONS.map(([value, label]) => (
        <button key={value} type="button" aria-pressed={theme === value} onClick={() => pick(value)}>{label}</button>
      ))}
    </div>
  );
}
