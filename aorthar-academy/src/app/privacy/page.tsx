import InfoPageShell from '@/components/landing/InfoPageShell';

export default function PrivacyPage() {
  return (
    <InfoPageShell
      eyebrow="Legal"
      title="Privacy Policy"
      subtitle="This policy explains how Aorthar collects, uses, and protects personal information across our website and learning programs."
    >
      <p className="text-white/85">We collect information you provide directly, including name, email, career profile details, and application responses.</p>
      <p className="text-white/85">We use your data to deliver courses, process applications, provide support, improve our curriculum, and communicate relevant program updates.</p>
      <p className="text-white/85">Payment processing is handled by secure third-party providers. Aorthar does not store full card details on its servers.</p>
      <p className="text-white/85">We do not sell your personal data. We may share limited data with vetted service providers only when required to operate our platform.</p>
      <p className="text-white/85">You may request correction or deletion of your personal data by emailing <a className="text-[#a7d252] underline" href="mailto:hello@aorthar.com">hello@aorthar.com</a>.</p>
    </InfoPageShell>
  );
}
