import Link from "next/link";

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", marginTop: "6rem" }}>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "3rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <div
            style={{
              fontWeight: 900,
              fontSize: "1rem",
              letterSpacing: "0.08em",
              marginBottom: "0.4rem",
            }}
          >
            AORTHAR<span style={{ color: "var(--lime)" }}>/</span>
          </div>
          <p style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
            Marketing. Branding. Product.
          </p>
        </div>

        <nav style={{ display: "flex", gap: "1.5rem" }}>
          {[
            ["/services", "Services"],
            ["/packages", "Packages"],
            ["/work", "Work"],
            ["/about", "About"],
            ["/contact", "Contact"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              style={{
                color: "var(--muted)",
                textDecoration: "none",
                fontSize: "0.8rem",
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <p style={{ color: "var(--muted)", fontSize: "0.75rem" }}>
          © {new Date().getFullYear()} Aorthar Agency
        </p>
      </div>
    </footer>
  );
}
