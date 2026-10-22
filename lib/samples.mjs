// Ten clearly labelled sample emails. Dates are relative to "now", so Today always has content.
// None of these companies or people are real.

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const pad = (n) => String(n).padStart(2, "0");

// An IST wall-clock time, `days` from today, as an ISO string with +05:30.
export function ist(now, days, hour, minute = 0) {
  const base = new Date(now.getTime() + 5.5 * 3600 * 1000);
  const d = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() + days));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(hour)}:${pad(minute)}:00+05:30`;
}

// "24 Oct 2026, 11:59 PM IST" from the same arguments.
export function words(now, days, hour, minute = 0) {
  const iso = ist(now, days, hour, minute);
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${d} ${MONTHS.at(m - 1)} ${y}, ${h12}:${pad(minute)} ${hour < 12 ? "AM" : "PM"} IST`;
}

export function buildSamples(now = new Date()) {
  const sender = (name) => `${name} <recruiting@${name.toLowerCase().replace(/\s+/g, "-")}.example>`;
  return [
    {
      id: 1,
      note: "Assessment with a link and a deadline",
      subject: "[Sample] Complete your online assessment",
      from: sender("Sample Tech"),
      receivedAt: ist(now, -1, 10),
      body: `Hi,\n\nThank you for applying for the Analyst role at Sample Tech. Please complete the online assessment at https://assessments.example.com/t/abc123 by ${words(now, 2, 23, 59)}.\n\nRegards,\nSample Tech Recruiting`,
      expected: { deadlines: [ist(now, 2, 23, 59)] },
    },
    {
      id: 2,
      note: "Interview invite",
      subject: "[Sample] Interview scheduled",
      from: sender("Sample Bank"),
      receivedAt: ist(now, -1, 16),
      body: `Dear candidate,\n\nYour first-round interview for the Trainee role is scheduled for ${words(now, 1, 15, 0)}. Please join using https://meet.example.com/sample-bank-r1.\n\nSample Bank HR`,
      expected: { deadlines: [ist(now, 1, 15, 0)] },
    },
    {
      id: 3,
      note: "Document upload due today",
      subject: "[Sample] Documents needed",
      from: sender("Sample Foods"),
      receivedAt: ist(now, -2, 11),
      body: `Hello,\n\nPlease upload your degree certificate at https://portal.example.com/upload by ${words(now, 0, 17, 0)} to keep your application active.\n\nThanks,\nSample Foods Talent Team`,
      expected: { deadlines: [ist(now, 0, 17, 0)] },
    },
    {
      id: 4,
      note: "Two deadlines in one email",
      subject: "[Sample] Next steps",
      from: sender("Sample Motors"),
      receivedAt: ist(now, 0, 9),
      body: `Hi,\n\nYou have been shortlisted. Please submit the candidate form at https://forms.example.com/motors by ${words(now, 1, 18, 0)}. Your technical interview is on ${words(now, 3, 11, 0)}.\n\nSample Motors HR`,
      expected: { deadlines: [ist(now, 1, 18, 0), ist(now, 3, 11, 0)] },
    },
    {
      id: 5,
      note: "Interview rescheduled, only the new time counts",
      subject: "[Sample] Interview rescheduled",
      from: sender("Sample Retail"),
      receivedAt: ist(now, 0, 12),
      body: `Hi,\n\nYour interview has been rescheduled to ${words(now, 4, 10, 30)}. The earlier slot on ${words(now, 2, 10, 30)} is cancelled.\n\nSample Retail HR`,
      expected: { deadlines: [ist(now, 4, 10, 30)] },
    },
    {
      id: 6,
      note: "Action with no date, deadline must be null",
      subject: "[Sample] Aptitude test",
      from: sender("Sample Energy"),
      receivedAt: ist(now, -1, 9),
      body: `Hello,\n\nPlease complete the aptitude test at your earliest convenience: https://tests.example.com/energy-apt.\n\nSample Energy Careers`,
      expected: { deadlines: [null] },
    },
    {
      id: 7,
      note: "Relative deadline, counted from the day the email arrived",
      subject: "[Sample] Please confirm your slot",
      from: sender("Sample Logistics"),
      receivedAt: ist(now, -1, 10),
      body: `Hi,\n\nCongratulations on clearing the first round. Please reply to this email to confirm your interview slot within 48 hours.\n\nSample Logistics HR`,
      expected: { deadlines: [ist(now, 1, 10, 0)] },
    },
    {
      id: 8,
      note: "Job alert, not an action",
      subject: "[Sample] 10 new jobs for you",
      from: sender("Sample Jobs Alerts"),
      receivedAt: ist(now, -1, 8),
      body: `Hi,\n\nHere are 10 new jobs that match your profile: Analyst at Sample Tech, Trainee at Sample Bank, and more. Open the app to see all of them.\n\nSample Jobs`,
      expected: { deadlines: [] },
    },
    {
      id: 9,
      note: "Rejection, not an action",
      subject: "[Sample] Update on your application",
      from: sender("Sample Pharma"),
      receivedAt: ist(now, -3, 14),
      body: `Dear candidate,\n\nThank you for your interest. Unfortunately we will not be moving forward with your application at this time. We wish you the best.\n\nSample Pharma HR`,
      expected: { deadlines: [] },
    },
    {
      id: 10,
      note: "Promotion with a date, not an action",
      subject: "[Sample] Free resume webinar this Saturday",
      from: sender("Sample Academy"),
      receivedAt: ist(now, -2, 9),
      body: `Hi,\n\nJoin our free webinar on resume writing this Saturday at 6 PM. Seats are limited, so register today.\n\nSample Academy`,
      expected: { deadlines: [] },
    },
  ];
}
