"use client";

import { useEffect, useState } from "react";

// Types each line, waits, then moves to the next. Shows the first line at once if motion is reduced.
export default function Typewriter({ lines }) {
  const [text, setText] = useState(lines[0]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let line = 0;
    let shown = 0;
    let timer;
    const tick = () => {
      const full = lines[line];
      if (shown < full.length) {
        shown += 1;
        setText(full.slice(0, shown));
        timer = setTimeout(tick, 34);
      } else {
        timer = setTimeout(() => {
          line = (line + 1) % lines.length;
          shown = 0;
          setText("");
          timer = setTimeout(tick, 400);
        }, 2200);
      }
    };
    setText("");
    timer = setTimeout(tick, 900);
    return () => clearTimeout(timer);
  }, [lines]);

  return (
    <p className="typed" aria-live="off">
      <span>{text}</span>
      <i className="caret" aria-hidden="true" />
    </p>
  );
}
