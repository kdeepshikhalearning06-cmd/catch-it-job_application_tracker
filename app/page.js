import Link from "next/link";
import DemoButton from "../components/DemoButton";
import Typewriter from "../components/Typewriter";

const CAUGHT = [
  "Complete the online assessment by Sat, 11:59 PM",
  "Join the interview on Wed at 4:00 PM",
  "Submit the 3-question task by Mon, 10:00 AM",
];

export default function Home() {
  return (
    <div className="landing">
      <div className="blob b1" aria-hidden="true" />
      <div className="blob b2" aria-hidden="true" />

      <header className="lnav rise" style={{ "--d": "0ms" }}>
        <span className="wordmark">Catchit<span className="star" aria-hidden="true">✳︎</span></span>
        <Link href="/login" className="lnk">Log in</Link>
      </header>

      <section className="hero">
        <div className="copy">
          <p className="eyebrow rise" style={{ "--d": "80ms" }}>Ready when the next email lands</p>
          <h1 className="headline"><span className="mask"><span className="up">Catch what companies ask you to do.</span></span></h1>
          <p className="lede rise" style={{ "--d": "420ms" }}>
            Assessment links, interview invites and deadlines get buried in your inbox.
            Catchit finds them, quotes the exact sentence, and reminds you in time.
          </p>
          <div className="rise cta" style={{ "--d": "600ms" }}>
            <DemoButton />
            <a className="ghost" href="#how">See how it works</a>
          </div>
          <p className="note rise" style={{ "--d": "700ms" }}>The demo uses sample emails, so you need no sign-in.</p>
        </div>

        <div className="stage rise" style={{ "--d": "500ms" }} aria-label="Example of a caught action">
          <div className="chip c1">Interview Invite from OyeLabs…</div>
          <div className="chip c2">Re: Task for the next round</div>
          <div className="chip c3">Your application update</div>
          <div className="caught">
            <div className="tag"><i className="pulse" />Caught from your email</div>
            <Typewriter lines={CAUGHT} />
            <div className="src">&ldquo;Please complete the assessment by 24 Oct, 11:59 PM IST.&rdquo;</div>
            <div className="fake"><span>Confirm</span><span>Edit</span><span>Dismiss</span></div>
          </div>
          <p className="sample">Sample, not a real email.</p>
        </div>
      </section>

      <footer className="glass" id="how">
        <div className="cols">
          <div className="col rise" style={{ "--d": "800ms" }}>
            <h3>1. Connect</h3>
            <p>Link Gmail once. Catchit reads only the last 14 days and never sends email.</p>
          </div>
          <div className="col rise" style={{ "--d": "880ms" }}>
            <h3>2. Confirm</h3>
            <p>It proposes what to do and by when. You tap Confirm, Edit or Dismiss.</p>
          </div>
          <div className="col rise" style={{ "--d": "960ms" }}>
            <h3>3. Get reminded</h3>
            <p>Confirmed items sit on Today, with a phone alarm and one morning email.</p>
          </div>
        </div>
        <p className="legal">Read-only Gmail access &middot; Built for the HelloPM Buildathon 2026</p>
      </footer>
    </div>
  );
}
