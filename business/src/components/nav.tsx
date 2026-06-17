import Link from "next/link";

const links = [
  { href: "/services", label: "Services" },
  { href: "/packages", label: "Packages" },
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
];

export function Nav() {
  return (
    <header style={{ borderBottom: "1px solid var(--border)" }}>
      <nav
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "1.25rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{
            fontWeight: 900,
            fontSize: "1.1rem",
            letterSpacing: "0.08em",
            color: "var(--text)",
            textDecoration: "none",
          }}
        >
          AORTHAR<span style={{ color: "var(--lime)" }}>/</span>
        </Link>

        <ul style={{ display: "flex", gap: "2rem", listStyle: "none" }}>
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                style={{
                  color: "var(--muted)",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  letterSpacing: "0.04em",
                }}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/contact"
          style={{
            background: "var(--lime)",
            color: "#000",
            fontWeight: 700,
            fontSize: "0.8rem",
            letterSpacing: "0.08em",
            padding: "0.6rem 1.25rem",
            borderRadius: "2px",
            textDecoration: "none",
            textTransform: "uppercase",
          }}
        >
          Get Started
        </Link>
      </nav>
    </header>
  );
}
