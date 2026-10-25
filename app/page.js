import Link from "next/link";
import DemoButton from "../components/DemoButton";
import Logo, { Wordmark } from "../components/Logo";

const MailIcon = () => (
  <svg viewBox="0 0 56 56" aria-hidden="true">
    <rect className="ic-tile" width="56" height="56" rx="16" />
    <rect className="ic-paper" x="11" y="17" width="30" height="22" rx="5" strokeWidth="2.4" />
    <path className="ic-line" d="M12.5 19.5l13.5 10 13.5-10" fill="none" strokeWidth="2.4" strokeLinejoin="round" />
    <circle cx="41" cy="37" r="8" fill="#046a38" />
    <path d="M37.2 37.2l2.6 2.5 4.3-4.6" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const QuoteIcon = () => (
  <svg viewBox="0 0 56 56" aria-hidden="true">
    <rect className="ic-tile" width="56" height="56" rx="16" />
    <rect className="ic-paper" x="10" y="12" width="32" height="27" rx="6" strokeWidth="2.4" />
    <path className="ic-line" d="M16 20h14" strokeWidth="2.4" strokeLinecap="round" />
    <rect x="15" y="25" width="22" height="7" rx="3" fill="#fde3b0" />
    <path d="M18 28.5h16" stroke="#15171c" strokeWidth="2.4" strokeLinecap="round" />
    <circle cx="41" cy="39" r="8" fill="#046a38" />
    <path d="M37.2 39.2l2.6 2.5 4.3-4.6" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BellIcon = () => (
  <svg viewBox="0 0 56 56" aria-hidden="true">
    <rect className="ic-tile" width="56" height="56" rx="16" />
    <path className="ic-paper" d="M17 34V25a10 10 0 0 1 20 0v9l3 4H14z" strokeWidth="2.4" strokeLinejoin="round" />
    <path className="ic-line" d="M23.5 42a4 4 0 0 0 7 0" fill="none" strokeWidth="2.4" strokeLinecap="round" />
    <circle cx="39" cy="16" r="7" fill="#e34222" />
    <path d="M39 12.5V16l2.2 1.6" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const STEPS = [
  ["Connect Gmail", "Read-only. Only the last 14 days. We never send or delete anything.", MailIcon],
  ["Confirm what we found", "See the exact sentence from the email. Confirm, edit or dismiss.", QuoteIcon],
  ["Get nudged in time", "A phone alert a day before and 2 hours before. One tap to add it to your calendar.", BellIcon],
];

export default function Home() {
  return (
    <div className="lp">
      <div className="lp-wrap">
        <header className="lp-nav">
          <Logo />
          <nav className="lp-links">
            <a href="#how">How it works</a>
            <Link href="/privacy">Privacy</Link>
            <Link href="/login" className="b">Sign in</Link>
          </nav>
        </header>

        <section className="lp-hero">
          <div>
            <span className="kicker rise"><i />For students applying to 10+ jobs</span>
            <h1 className="lp-h1 rise" style={{ "--d": "80ms" }}>
              Never miss the <span className="hl">test link</span> again.
            </h1>
            <p className="lp-lede rise" style={{ "--d": "160ms" }}>
              Catchit reads your job emails and finds every test, interview and deadline. One list, and a phone
              alert before each one is due.
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

          <div className="lp-vis rise" style={{ "--d": "200ms" }} aria-label="Example: an email Catchit caught, the Today list and a reminder">
            <div className="lp-phone float" style={{ "--t": "7s" }}>
              <div className="h"><span className="r">2 overdue.</span> 3 this week.</div>
              <div className="s">Sunday, 25 Oct</div>
              <div className="ph-tiles">
                <div className="r"><b>2</b>Overdue</div>
                <div><b>1</b>Today</div>
                <div><b>4</b>To check</div>
              </div>
              <div className="ph-next"><small>NEXT UP</small><div>Confirm your interview slot</div><b>15 h 20 m</b></div>
              <div className="ph-card late"><small>Overdue · yesterday 6 pm</small>Return the signed offer form</div>
              <div className="ph-card"><small>Mon, 10:00 am</small>Join the Webex interview</div>
              <div className="ph-card"><small>Sat, 11:59 pm</small>Skills assessment</div>
            </div>
            <div className="lp-push in">
              <span className="ic"><Wordmark /></span>
              <div><span className="t">now</span><b>Catchit · Due in 2 hours</b><p>Skills assessment, Sample Motors. Tap for the link.</p></div>
            </div>
            <div className="lp-mail float" style={{ "--t": "5.5s", "--fd": "-2.5s" }}>
              <div className="f">From: careers@samplemotors.in</div>
              <p>&hellip;please <mark>complete the skills assessment by Sat, 24 Oct, 11:59 PM IST</mark> using the link below&hellip;</p>
              <div className="caught"><i />CAUGHT &rarr; added to Today</div>
            </div>
          </div>
        </section>

        <section className="lp-sec" id="how">
          <h2>How it works</h2>
          <p>Three steps, about a minute to set up.</p>
          <div className="steps3">
            {STEPS.map(([title, text, Icon], i) => (
              <article className="step3" key={title}>
                <span className="no">STEP {i + 1}</span>
                <Icon />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="lp-sec">
          <h2>Tested on real inboxes</h2>
          <p>Before launch, students tried Catchit on their own Gmail.</p>
          <div className="proof">
            <div><b>6 of 6</b><span>tasks Catchit found were correct</span></div>
            <div><b>9 in 10</b><span>deadlines exactly right in our email tests</span></div>
            <div><b>0</b><span>made-up deadlines in real inboxes</span></div>
            <div><b>0</b><span>emails sent, changed or deleted</span></div>
          </div>
        </section>

        <section className="lp-sec">
          <h2>Your inbox vs. your Today list</h2>
          <p>The same week, two ways.</p>
          <div className="vs">
            <div className="vs-col bad">
              <h3>Without Catchit</h3>
              <ul>
                <li><span className="x">✕</span>Test link buried under 40 job alerts</li>
                <li><span className="x">✕</span>&ldquo;Within 48 hours&rdquo; means you count it yourself</li>
                <li><span className="x">✕</span>You find out on Monday that it closed Sunday</li>
              </ul>
            </div>
            <div className="vs-col">
              <h3>With Catchit</h3>
              <ul>
                <li><span className="ok">✓</span>Every ask pulled out, with the exact sentence</li>
                <li><span className="ok">✓</span>Real date and time worked out for you, in IST</li>
                <li><span className="ok">✓</span>A phone alert a day before and 2 hours before</li>
              </ul>
            </div>
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
      </div>
      <footer className="lp-foot">Read-only Gmail &middot; <Link href="/privacy">Privacy</Link> &middot; Built for the HelloPM Buildathon 2026</footer>
    </div>
  );
}
