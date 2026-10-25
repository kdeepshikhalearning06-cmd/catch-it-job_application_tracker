import Link from "next/link";

export const metadata = { title: "Privacy · Catchit" };

export default function PrivacyPage() {
  return (
    <main className="privacy">
      <p><Link href="/" className="brand">Catchit</Link></p>
      <h1>How Catchit uses your data</h1>
      <p className="lead">Short version: we read only what we need to find what companies asked you to do, and you can delete all of it at any time.</p>

      <h2>What we read</h2>
      <ul>
        <li>Gmail, read-only, only emails from the last 14 days that look like they are from recruiters or companies (words like interview, assessment, deadline).</li>
        <li>We never send, delete, label or change any email.</li>
        <li>Your own sent emails, promotions and social updates are skipped.</li>
      </ul>

      <h2>What we keep</h2>
      <ul>
        <li>For each action we find: company, role, what to do, the deadline, the link, and the one or two sentences it came from.</li>
        <li>We do not store the full email.</li>
        <li>A Google access token, kept on our server, so Catchit can check for new emails in the background.</li>
        <li>If you turn on reminders, an address for your browser or phone so we can send them.</li>
      </ul>

      <h2>Who else sees it</h2>
      <ul>
        <li>To find the action and deadline, the email text is sent to an AI model (Google Gemini or Anthropic Claude) through their API. It is not used to train their models under their API terms.</li>
        <li>Data is stored in Supabase. Nobody else gets it, and we do not sell or share it.</li>
      </ul>

      <h2>Your controls</h2>
      <ul>
        <li><b>Disconnect Gmail</b> on the Account page stops all reading straight away and removes our access at Google.</li>
        <li><b>Delete my account</b> removes your account and everything saved in it.</li>
        <li>You can also remove Catchit at any time from your Google Account, under Security, Third-party apps.</li>
      </ul>

      <p className="note">Catchit is a student project built for the HelloPM Buildathon 2026. Questions: kdeepshikhainternship@gmail.com</p>
    </main>
  );
}
