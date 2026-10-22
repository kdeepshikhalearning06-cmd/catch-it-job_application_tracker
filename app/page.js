import Link from "next/link";
import DemoButton from "../components/DemoButton";
import Typewriter from "../components/Typewriter";

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
        <span className="lp-logo">Catchit<b aria-hidden="true">✳︎</b></span>
        <Link href="/login" className="lp-login">Log in</Link>
      </header>

      <section className="lp-hero">
        <div className="lp-copy">
          <span className="sticker s-green pop" style={{ "--d": "0ms" }}>For people applying to 10+ jobs</span>
          <h1 className="lp-h1">
            <span className="line"><span>Never miss</span></span>
            <span className="line"><span>the <mark>test link</mark></span></span>
            <span className="line"><span>again.</span></span>
          </h1>
          <p className="lp-lede pop" style={{ "--d": "500ms" }}>
            Recruiters bury deadlines in long emails. Catchit digs out every test, interview and
            deadline, and puts it on one list with an alarm on your phone.
          </p>
          <div className="lp-cta pop" style={{ "--d": "650ms" }}>
            <DemoButton />
            <a className="lp-ghost" href="#how">How it works ↓</a>
          </div>
          <p className="lp-note pop" style={{ "--d": "750ms" }}>No sign-up for the demo. Sample emails only.</p>
        </div>

        <div className="lp-phonewrap pop" style={{ "--d": "300ms" }}>
          <div className="phone" aria-label="Example of the Today screen">
            <div className="ph-top">Today</div>
            <div className="ph-strip">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <span key={i} className={i === 2 ? "on" : ""}>{d}<b>{20 + i}</b></span>
              ))}
            </div>
            <div className="ph-card late"><small>Overdue</small>Reply to Amex recruiter</div>
            <div className="ph-card"><small>Today, 4:00 pm</small>Join the Webex interview</div>
            <div className="ph-card"><small>Sat, 11:59 pm</small>Skills assessment</div>
          </div>
          <div className="stk st1">📩 3 caught from your inbox</div>
          <div className="stk st2">⏰ Alarm 2 hours before</div>
          <div className="caught-card">
            <div className="cc-tag"><i />Caught</div>
            <Typewriter lines={CAUGHT} />
            <div className="cc-q">&ldquo;Please complete it by 24 Oct, 11:59 PM IST.&rdquo;</div>
          </div>
        </div>
      </section>

      <div className="ticker" aria-hidden="true">
        <div className="track">
          {[...TICKER, ...TICKER, ...TICKER, ...TICKER].map((t, i) => <span key={i}>{t} ✳︎</span>)}
        </div>
      </div>

      <section className="lp-how" id="how">
        <h2>Three taps. That&rsquo;s it.</h2>
        <div className="bento">
          <article className="bx b-green">
            <span className="n">1</span>
            <h3>Connect Gmail</h3>
            <p>Read-only. Only the last 14 days. We never send or delete anything.</p>
          </article>
          <article className="bx b-cream">
            <span className="n">2</span>
            <h3>Confirm what we found</h3>
            <p>See the exact sentence from the email. Confirm, edit or dismiss.</p>
          </article>
          <article className="bx b-red">
            <span className="n">3</span>
            <h3>Get nudged in time</h3>
            <p>One list for today. A phone alarm. One email the morning it&rsquo;s due.</p>
          </article>
        </div>
      </section>

      <section className="lp-final">
        <h2>Your inbox has a deadline in it right now.</h2>
        <DemoButton />
      </section>

      <footer className="lp-foot">Read-only Gmail &middot; Built for the HelloPM Buildathon 2026</footer>
    </div>
  );
}
