import Link from "next/link";
import DemoButton from "../components/DemoButton";
import Typewriter from "../components/Typewriter";
import Logo from "../components/Logo";

const CAUGHT = [
  "Do the assessment by Sat, 11:59 PM",
  "Join the interview Wed, 4:00 PM",
  "Submit the task by Mon, 10:00 AM",
];

const TICKER = ["Assessment links", "Interview invites", "Form deadlines", "Document uploads", "Task submissions", "Reschedules"];

export default function Home() {
  return (
    <div className="lp">
      <header className="lp-nav">
        <Logo />
        <Link href="/login" className="b">Sign in</Link>
      </header>

      <section className="lp-hero">
        <div className="lp-copy">
          <span className="kicker rise" style={{ "--d": "0ms" }}><i />For students applying to 10+ jobs</span>
          <h1 className="lp-h1 rise" style={{ "--d": "80ms" }}>
            Never miss the <span className="hl">test link</span> again.
          </h1>
          <p className="lp-lede rise" style={{ "--d": "160ms" }}>
            Catchit reads your job emails and finds every test, interview and deadline. You get one
            list, and a phone alert before each one is due.
          </p>
          <div className="lp-cta rise" style={{ "--d": "240ms" }}>
            <Link className="btn" href="/login">Connect my Gmail</Link>
            <DemoButton className="btn alt" />
          </div>
          <ul className="lp-note rise" style={{ "--d": "320ms" }}>
            <li>Free</li>
            <li>Read-only Gmail</li>
            <li>Demo needs no sign-up</li>
          </ul>
        </div>

        <div className="lp-phonewrap rise" style={{ "--d": "200ms" }}>
          <div className="phone" aria-label="Example of the Today screen">
            <div className="ph-top">Today <small>3 caught</small></div>
            <div className="ph-strip">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <span key={i} className={i === 2 ? "on" : ""}>{d}<b>{20 + i}</b></span>
              ))}
            </div>
            <div className="ph-card late"><small>Overdue</small>Reply to Amex recruiter</div>
            <div className="ph-card"><small>Today, 4:00 pm</small>Join the Webex interview</div>
            <div className="ph-card"><small>Sat, 11:59 pm</small>Skills assessment</div>
          </div>
          <div className="stk st1">📩 Found in your inbox</div>
          <div className="stk st2">⏰ Alert 2 hours before</div>
          <div className="caught-card">
            <div className="cc-tag"><i />Caught</div>
            <Typewriter lines={CAUGHT} />
            <div className="cc-q">&ldquo;Please complete it by 24 Oct, 11:59 PM IST.&rdquo;</div>
          </div>
        </div>
      </section>

      <div className="ticker" aria-hidden="true">
        <div className="track">
          {[...TICKER, ...TICKER, ...TICKER, ...TICKER].map((t, i) => <span key={i}>{t}</span>)}
        </div>
      </div>

      <section className="lp-how" id="how">
        <h2>How it works</h2>
        <p>Three steps, about a minute to set up.</p>
        <div className="bento">
          <article className="bx">
            <span className="step-no">STEP 1</span>
            <span className="n" aria-hidden="true">📬</span>
            <h3>Connect Gmail</h3>
            <p>Read-only. Only the last 14 days. We never send or delete anything.</p>
          </article>
          <article className="bx">
            <span className="step-no">STEP 2</span>
            <span className="n" aria-hidden="true">✅</span>
            <h3>Confirm what we found</h3>
            <p>See the exact sentence from the email. Confirm, edit or dismiss.</p>
          </article>
          <article className="bx">
            <span className="step-no">STEP 3</span>
            <span className="n" aria-hidden="true">⏰</span>
            <h3>Get nudged in time</h3>
            <p>A notification on your phone a day before and 2 hours before. One tap to add it to your calendar.</p>
          </article>
        </div>
      </section>

      <section className="lp-final">
        <h2>Your inbox has a deadline in it right now.</h2>
        <p>Find it before it finds you.</p>
        <div className="lp-cta">
          <Link className="btn" href="/login">Connect my Gmail</Link>
          <DemoButton className="btn alt" />
        </div>
      </section>

      <footer className="lp-foot">Read-only Gmail &middot; <Link href="/privacy">Privacy</Link> &middot; Built for the HelloPM Buildathon 2026</footer>
    </div>
  );
}
