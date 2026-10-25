import Link from "next/link";

// The wordmark: lowercase "catchit" where the dot over the i is the red "caught" dot.
export function Wordmark() {
  return (
    <span className="wordmark" aria-hidden="true">
      catch<span className="wm-i">ı<i /></span>t
    </span>
  );
}

export default function Logo({ href = "/" }) {
  return (
    <Link href={href} className="logo" aria-label="Catchit home">
      <Wordmark />
    </Link>
  );
}
