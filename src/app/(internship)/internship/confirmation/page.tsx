import Link from 'next/link';

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#18191a', color: '#ffffff' }}>
      {/* Nav */}
      <header
        className="flex items-center justify-between px-5 sm:px-10 h-14 border-b"
        style={{ backgroundColor: '#18191a', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <Link href="/internship">
          <img src="/Aorthar Logo long complete.svg" alt="Aorthar" width={99} height={43} />
        </Link>
      </header>

      <section className="px-5 sm:px-10 py-20 sm:py-32" style={{ backgroundColor: '#101010', minHeight: 'calc(100vh - 56px)' }}>
        <div className="max-w-[560px] mx-auto text-center space-y-6">
          {/* Checkmark */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
            style={{ backgroundColor: 'rgba(167,210,82,0.15)' }}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M6 16l7 7 13-13" stroke="#a7d252" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="space-y-3">
            <h1 className="text-[32px] sm:text-[40px] font-semibold text-white" style={{ letterSpacing: '-0.02em' }}>
              Application Submitted!
            </h1>
            <p className="text-[16px] leading-7" style={{ color: '#b1b1b1' }}>
              Your application has been received. Check your inbox — we&apos;ve sent you an assessment link that expires in <strong className="text-white">24 hours</strong>.
            </p>
          </div>

          {/* Info box */}
          <div
            className="p-5 rounded-xl text-left space-y-3"
            style={{ backgroundColor: 'rgba(167,210,82,0.07)', border: '1px solid rgba(167,210,82,0.2)' }}
          >
            <p className="text-[14px] font-semibold text-white">What happens next?</p>
            {[
              'Open the email from Aorthar Academy (check spam if you don\'t see it)',
              'Click "Start Your Assessment" — you\'ll verify your email with a one-time code',
              'Complete the multiple-choice exam — there are no retakes',
              'See your score immediately and receive a copy by email',
            ].map((step) => (
              <div key={step} className="flex items-start gap-2.5">
                <div
                  className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'rgba(167,210,82,0.2)' }}
                >
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                    <path d="M1 3L2.8 5L7 1" stroke="#a7d252" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-[13px] leading-5" style={{ color: '#c4cdd6' }}>{step}</p>
              </div>
            ))}
          </div>

          {/* WhatsApp CTA */}
          <a
            href="https://chat.whatsapp.com/BaZqynmCDKrEkiY0OED51K"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-bold text-[14px] px-6 py-3 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#25D366', color: '#ffffff' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Join the WhatsApp Community
          </a>

          <p className="text-[13px]" style={{ color: '#6b7280' }}>
            <Link href="/internship" className="underline hover:text-white transition-colors">
              Back to internship page
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
