import Link from "next/link";
import Logo from "../../components/Logo";

export const metadata = { title: "Privacy · Catchit" };

export default function PrivacyPage() {
  return (
    <div className="page">
      <header className="page-head">
        <Logo />
        <Link href="/" className="back">← Home</Link>
      </header>
      <main className="page-body wide">
        <article className="panel privacy">
          <span className="eyebrow">Privacy</span>
          <h1>How Catchit uses your data</h1>
          <p className="lead">We read only what we need to find what companies asked you to do, and you can delete all of it at any time.</p>

          <div className="promises">
            <div className="promise"><b>Read-only</b><span>Only the last 14 days of job-related email.</span></div>
            <div className="promise"><b>Nothing sent</b><span>We never send, delete, label or change an email.</span></div>
            <div className="promise"><b>Yours to delete</b><span>Disconnect or delete everything in one tap.</span></div>
          </div>

          <section>
            <h2><i aria-hidden="true">📥</i>What we read</h2>
            <ul>
              <li>Gmail, read-only, only emails from the last 14 days that look like they are from recruiters or companies (words like interview, assessment, deadline).</li>
              <li>Your own sent emails, promotions and social updates are skipped.</li>
            </ul>
          </section>

          <section>
            <h2><i aria-hidden="true">🗂️</i>What we keep</h2>
            <ul>
              <li>For each action we find: company, role, what to do, the deadline, the link, and the one or two sentences it came from.</li>
              <li>We do not store the full email.</li>
              <li>A Google access token, kept on our server, so Catchit can check for new emails in the background.</li>
              <li>If you turn on reminders, an address for your browser or phone so we can send them.</li>
            </ul>
          </section>

          <section>
            <h2><i aria-hidden="true">🤝</i>Who else sees it</h2>
            <ul>
              <li>To find the action and deadline, the email text is sent to an AI model (Google Gemini or Anthropic Claude, directly or through OpenRouter) through their API. Paid API plans don&rsquo;t use it to train models. On Google&rsquo;s free tier, Google may use it to improve its products.</li>
              <li>Data is stored in Supabase. Nobody else gets it, and we do not sell or share it.</li>
            </ul>
          </section>

          <section>
            <h2><i aria-hidden="true">🎛️</i>Your controls</h2>
            <ul>
              <li><b>Disconnect</b> on the Account page stops all reading straight away and removes our access at Google.</li>
              <li><b>Delete my account</b> removes your account and everything saved in it.</li>
              <li>You can also remove Catchit at any time from your Google Account, under Security, Third-party apps.</li>
            </ul>
          </section>
        </article>
        <p className="foot">Catchit is a student project built for the HelloPM Buildathon 2026. Questions: <a href="mailto:kdeepshikhainternship@gmail.com">kdeepshikhainternship@gmail.com</a></p>
      </main>
    </div>
  );
}
