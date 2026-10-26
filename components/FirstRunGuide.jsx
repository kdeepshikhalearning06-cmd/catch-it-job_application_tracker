"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";

// A live tour shown the first time someone opens Review or Today. Each step puts a ring around
// the real thing on screen and explains it in a bubble next to it. Steps whose target isn't on
// the page (no cards yet, reminders not supported) are skipped.
const TOURS = {
  "/review": {
    ready: ".card, .empty",
    steps: [
      { target: ".content .card", title: "Catchit found this in your email", text: "Each card shows the task, the deadline and the exact sentence from the email, so you can check it." },
      { target: ".content .card .b.p", title: "Confirm it", text: "Tap Confirm if it's right. Edit to fix it, or Dismiss if it isn't for you." },
      { target: '.tabs a[href="/today"]', title: "Then open Today", text: "Everything you confirm goes to Today, with what's next and a countdown. Turn on reminders there." },
    ],
  },
  "/today": {
    ready: ".strip",
    steps: [
      { target: ".nextup", title: "Your next deadline", text: "The closest task, with a countdown. Tap it to edit it or add it to your calendar." },
      { target: ".notify", title: "Turn on reminders", text: "Tap Turn on reminders and allow notifications. Catchit nudges your phone a day before and 2 hours before each deadline." },
      { target: ".strip", title: "Your week", text: "Tap a day to see what's due. A red dot means something is late." },
      { target: ".fab", title: "Add your own", text: "Got a task on WhatsApp or LinkedIn? Add it here and it's reminded too." },
    ],
  },
};

const keyFor = (path) => `catchit-tour-${path.slice(1)}`;

// Clears this device's "tour seen" marks so the tour plays again on Review and Today.
export function replayTour() {
  try {
    Object.keys(TOURS).forEach((path) => localStorage.removeItem(keyFor(path)));
    localStorage.removeItem("catchit-guide-done");
  } catch {}
}
const GAP = 12;

export default function FirstRunGuide({ isDemo }) {
  const path = usePathname();
  const tour = TOURS[path];
  const [steps, setSteps] = useState(null);
  const [step, setStep] = useState(0);
  const [box, setBox] = useState(null);

  // Wait for the page to render its content, then keep only the steps that have something to point at.
  useEffect(() => {
    if (!tour) return;
    try {
      // Shown once per device. Someone who already finished the old text guide here isn't new.
      if (localStorage.getItem(keyFor(path)) === "1" || localStorage.getItem("catchit-guide-done") === "1") return;
    } catch {}
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      if (!document.querySelector(tour.ready) && tries < 30) return;
      clearInterval(timer);
      // A short pause so late parts (like the reminders card) have appeared.
      setTimeout(() => {
        const found = tour.steps.filter((s) => document.querySelector(s.target));
        if (found.length) {
          setStep(0);
          setSteps(found);
        }
      }, 700);
    }, 300);
    return () => clearInterval(timer);
  }, [path, tour]);

  const measure = useCallback(() => {
    const el = steps && document.querySelector(steps[step]?.target);
    if (!el) return setBox(null);
    const r = el.getBoundingClientRect();
    setBox({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [steps, step]);

  useLayoutEffect(() => {
    if (!steps) return;
    const el = document.querySelector(steps[step]?.target);
    el?.scrollIntoView({ block: "center", behavior: "instant" });
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [steps, step, measure]);

  const finish = () => {
    try {
      localStorage.setItem(keyFor(path), "1");
    } catch {}
    setSteps(null);
  };

  if (!steps || !box) return null;
  const s = steps[step];
  const last = step === steps.length - 1;
  const ring = { top: box.top - 6, left: box.left - 6, width: box.width + 12, height: box.height + 12 };
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = Math.min(340, vw - 32);
  const left = Math.max(16, Math.min(box.left + box.width / 2 - width / 2, vw - width - 16));
  const below = box.top + box.height + GAP + 190 < vh || box.top < vh / 2;
  const bubble = below ? { top: box.top + box.height + GAP, left, width } : { bottom: vh - box.top + GAP, left, width };

  return createPortal(
    <div className="tour" role="dialog" aria-label="How Catchit works">
      {/* Four dim panels around the target leave it lit, with a ring on top. */}
      <div className="tour-dim" style={{ top: 0, left: 0, right: 0, height: Math.max(0, ring.top) }} />
      <div className="tour-dim" style={{ top: ring.top + ring.height, left: 0, right: 0, bottom: 0 }} />
      <div className="tour-dim" style={{ top: ring.top, left: 0, width: Math.max(0, ring.left), height: ring.height }} />
      <div className="tour-dim" style={{ top: ring.top, left: ring.left + ring.width, right: 0, height: ring.height }} />
      <div className="tour-ring" style={ring} />
      <div className="tour-tip" style={bubble}>
        <div className="step">{step + 1} of {steps.length}</div>
        <h2>{s.title}</h2>
        <p>{s.text}{step === 0 && isDemo ? " This demo uses sample emails, so try anything." : ""}</p>
        <div className="btns">
          <button className="b p" onClick={last ? finish : () => setStep(step + 1)}>{last ? "Got it" : "Next"}</button>
          {step > 0 ? <button className="b" onClick={() => setStep(step - 1)}>Back</button> : null}
          {!last ? <button className="linkbtn" onClick={finish}>Skip tour</button> : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
