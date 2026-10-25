import Link from "next/link";

// The app icon (green tile, check, red "caught" dot) next to the name. Same mark as the phone icon.
export function Mark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" className="mark">
      <rect width="48" height="48" rx="12" fill="#046a38" />
      <path d="M13 25.5l7 7L34 16" fill="none" stroke="#fbf3e6" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="35" cy="13" r="5" fill="#e34222" />
    </svg>
  );
}

export default function Logo({ href = "/", size = 28 }) {
  return (
    <Link href={href} className="logo" aria-label="Catchit home">
      <Mark size={size} />
      <span>Catchit</span>
    </Link>
  );
}
