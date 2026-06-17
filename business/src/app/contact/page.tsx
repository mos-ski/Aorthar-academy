"use client";

import { useState } from "react";
import { sendContactEmail, type ContactResult } from "./actions";

const services = [
  "Marketing — Content Strategy",
  "Marketing — Content Creation",
  "Marketing — UGC Network",
  "Branding — Logo & Identity",
  "Branding — Brand Guidelines",
  "Product — Web App",
  "Product — Mobile App",
  "Product — Landing Page",
  "Product — SaaS MVP",
  "Product — E-commerce",
  "Full Agency Retainer",
  "Not sure yet",
];

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const result: ContactResult = await sendContactEmail(
      new FormData(e.currentTarget)
    );
    if (result.success) {
      setStatus("done");
    } else {
      setErrorMsg(result.error);
      setStatus("error");
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "2px",
    color: "var(--text)",
    fontSize: "0.925rem",
    padding: "0.875rem 1rem",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.75rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "var(--muted)",
    marginBottom: "0.5rem",
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "6rem 2rem" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "6rem",
          alignItems: "start",
        }}
      >
        {/* Left */}
        <div>
          <p
            style={{
              color: "var(--lime)",
              fontSize: "0.75rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: "1.25rem",
            }}
          >
            Get in Touch
          </p>
          <h1
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              marginBottom: "1.5rem",
            }}
          >
            Let&apos;s build
            <br />
            something{" "}
            <span style={{ color: "var(--lime)" }}>real.</span>
          </h1>
          <p
            style={{
              color: "var(--muted)",
              fontSize: "1rem",
              lineHeight: 1.7,
              marginBottom: "3rem",
            }}
          >
            Tell us what you&apos;re working on. We&apos;ll get back to you
            within 24 hours.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {[
              { label: "Response time", value: "Within 24 hours" },
              { label: "Based in", value: "Nigeria — serving clients globally" },
              { label: "Email", value: "hello@aorthar.com" },
            ].map((item) => (
              <div key={item.label}>
                <p
                  style={{
                    color: "var(--lime)",
                    fontSize: "0.7rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    marginBottom: "0.25rem",
                  }}
                >
                  {item.label}
                </p>
                <p style={{ fontSize: "0.925rem" }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Form */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            padding: "2.5rem",
          }}
        >
          {status === "done" ? (
            <div style={{ textAlign: "center", padding: "3rem 0" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>✓</div>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  marginBottom: "0.75rem",
                }}
              >
                Message sent.
              </h2>
              <p style={{ color: "var(--muted)", fontSize: "0.925rem" }}>
                We&apos;ll be in touch within 24 hours.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
            >
              <div>
                <label htmlFor="name" style={labelStyle}>
                  Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Your name"
                  style={inputStyle}
                />
              </div>

              <div>
                <label htmlFor="email" style={labelStyle}>
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@company.com"
                  style={inputStyle}
                />
              </div>

              <div>
                <label htmlFor="service" style={labelStyle}>
                  Service interested in
                </label>
                <select
                  id="service"
                  name="service"
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="">Select a service...</option>
                  {services.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="message" style={labelStyle}>
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  placeholder="Tell us about your project, goals, timeline..."
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

              {status === "error" && (
                <p style={{ color: "#ff4444", fontSize: "0.85rem" }}>
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                style={{
                  background: "var(--lime)",
                  color: "#000",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  letterSpacing: "0.08em",
                  padding: "0.95rem",
                  borderRadius: "2px",
                  border: "none",
                  cursor: status === "loading" ? "not-allowed" : "pointer",
                  textTransform: "uppercase",
                  opacity: status === "loading" ? 0.7 : 1,
                }}
              >
                {status === "loading" ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
