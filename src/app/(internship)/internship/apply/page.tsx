'use client';

import { useState } from 'react';
import Link from 'next/link';

function InternshipNav() {
  return (
    <header
      className="flex items-center justify-between px-5 sm:px-10 h-14 border-b sticky top-0 z-10"
      style={{ backgroundColor: '#18191a', borderColor: 'rgba(255,255,255,0.08)' }}
    >
      <Link href="/internship">
        <img src="/Aorthar Logo long complete.svg" alt="Aorthar" width={99} height={43} />
      </Link>
    </header>
  );
}

export default function ApplyPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/internship/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      if (data.payment_url === null && data.ref) {
        // Already paid but form not submitted — redirect to application
        window.location.href = `/internship/application?ref=${data.ref}`;
        return;
      }

      if (data.payment_url) {
        window.location.href = data.payment_url;
        return;
      }

      setError('Unexpected response. Please try again.');
      setLoading(false);
    } catch {
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#18191a', color: '#ffffff' }}>
      <InternshipNav />

      <section className="px-5 sm:px-10 py-16 sm:py-24" style={{ backgroundColor: '#101010' }}>
        <div className="max-w-[560px] mx-auto">
          <p className="text-[13px] font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: '#a7d252' }}>
            Applications Open
          </p>
          <h1
            className="text-[32px] sm:text-[44px] font-semibold mb-4 leading-[1.1]"
            style={{ letterSpacing: '-0.02em' }}
          >
            Ready to Apply?
          </h1>
          <p className="text-[15px] sm:text-[17px] leading-7 mb-10" style={{ color: '#b1b1b1' }}>
            Enter your email to begin. You'll be redirected to Paystack to complete the ₦10,000 application fee, then returned here to fill in your details.
          </p>

          {/* What happens next */}
          <div
            className="p-5 rounded-xl mb-8 space-y-3"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {[
              { n: '1', text: 'Pay ₦10,000 via Paystack — your application fee' },
              { n: '2', text: 'Complete your application form with your track and background' },
              { n: '3', text: 'Receive your 24-hour assessment link by email' },
              { n: '4', text: 'Take the exam and see your results instantly' },
            ].map((step) => (
              <div key={step.n} className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 mt-0.5"
                  style={{ backgroundColor: 'rgba(167,210,82,0.15)', color: '#a7d252' }}
                >
                  {step.n}
                </div>
                <p className="text-[14px] leading-6" style={{ color: '#c4cdd6' }}>{step.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-white">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@email.com"
                className="w-full px-4 py-3 text-[15px] text-white placeholder-white/30 outline-none focus:border-[#a7d252] transition-colors"
                style={{ backgroundColor: '#1c1c1c', border: '1px solid rgba(255,255,255,0.12)' }}
              />
            </div>

            {error && (
              <p className="text-[13px]" style={{ color: '#f87171' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 font-bold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-60"
              style={{ backgroundColor: '#08694a', color: '#ffffff' }}
            >
              {loading ? 'Redirecting to payment…' : 'Pay ₦10,000 and Apply →'}
            </button>
          </form>

          <p className="text-[13px] mt-5" style={{ color: '#6b7280' }}>
            You'll be redirected to Paystack&apos;s secure checkout. After payment, you'll return here automatically.
          </p>

          <p className="text-[13px] mt-4" style={{ color: '#6b7280' }}>
            Already paid?{' '}
            <Link href="/internship" className="underline hover:text-white transition-colors">
              Back to internship page
            </Link>
          </p>
        </div>
      </section>

      <footer className="px-5 sm:px-10 py-8 border-t text-center text-[13px]" style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#6b7280' }}>
        © 2025 Aorthar Academy ·{' '}
        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
        {' · '}
        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
      </footer>
    </div>
  );
}
