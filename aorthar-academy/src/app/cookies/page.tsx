import InfoPageShell from '@/components/landing/InfoPageShell';

export default function CookiesPage() {
  return (
    <InfoPageShell
      eyebrow="Legal"
      title="Cookie Policy"
      subtitle="Aorthar uses cookies and similar technologies to provide essential site functionality and improve your learning experience."
    >
      <p className="text-white/85">Essential cookies help with login sessions, security, and platform stability.</p>
      <p className="text-white/85">Analytics cookies help us understand how learners use our website so we can improve content, speed, and usability.</p>
      <p className="text-white/85">You can manage or disable cookies in your browser settings. Some platform features may not work correctly without essential cookies.</p>
      <p className="text-white/85">Questions about cookies can be sent to <a className="text-[#a7d252] underline" href="mailto:hello@aorthar.com">hello@aorthar.com</a>.</p>
    </InfoPageShell>
  );
}
