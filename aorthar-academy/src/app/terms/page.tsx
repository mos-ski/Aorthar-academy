import InfoPageShell from '@/components/landing/InfoPageShell';

export default function TermsPage() {
  return (
    <InfoPageShell
      eyebrow="Legal"
      title="Terms of Service"
      subtitle="These Terms govern your access to Aorthar Academy's courses, internships, bootcamps, university cohort programs, and community resources."
    >
      <p className="text-white/85">By using Aorthar services, you agree to use our programs lawfully, respectfully, and in ways that protect fellow learners and partners.</p>
      <p className="text-white/85">Aorthar provides educational content and career-development opportunities. Enrollment in any program does not guarantee employment, placement, or specific outcomes.</p>
      <p className="text-white/85">You are responsible for account security, the accuracy of submitted information, and all activity under your account.</p>
      <p className="text-white/85">Program fees, subscription terms, and mentorship add-ons are communicated before payment. Unless a specific written refund policy applies to a program, payments are non-refundable once access begins.</p>
      <p className="text-white/85">Aorthar may update course materials, schedules, and program formats to improve learning outcomes.</p>
      <p className="text-white/85">For legal notices, contact <a className="text-[#a7d252] underline" href="mailto:hello@aorthar.com">hello@aorthar.com</a>.</p>
    </InfoPageShell>
  );
}
