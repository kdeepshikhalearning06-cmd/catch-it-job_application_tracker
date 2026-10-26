"use client";

import { useEffect, useState } from "react";

const KEY = "catchit-guide-done";

const STEPS = [
  { title: "Catchit reads your job emails", text: "It finds every test, interview and deadline companies sent you, and puts them in Review." },
  { title: "Check each one in Review", text: "Each card shows the exact sentence from the email. Tap Confirm if it's right, Edit to fix it, or Dismiss if it's not for you." },
  { title: "Today is your to-do list", text: "Confirmed items show on Today, day by day. Anything overdue turns red." },
  { title: "Turn on reminders", text: "When you've checked your cards, tap \"Turn on reminders\" and allow notifications. You'll get an alert a day before and 2 hours before each deadline." },
];

// A short walkthrough shown the first time someone opens the app, on Review or Today.
export default function FirstRunGuide({ isDemo }) {
  const [step, setStep] = useState(-1);

  useEffect(() => {
    let done = false;
    try {
      done = localStorage.getItem(KEY) === "1";
    } catch {}
    if (!done) setStep(0);
  }, []);

  const finish = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
    setStep(-1);
  };

  if (step < 0) return null;
  const s = STEPS[step];
  const last = step === STEPS.length - 1;
  return (
    <div className="guide" role="dialog" aria-label="How Catchit works">
      <div className="step">How it works · {step + 1} of {STEPS.length}</div>
      <h2>{s.title}</h2>
      <p>{s.text}{step === 0 && isDemo ? " This demo uses sample emails, so try anything." : ""}</p>
      <div className="dots" aria-hidden="true">{STEPS.map((_, i) => <i key={i} className={i === step ? "on" : ""} />)}</div>
      <div className="btns">
        <button className="b p" onClick={last ? finish : () => setStep(step + 1)}>{last ? "Got it" : "Next"}</button>
        {step > 0 ? <button className="b" onClick={() => setStep(step - 1)}>Back</button> : null}
        {!last ? <button className="linkbtn" onClick={finish}>Skip</button> : null}
      </div>
    </div>
  );
}
