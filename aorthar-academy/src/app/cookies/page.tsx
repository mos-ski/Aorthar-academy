import Link from "next/link";

function S({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-[18px] sm:text-[20px] font-semibold text-white">
        {n}. {title}
      </h2>
      <div className="space-y-3 text-[14px] sm:text-[15px] leading-[1.75]" style={{ color: "#c4cdd6" }}>
        {children}
      </div>
    </div>
  );
}

const COOKIE_TABLE = [
  { name: "sb-*", purpose: "Supabase authentication session token — keeps you logged in to the platform.", type: "Essential", duration: "Session / 1 year" },
  { name: "aorthar_demo", purpose: "Stores your demo mode preference (live data vs demo data). Used only in non-production environments.", type: "Functional", duration: "Session" },
  { name: "_ga, _gid", purpose: "Google Analytics cookies for anonymous usage statistics — pages visited, session duration, referral source.", type: "Analytics", duration: "2 years / 24 hours" },
  { name: "paystack_*", purpose: "Set by Paystack during the payment flow to enable secure card processing.", type: "Essential", duration: "Session" },
];

export default function CookiesPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#18191a", color: "#ffffff" }}>
      <header
        className="flex items-center justify-between px-6 sm:px-10 h-14 border-b sticky top-0 z-10"
        style={{ backgroundColor: "#18191a", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <Link href="/">
          <img src="/Aorthar Logo long complete.svg" alt="Aorthar" width={99} height={43} />
        </Link>
        <Link href="/" className="text-sm hover:opacity-80 transition-opacity" style={{ color: "#a7d252" }}>
          ← Back to home
        </Link>
      </header>

      <div className="max-w-[800px] mx-auto px-6 sm:px-10 py-12 sm:py-16">
        <div className="mb-10 space-y-3">
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#a7d252" }}>Legal</p>
          <h1 className="text-[32px] sm:text-[42px] font-semibold leading-tight">Cookie Policy</h1>
          <p className="text-[14px] sm:text-[15px]" style={{ color: "#a0aba7" }}>
            Effective date: March 2025 · Last updated: March 2025
          </p>
          <p className="text-[15px] leading-7" style={{ color: "#c4cdd6" }}>
            This Cookie Policy explains how Aorthar Academy uses cookies and similar technologies when you visit our website or use our platform. It covers what cookies are, why we use them, and how you can control them.
          </p>
        </div>

        <div className="mb-10 h-px" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />

        <div className="space-y-10">

          <S n={1} title="What Are Cookies?">
            <p>
              Cookies are small text files placed on your device by a website you visit. They allow the website to remember your actions and preferences (such as login status, language, or font size) over a period of time so you don't have to re-enter them whenever you come back or navigate between pages.
            </p>
            <p>
              Similar technologies include local storage, session storage, and pixels — we use some of these alongside cookies to provide our services.
            </p>
          </S>

          <S n={2} title="Why We Use Cookies">
            <p>Aorthar uses cookies and similar technologies for three main purposes:</p>
            <ul className="list-disc pl-5 space-y-3">
              <li>
                <strong className="text-white">Essential (Required):</strong> These are necessary for core platform functionality — logging in, keeping your session active, and processing payments securely. Without these, the platform cannot function correctly. They cannot be disabled.
              </li>
              <li>
                <strong className="text-white">Functional (Preference):</strong> These remember your settings and preferences, such as demo mode and display choices, to personalise your experience. Disabling them may affect some features.
              </li>
              <li>
                <strong className="text-white">Analytics (Optional):</strong> These help us understand how people use Aorthar — which pages are visited most, how long users spend on lessons, and where people drop off. All analytics data is anonymised. We use this to improve content, navigation, and overall experience.
              </li>
            </ul>
          </S>

          <S n={3} title="Cookies We Use">
            <p>The table below lists the main cookies set on the Aorthar platform:</p>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-[13px] border-collapse">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
                    <th className="text-left py-2.5 pr-4 font-semibold text-white whitespace-nowrap">Cookie name</th>
                    <th className="text-left py-2.5 pr-4 font-semibold text-white">Purpose</th>
                    <th className="text-left py-2.5 pr-4 font-semibold text-white whitespace-nowrap">Type</th>
                    <th className="text-left py-2.5 font-semibold text-white whitespace-nowrap">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {COOKIE_TABLE.map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <td className="py-2.5 pr-4 font-mono text-[12px] whitespace-nowrap" style={{ color: "#a7d252" }}>{row.name}</td>
                      <td className="py-2.5 pr-4 leading-5" style={{ color: "#c4cdd6" }}>{row.purpose}</td>
                      <td className="py-2.5 pr-4 whitespace-nowrap" style={{ color: "#c4cdd6" }}>{row.type}</td>
                      <td className="py-2.5 whitespace-nowrap" style={{ color: "#c4cdd6" }}>{row.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </S>

          <S n={4} title="How to Manage or Disable Cookies">
            <p>
              You can control and manage cookies through your browser settings. Most browsers allow you to view, delete, or block cookies. Here's how to do it in common browsers:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-white">Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
              <li><strong className="text-white">Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
              <li><strong className="text-white">Safari:</strong> Preferences → Privacy → Manage Website Data</li>
              <li><strong className="text-white">Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
            </ul>
            <p>
              Please note: disabling essential cookies (particularly Supabase session cookies) will prevent you from logging in to the Aorthar platform. We recommend only blocking non-essential cookies if you have privacy concerns.
            </p>
          </S>

          <S n={5} title="Third-Party Cookies">
            <p>
              Some cookies are placed by third-party services we use — including Paystack (payment processing) and analytics providers. These third parties have their own privacy and cookie policies, which we encourage you to review:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Paystack: <a href="https://paystack.com/privacy" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "#a7d252" }}>paystack.com/privacy</a></li>
              <li>Supabase: <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "#a7d252" }}>supabase.com/privacy</a></li>
            </ul>
          </S>

          <S n={6} title="Changes to This Policy">
            <p>
              We may update this Cookie Policy from time to time to reflect changes in our technology or legal requirements. The "last updated" date at the top of this page will reflect any changes.
            </p>
          </S>

          <S n={7} title="Contact Us">
            <p>
              Questions about our use of cookies? Email us at{" "}
              <a href="mailto:hello@aorthar.com" className="underline font-medium" style={{ color: "#a7d252" }}>
                hello@aorthar.com
              </a>
              . For broader privacy questions, see our{" "}
              <Link href="/privacy" className="underline" style={{ color: "#a7d252" }}>
                Privacy Policy
              </Link>
              .
            </p>
          </S>

        </div>

        <div className="mt-14 pt-8 border-t text-[13px]" style={{ borderColor: "rgba(255,255,255,0.08)", color: "#6b7280" }}>
          Aorthar Academy · Lagos, Nigeria · <a href="mailto:hello@aorthar.com" style={{ color: "#a7d252" }}>hello@aorthar.com</a>
        </div>
      </div>
    </div>
  );
}
