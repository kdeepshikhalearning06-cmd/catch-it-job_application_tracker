// The demo inbox: results for the sample emails, with dates set relative to today.
// Everything here is sample data. No company or person is real.

import { ist, words } from "./samples.mjs";

export function demoItems(now = new Date()) {
  const row = (r) => ({ source: "demo", gmail_message_id: null, stage: "applied", confidence: "high", ...r });
  return [
    // Waiting in Review
    row({
      company: "Sample Motors", role: "Graduate Engineer", action: "Submit the candidate form",
      deadline: ist(now, 1, 18, 0), link: "https://forms.example.com/motors",
      evidence: `Please submit the candidate form at https://forms.example.com/motors by ${words(now, 1, 18, 0)}.`,
      status: "proposed", stage: "assessment",
    }),
    row({
      company: "Sample Motors", role: "Graduate Engineer", action: "Attend the technical interview",
      deadline: ist(now, 3, 11, 0), link: null,
      evidence: `Your technical interview is on ${words(now, 3, 11, 0)}.`,
      status: "proposed", stage: "interview",
    }),
    row({
      company: "Sample Energy", role: "Associate", action: "Complete the aptitude test",
      deadline: null, link: "https://tests.example.com/energy-apt",
      evidence: "Please complete the aptitude test at your earliest convenience: https://tests.example.com/energy-apt.",
      status: "proposed", stage: "assessment", confidence: "medium",
    }),
    row({
      company: "Sample Logistics", role: "Operations Trainee", action: "Confirm your interview slot",
      deadline: ist(now, 1, 10, 0), link: null,
      evidence: "Please reply to this email to confirm your interview slot within 48 hours.",
      status: "proposed", stage: "interview", confidence: "medium",
    }),
    // Already confirmed, so they show on Today
    row({
      company: "Sample Bank", role: "Analyst", action: "Return the signed offer form",
      deadline: ist(now, -1, 18, 0), link: null,
      evidence: `Please return the signed offer form by ${words(now, -1, 18, 0)}.`,
      status: "confirmed", stage: "offer",
    }),
    row({
      company: "Sample Foods", role: "Trainee", action: "Upload your degree certificate",
      deadline: ist(now, 0, 17, 0), link: "https://portal.example.com/upload",
      evidence: `Please upload your degree certificate at https://portal.example.com/upload by ${words(now, 0, 17, 0)}.`,
      status: "confirmed",
    }),
    row({
      company: "Sample Tech", role: "Analyst", action: "Complete the online assessment", my_name: "Sample Tech test",
      deadline: ist(now, 2, 23, 59), link: "https://assessments.example.com/t/abc123",
      evidence: `Please complete the online assessment at https://assessments.example.com/t/abc123 by ${words(now, 2, 23, 59)}.`,
      status: "confirmed", stage: "assessment",
    }),
    row({
      company: "Sample Bank", role: "Trainee", action: "Attend the first-round interview",
      deadline: ist(now, 1, 15, 0), link: "https://meet.example.com/sample-bank-r1",
      evidence: `Your first-round interview for the Trainee role is scheduled for ${words(now, 1, 15, 0)}.`,
      status: "confirmed", stage: "interview",
    }),
    row({
      company: "Sample Retail", role: "Management Trainee", action: "Attend the rescheduled interview",
      deadline: ist(now, 4, 10, 30), link: null,
      evidence: `Your interview has been rescheduled to ${words(now, 4, 10, 30)}.`,
      status: "confirmed", stage: "interview",
    }),
  ];
}
