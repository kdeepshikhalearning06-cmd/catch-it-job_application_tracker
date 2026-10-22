import Link from "next/link";
import DemoButton from "../components/DemoButton";

export default function Home() {
  return (
    <main>
      <div className="brand">Catchit</div>
      <h1>Catch what companies ask you to do, before it slips.</h1>
      <p className="lead">
        Assessment links, interview invites and deadlines land in your email and
        get buried. Catchit finds them, and reminds you in time.
      </p>
      <DemoButton />
      <p className="note">
        The demo uses sample emails, so you need no sign-in. Connecting your own Gmail arrives next.{" "}
        <Link href="/login">Log in</Link> &middot; <a href="#how">See how it works</a>
      </p>

      <div className="card" aria-label="Example of a caught action">
        <div className="tag">Caught from your email</div>
        <div className="what">Complete the online assessment by Sat 24 Oct, 11:59 PM</div>
        <div className="src">&ldquo;Please complete the assessment by 24 Oct, 11:59 PM IST.&rdquo;</div>
      </div>

      <h2 id="how">How it works</h2>
      <ol>
        <li>Connect Gmail once. Catchit reads only the last 14 days and never sends email.</li>
        <li>It proposes what you need to do and by when. You tap Confirm, Edit or Dismiss.</li>
        <li>Confirmed items sit on your Today list, and you get one email the morning they are due.</li>
      </ol>

      <p className="note">Example above is a sample, not a real email.</p>
    </main>
  );
}
