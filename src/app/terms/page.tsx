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

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#18191a", color: "#ffffff" }}>
      {/* Nav */}
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

      {/* Content */}
      <div className="max-w-[800px] mx-auto px-6 sm:px-10 py-12 sm:py-16">
        {/* Header */}
        <div className="mb-10 space-y-3">
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#a7d252" }}>Legal</p>
          <h1 className="text-[32px] sm:text-[42px] font-semibold leading-tight">Terms of Service</h1>
          <p className="text-[14px] sm:text-[15px]" style={{ color: "#a0aba7" }}>
            Effective date: March 2025 · Last updated: March 2025
          </p>
          <p className="text-[15px] leading-7" style={{ color: "#c4cdd6" }}>
            Please read these Terms of Service carefully before using Aorthar's website, university platform, courses, internship programs, or any other services offered by Aorthar Academy. By accessing or using any of our services, you confirm that you have read, understood, and agree to be bound by these Terms.
          </p>
        </div>

        {/* Divider */}
        <div className="mb-10 h-px" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />

        <div className="space-y-10">

          <S n={1} title="About Aorthar">
            <p>
              Aorthar Academy ("Aorthar," "we," "our," or "us") is a product internship school based in Lagos, Nigeria. We train students, new graduates, career changers, and entry-level professionals to become world-class Product Designers, Product Managers, QA Engineers, Scrum Masters, and Tech Operations specialists.
            </p>
            <p>
              We deliver education and career development through the following services: a structured University Platform (Years 100–400), self-paced Courses, quarterly Internship Cohorts, live Bootcamps, and career placement tools in partnership with Motivv. Our community is global but our mission is deeply rooted in expanding access to tech careers across Africa.
            </p>
          </S>

          <S n={2} title="Acceptance of Terms">
            <p>
              By registering an account, enrolling in any program, purchasing a course, submitting an internship application, or simply browsing our website, you agree to these Terms. If you are under 18, you must have your parent's or legal guardian's consent before using our services.
            </p>
            <p>
              If you are using Aorthar on behalf of an organisation, you represent that you have authority to bind that organisation to these Terms.
            </p>
          </S>

          <S n={3} title="Our Services">
            <p>Aorthar offers the following services, which may evolve over time:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-white">University Platform:</strong> A structured, self-paced learning dashboard covering Years 100 through 400 across eight departments. Includes courses, lessons, quizzes, exams, GPA tracking, and a Capstone project. Year 400 content requires an active premium subscription.</li>
              <li><strong className="text-white">Courses:</strong> Standalone pre-recorded courses available for individual purchase, covering Product Design, Product Management, QA & Testing, Scrum & Agile, and Tech Operations.</li>
              <li><strong className="text-white">Internship Program:</strong> A free quarterly cohort where selected applicants (10–20 per cohort) are trained on live projects and placed with partner startups. Participation is competitive and merit-based.</li>
              <li><strong className="text-white">Bootcamps:</strong> Live, cohort-style intensive programs (8–12 weeks) with structured instruction, project work, and peer collaboration.</li>
              <li><strong className="text-white">Mentorship & Career Placement:</strong> Career support tools and integration with Motivv, our talent placement partner, where vetted graduates are matched with hiring companies.</li>
              <li><strong className="text-white">Community:</strong> Access to Aorthar's learning community via WhatsApp and other channels for peer support, resources, and networking.</li>
            </ul>
          </S>

          <S n={4} title="Account Registration & Security">
            <p>
              To access the University Platform or purchase courses, you must create an account. You agree to provide accurate, complete, and current information during registration and to keep your account details up to date.
            </p>
            <p>
              You are responsible for maintaining the confidentiality of your password and for all activity that occurs under your account. If you suspect unauthorised access, notify us immediately at <a href="mailto:hello@aorthar.com" className="underline" style={{ color: "#a7d252" }}>hello@aorthar.com</a>.
            </p>
            <p>
              Aorthar reserves the right to suspend or terminate accounts that provide false information, violate these Terms, or engage in behaviour harmful to other users or our platform.
            </p>
          </S>

          <S n={5} title="Payments, Subscriptions & Refunds">
            <p>
              Certain services — including Year 400 access, individual course purchases, and bootcamp enrolments — require payment. All prices are displayed in Nigerian Naira (₦) unless otherwise stated. Payments are processed securely via Paystack. Aorthar does not store your full payment card details.
            </p>
            <p>
              <strong className="text-white">Subscriptions:</strong> Premium subscriptions (granting Year 400 access and other premium features) are billed on a monthly or annual basis as selected at checkout. Your subscription will automatically renew at the end of each billing cycle unless you cancel before the renewal date.
            </p>
            <p>
              <strong className="text-white">Refund Policy:</strong> Due to the digital nature of our content, all sales are generally final once access has been granted. We do not offer refunds for:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Individual courses once accessed or downloaded</li>
              <li>Subscription fees for billing periods already commenced</li>
              <li>Bootcamp fees within 48 hours of a cohort starting</li>
            </ul>
            <p>
              We may offer refunds at our discretion in cases of demonstrable technical failure on our part. Requests must be submitted to <a href="mailto:hello@aorthar.com" className="underline" style={{ color: "#a7d252" }}>hello@aorthar.com</a> within 7 days of purchase.
            </p>
          </S>

          <S n={6} title="Internship Program Participation">
            <p>
              The Aorthar Internship Program is a competitive, merit-based cohort. Submitting an application does not guarantee selection. We reserve the right to admit or decline any applicant at our discretion, and to remove participants who fail to meet programme standards, violate conduct rules, or disengage without notice.
            </p>
            <p>
              The internship is currently offered free of charge. Participation in the programme does not constitute employment with Aorthar. Any partner placement opportunities arising from the programme are facilitated — not guaranteed — by Aorthar.
            </p>
          </S>

          <S n={7} title="Intellectual Property">
            <p>
              All content on the Aorthar platform — including course materials, lesson videos, quizzes, written content, logos, designs, and software — is owned by or licensed to Aorthar. You may not reproduce, redistribute, sell, or create derivative works from our content without explicit written permission.
            </p>
            <p>
              You retain ownership of any original work you create or submit as part of your coursework or capstone project. By submitting work to Aorthar, you grant us a non-exclusive, royalty-free licence to use it for educational, promotional, or portfolio showcase purposes with attribution.
            </p>
          </S>

          <S n={8} title="Acceptable Use">
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Share your account credentials or allow others to access your account</li>
              <li>Reproduce, resell, or distribute any course content without permission</li>
              <li>Harass, abuse, or threaten other users, instructors, or Aorthar staff</li>
              <li>Submit false information in any application or profile</li>
              <li>Attempt to reverse-engineer, scrape, or disrupt our platform</li>
              <li>Use our platform for any unlawful or fraudulent purpose</li>
            </ul>
            <p>
              Violation of these rules may result in immediate suspension, removal from programmes, and/or legal action.
            </p>
          </S>

          <S n={9} title="No Guarantee of Employment or Outcomes">
            <p>
              Aorthar provides education, training, and facilitated placement opportunities. We do not guarantee employment, internship placement, freelance work, or any specific career outcome. Results depend on individual effort, market conditions, and other factors outside our control.
            </p>
          </S>

          <S n={10} title="Limitation of Liability">
            <p>
              To the maximum extent permitted by applicable law, Aorthar and its team shall not be liable for any indirect, incidental, special, or consequential damages arising out of or related to your use of our services, even if we have been advised of the possibility of such damages.
            </p>
            <p>
              Our total liability to you for any claim arising from your use of our services shall not exceed the amount you paid to Aorthar in the 12 months preceding the claim.
            </p>
          </S>

          <S n={11} title="Termination">
            <p>
              You may close your account at any time by emailing us at <a href="mailto:hello@aorthar.com" className="underline" style={{ color: "#a7d252" }}>hello@aorthar.com</a>. Upon termination, your access to paid content and the University Platform will end. Active subscription billing will cease at the end of the current billing period.
            </p>
            <p>
              We reserve the right to suspend or terminate your account without notice if you materially breach these Terms.
            </p>
          </S>

          <S n={12} title="Governing Law">
            <p>
              These Terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any dispute arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Lagos State, Nigeria.
            </p>
          </S>

          <S n={13} title="Changes to These Terms">
            <p>
              We may update these Terms from time to time. We will notify you of significant changes via email or a notice on the platform. Your continued use of our services after changes take effect constitutes your acceptance of the revised Terms.
            </p>
          </S>

          <S n={14} title="Contact Us">
            <p>
              If you have any questions about these Terms, please contact us at:{" "}
              <a href="mailto:hello@aorthar.com" className="underline font-medium" style={{ color: "#a7d252" }}>
                hello@aorthar.com
              </a>
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
