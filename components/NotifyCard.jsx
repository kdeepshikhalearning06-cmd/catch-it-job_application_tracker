"use client";

import { useEffect, useState } from "react";
import { pushSupported, isIos, isInstalled, currentSubscription, registerWorker, turnOn, turnOff, sendTest } from "../lib/notify";

// Lets the person turn on phone or browser reminders for this device, and send themselves a test.
export default function NotifyCard({ full = false }) {
  const [state, setState] = useState("checking");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    (async () => {
      if (!pushSupported()) return setState(isIos() && !isInstalled() ? "ios-install" : "unsupported");
      await registerWorker().catch(() => {});
      if (Notification.permission === "denied") return setState("blocked");
      const sub = await currentSubscription().catch(() => null);
      setState(sub && Notification.permission === "granted" ? "on" : "off");
    })();
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const run = (fn) => async () => {
    setBusy(true);
    setNote("");
    try {
      await fn();
    } catch (err) {
      if (err.message === "blocked") setState("blocked");
      else setNote(err.message);
    }
    setBusy(false);
  };

  const enable = run(async () => {
    await turnOn();
    setState("on");
    await sendTest();
    setNote("Done. A test reminder is on its way. If Chrome marks it as possible spam, open it and choose to allow Catchit. It's new, so Chrome doesn't know it yet.");
  });
  const test = run(async () => {
    await sendTest();
    setNote("Sent. It should appear in a few seconds.");
  });
  const disable = run(async () => {
    await turnOff();
    setState("off");
  });
  const install = async () => {
    installPrompt.prompt();
    await installPrompt.userChoice.catch(() => {});
    setInstallPrompt(null);
  };

  if (state === "checking") return null;

  if (state === "on" && !full) {
    return (
      <div className="notify on">
        <span>🔔 Reminders are on for this device.</span>
        <button className="linkbtn" onClick={test} disabled={busy}>{busy ? "Sending…" : "Send a test"}</button>
        {note ? <div className="notify-note">{note}</div> : null}
      </div>
    );
  }

  return (
    <div className={`notify ${state === "blocked" ? "blocked" : ""}`}>
      <span className="bell" aria-hidden="true">{state === "blocked" ? "🔕" : "🔔"}</span>
      <div className="body">
        <strong>{state === "on" ? "Reminders are on for this device" : state === "blocked" ? "Notifications are blocked" : "Get a nudge before it's due"}</strong>
        {state === "off" || state === "on" ? (
          <p>A notification a day before and 2 hours before each deadline, and when Catchit finds something new in your email.{state === "off" ? " Your browser will ask for permission: tap Allow." : ""}</p>
        ) : null}
        {state === "ios-install" ? (
          <ol className="steps">
            <li>Tap the <b>Share</b> button in Safari.</li>
            <li>Choose <b>Add to Home Screen</b>.</li>
            <li>Open Catchit from your Home Screen and turn on reminders there.</li>
          </ol>
        ) : null}
        {state === "unsupported" ? <p>This browser can&rsquo;t show reminders. Open Catchit in Chrome, or add your deadlines to Google Calendar from each card.</p> : null}
        {state === "blocked" ? <p>Tap the icon to the left of the web address, open Permissions (or Site settings), set Notifications to Allow, then reload this page.</p> : null}
        <div className="btns">
          {state === "off" ? <button className="b p" onClick={enable} disabled={busy}>{busy ? "Turning on…" : "Turn on reminders"}</button> : null}
          {state === "on" ? <button className="b" onClick={test} disabled={busy}>{busy ? "Sending…" : "Send a test"}</button> : null}
          {state === "on" && full ? <button className="b" onClick={disable} disabled={busy}>Turn off on this device</button> : null}
          {installPrompt && !isInstalled() ? <button className="b" onClick={install}>Add to Home Screen</button> : null}
        </div>
        {note ? <div className="notify-note">{note}</div> : null}
      </div>
    </div>
  );
}
