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

export default function PrivacyPage() {
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
          <h1 className="text-[32px] sm:text-[42px] font-semibold leading-tight">Privacy Policy</h1>
          <p className="text-[14px] sm:text-[15px]" style={{ color: "#a0aba7" }}>
            Effective date: March 2025 · Last updated: March 2025
          </p>
          <p className="text-[15px] leading-7" style={{ color: "#c4cdd6" }}>
            At Aorthar Academy, your privacy matters. This Policy explains what personal data we collect, why we collect it, how we use it, and your rights as a user. We are committed to handling your data responsibly and transparently.
          </p>
        </div>

        <div className="mb-10 h-px" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />

        <div className="space-y-10">

          <S n={1} title="Who We Are (Data Controller)">
            <p>
              Aorthar Academy operates at <strong className="text-white">aorthar.com</strong> and provides product development education services. For the purposes of applicable data protection law, Aorthar Academy is the data controller responsible for your personal information.
            </p>
            <p>
              Contact: <a href="mailto:hello@aorthar.com" className="underline" style={{ color: "#a7d252" }}>hello@aorthar.com</a>
            </p>
          </S>

          <S n={2} title="What Data We Collect">
            <p>We collect the following categories of personal information:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-white">Account & Profile Data:</strong> Your name, email address, department, year level, profile photo (if uploaded), and any profile details you choose to provide.
              </li>
              <li>
                <strong className="text-white">Learning Data:</strong> Course progress, lesson completion status, quiz attempts and scores, exam results, GPA, and capstone project submissions. This data is core to operating the University Platform.
              </li>
              <li>
                <strong className="text-white">Application Data:</strong> Information you submit when applying for our internship programme — including your background, career track preference, motivation statement, and employment status.
              </li>
              <li>
                <strong className="text-white">Payment Data:</strong> Transaction records, payment method type (card or bank), and billing amounts. Full card details are processed directly by Paystack and are never stored on Aorthar's servers.
              </li>
              <li>
                <strong className="text-white">Communications:</strong> Messages you send us via email or support channels, including partnership enquiries and feedback.
              </li>
              <li>
                <strong className="text-white">Technical Data:</strong> Your IP address, browser type, device information, and usage activity on the platform (pages visited, time spent, click behaviour). Collected via server logs and analytics tools.
              </li>
            </ul>
          </S>

          <S n={3} title="How We Use Your Information">
            <p>We use your personal data to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Create and manage your account and provide access to our services</li>
              <li>Deliver course content, track your progress, calculate your GPA, and process quiz and exam results</li>
              <li>Review internship and programme applications, select cohort participants, and communicate application decisions</li>
              <li>Process payments and manage your subscription</li>
              <li>Send transactional emails (account verification, receipts, password resets)</li>
              <li>Send programme updates, new course announcements, and learning resources — you can unsubscribe at any time</li>
              <li>Facilitate career placement by sharing your profile (with your consent) with Motivv and partner hiring companies</li>
              <li>Improve our platform, content, and user experience through anonymised analytics</li>
              <li>Comply with legal obligations</li>
            </ul>
          </S>

          <S n={4} title="Legal Basis for Processing (GDPR)">
            <p>Where GDPR applies, we process your data on the following legal bases:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-white">Performance of a Contract:</strong> Processing necessary to provide you with the services you signed up for (account access, course delivery, application processing, payment).</li>
              <li><strong className="text-white">Legitimate Interests:</strong> Platform analytics, security monitoring, and product improvement — provided these interests are not overridden by your rights.</li>
              <li><strong className="text-white">Consent:</strong> Marketing communications and career placement data sharing — you can withdraw consent at any time.</li>
              <li><strong className="text-white">Legal Obligation:</strong> Where we are required by law to process or retain data.</li>
            </ul>
          </S>

          <S n={5} title="Data Sharing & Third Parties">
            <p>
              <strong className="text-white">We do not sell your personal data.</strong> We share your data only in the following limited circumstances:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-white">Supabase:</strong> Our cloud database and authentication provider, used to store account, profile, and learning data securely.</li>
              <li><strong className="text-white">Paystack:</strong> Our payment processor for handling course purchases and subscription billing. Paystack is PCI-DSS compliant.</li>
              <li><strong className="text-white">Motivv:</strong> Our talent placement partner. Your profile data is only shared with Motivv if you explicitly opt in to the career placement programme.</li>
              <li><strong className="text-white">Legal Authorities:</strong> We may disclose data where required by applicable law, court order, or regulatory authority.</li>
            </ul>
          </S>

          <S n={6} title="Data Retention">
            <p>
              We retain your account and learning data for as long as your account is active and for up to 2 years after account deletion, to allow for reactivation requests, dispute resolution, and legal compliance.
            </p>
            <p>
              Internship application data is retained for 12 months after the cohort closes. Payment records are kept for 7 years as required by Nigerian tax and financial regulations.
            </p>
            <p>
              You can request deletion of your account and associated data at any time — see Section 7.
            </p>
          </S>

          <S n={7} title="Your Rights">
            <p>Depending on your location, you may have the following rights regarding your personal data:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-white">Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong className="text-white">Rectification:</strong> Request correction of inaccurate or incomplete data.</li>
              <li><strong className="text-white">Erasure:</strong> Request deletion of your personal data ("right to be forgotten"), subject to legal retention requirements.</li>
              <li><strong className="text-white">Portability:</strong> Request your data in a structured, machine-readable format.</li>
              <li><strong className="text-white">Objection:</strong> Object to processing based on legitimate interests, including direct marketing.</li>
              <li><strong className="text-white">Restriction:</strong> Request that we limit how we use your data in certain circumstances.</li>
            </ul>
            <p>
              To exercise any of these rights, email us at{" "}
              <a href="mailto:hello@aorthar.com" className="underline" style={{ color: "#a7d252" }}>
                hello@aorthar.com
              </a>
              . We will respond within 30 days. We may ask you to verify your identity before processing your request.
            </p>
          </S>

          <S n={8} title="Cookies">
            <p>
              We use cookies and similar technologies to maintain your session, remember preferences, and understand platform usage. For full details on the cookies we use, please see our{" "}
              <Link href="/cookies" className="underline" style={{ color: "#a7d252" }}>
                Cookie Policy
              </Link>
              .
            </p>
          </S>

          <S n={9} title="Security">
            <p>
              We implement appropriate technical and organisational measures to protect your personal data from unauthorised access, loss, or misuse. These include encrypted data transmission (HTTPS), access controls, and secure cloud infrastructure provided by Supabase.
            </p>
            <p>
              No method of transmission over the internet is 100% secure. If you believe your account has been compromised, contact us immediately at <a href="mailto:hello@aorthar.com" className="underline" style={{ color: "#a7d252" }}>hello@aorthar.com</a>.
            </p>
          </S>

          <S n={10} title="Children's Privacy">
            <p>
              Our services are intended for individuals aged 13 and above. Users under 18 require parental or guardian consent. We do not knowingly collect personal data from children under 13. If you believe we have inadvertently done so, contact us immediately and we will delete the data.
            </p>
          </S>

          <S n={11} title="International Data Transfers">
            <p>
              Aorthar is based in Nigeria. Our infrastructure (Supabase, Paystack) may process data in jurisdictions outside Nigeria, including the United States and EU. Where transfers occur, we ensure appropriate safeguards are in place in accordance with applicable data protection law.
            </p>
          </S>

          <S n={12} title="Changes to This Policy">
            <p>
              We may update this Privacy Policy periodically. When we make significant changes, we will notify you via email or a platform notification. The "last updated" date at the top of this page reflects the most recent revision.
            </p>
          </S>

          <S n={13} title="Contact & Complaints">
            <p>
              For privacy-related questions or to exercise your data rights, contact us at:{" "}
              <a href="mailto:hello@aorthar.com" className="underline font-medium" style={{ color: "#a7d252" }}>
                hello@aorthar.com
              </a>
            </p>
            <p>
              If you are in the EU/UK and are not satisfied with our response, you have the right to lodge a complaint with your local data protection authority.
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
