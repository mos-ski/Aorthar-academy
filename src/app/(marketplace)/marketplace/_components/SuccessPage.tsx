'use client';

import Link from 'next/link';

export default function SuccessPage({
  productName,
  downloadToken,
  tokenExpiresAt,
  email,
  error,
}: {
  productName: string;
  downloadToken: string | null;
  tokenExpiresAt: string | null;
  email: string;
  error: string | null;
}) {
  const expiryDate = tokenExpiresAt
    ? new Date(tokenExpiresAt).toLocaleDateString('en-NG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  if (error || !downloadToken) {
    return (
      <section className="px-5 sm:px-10 py-24" style={{ backgroundColor: '#101010', minHeight: 'calc(100vh - 56px)' }}>
        <div className="max-w-[560px] mx-auto text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: 'rgba(248,113,113,0.12)' }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 8v5M12 16h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-[28px] font-semibold mb-3" style={{ letterSpacing: '-0.02em' }}>
            Payment Not Confirmed
          </h1>
          <p className="text-[15px] leading-7 mb-8" style={{ color: '#b1b1b1' }}>
            {error ?? 'We could not verify your payment. This can happen if the page was closed early.'}
          </p>
          <p className="text-[14px] mb-6" style={{ color: '#b1b1b1' }}>
            If you completed payment, please wait a moment and{' '}
            <button
              onClick={() => window.location.reload()}
              className="underline hover:opacity-80"
              style={{ color: '#a7d252' }}
            >
              refresh this page
            </button>
            . Still having trouble?{' '}
            <a href="mailto:hello@aorthar.com" className="underline hover:opacity-80" style={{ color: '#a7d252' }}>
              Email us
            </a>
            .
          </p>
          <Link
            href="/marketplace"
            className="text-[13px] underline"
            style={{ color: '#6b7280' }}
          >
            ← Back to Marketplace
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="px-5 sm:px-10 py-24" style={{ backgroundColor: '#101010', minHeight: 'calc(100vh - 56px)' }}>
      <div className="max-w-[560px] mx-auto text-center">
        {/* Checkmark */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: 'rgba(167,210,82,0.12)' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#a7d252" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <p className="text-[13px] font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: '#a7d252' }}>
          Payment Confirmed
        </p>
        <h1
          className="text-[32px] sm:text-[40px] font-semibold mb-4 leading-[1.1]"
          style={{ letterSpacing: '-0.02em' }}
        >
          {productName}
        </h1>
        <p className="text-[16px] leading-7 mb-10" style={{ color: '#b1b1b1' }}>
          Your file is ready. Click the button below to download it immediately.
        </p>

        {/* Download button */}
        <a
          href={`/api/marketplace/download?token=${downloadToken}`}
          target="_blank"
          rel="noreferrer"
          className="inline-block w-full sm:w-auto px-8 py-4 font-bold text-[16px] hover:opacity-90 transition-opacity mb-6"
          style={{ backgroundColor: '#08694a', color: '#ffffff' }}
        >
          Download {productName} →
        </a>

        {/* Email notice */}
        <div
          className="p-5 rounded-xl text-left mb-6"
          style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p className="text-[14px] leading-6" style={{ color: '#c4cdd6' }}>
            📧 A download link has also been sent to <strong className="text-white">{email}</strong>.
            {expiryDate && (
              <> The link is valid until <strong className="text-white">{expiryDate}</strong>.</>
            )}
          </p>
        </div>

        <p className="text-[13px]" style={{ color: '#6b7280' }}>
          Link expired or trouble downloading?{' '}
          <a href="mailto:hello@aorthar.com" className="underline hover:text-white transition-colors">
            hello@aorthar.com
          </a>
        </p>

        <div className="mt-10">
          <Link
            href="/marketplace"
            className="text-[13px] underline hover:text-white transition-colors"
            style={{ color: '#6b7280' }}
          >
            ← Back to Marketplace
          </Link>
        </div>
      </div>
    </section>
  );
}
