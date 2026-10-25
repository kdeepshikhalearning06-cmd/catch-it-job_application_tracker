"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startDemo } from "../lib/demo.mjs";

export default function DemoButton({ className = "btn" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const go = async () => {
    setBusy(true);
    setMessage("");
    try {
      await startDemo();
      router.push("/today");
    } catch (err) {
      setMessage(err.message);
      setBusy(false);
    }
  };

  return (
    <>
      <button className={className} onClick={go} disabled={busy}>{busy ? "Opening the demo…" : "Try the demo"}</button>
      {message ? <p className="note error-text">{message}</p> : null}
    </>
  );
}
