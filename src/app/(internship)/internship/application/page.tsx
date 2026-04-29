'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const TRACKS = [
  'Product Design',
  'Product Management',
  'QA & Testing',
  'Scrum & Agile',
  'Tech Operations',
];

const STATUSES = ['Student', 'New Graduate', 'Career Changer', 'Currently Employed', 'Other'];

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

function ApplicationForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ref = searchParams.get('ref') ?? '';

  type VerifyState = 'verifying' | 'ready' | 'error';
  const [verifyState, setVerifyState] = useState<VerifyState>('verifying');
  const [verifyError, setVerifyError] = useState('');
  const [applicationId, setApplicationId] = useState('');
  const [prefillEmail, setPrefillEmail] = useState('');

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    portfolio_url: '',
    track: '',
    current_status: '',
    motivation: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!ref) {
      setVerifyState('error');
      setVerifyError('No payment reference found. Please complete payment first.');
      return;
    }

    fetch(`/api/internship/verify-payment?ref=${encodeURIComponent(ref)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setApplicationId(data.application_id);
          setPrefillEmail(data.email ?? '');
          setForm((f) => ({ ...f, email: data.email ?? '' }));
          setVerifyState('ready');
        } else {
          setVerifyState('error');
          setVerifyError(data.error ?? 'Payment not confirmed. Please complete payment first.');
        }
      })
      .catch(() => {
        setVerifyState('error');
        setVerifyError('Could not verify your payment. Please try again.');
      });
  }, [ref]);

  void applicationId;
  void prefillEmail;

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.motivation.trim().length < 50) {
      setSubmitError('Please write at least 50 characters in the motivation field.');
      return;
    }
    setLoading(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/internship/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: ref, ...form }),
      });

      const data = await res.json();

      if (res.ok || (res.status === 409 && data.already_submitted)) {
        router.push('/internship/confirmation');
        return;
      }

      setSubmitError(data.error ?? 'Failed to submit application. Please try again.');
    } catch {
      setSubmitError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    backgroundColor: '#1c1c1c',
    border: '1px solid rgba(255,255,255,0.12)',
  };

  if (verifyState === 'verifying') {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#a7d252', borderTopColor: 'transparent' }} />
        <p className="text-[15px]" style={{ color: '#b1b1b1' }}>Verifying your payment…</p>
      </div>
    );
  }

  if (verifyState === 'error') {
    return (
      <div className="max-w-[560px] mx-auto py-24 text-center space-y-5">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: 'rgba(248,113,113,0.15)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 8v5M12 16h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <h2 className="text-[22px] font-semibold text-white">Payment Not Confirmed</h2>
        <p className="text-[15px] leading-7" style={{ color: '#b1b1b1' }}>{verifyError}</p>
        <Link
          href="/internship/apply"
          className="inline-block px-6 py-3 font-bold text-[14px] hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#08694a', color: '#ffffff' }}
        >
          Back to Apply
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[640px] mx-auto py-12 px-5 sm:px-0">
      <p className="text-[13px] font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: '#a7d252' }}>
        Application Form
      </p>
      <h1 className="text-[28px] sm:text-[36px] font-semibold mb-2" style={{ letterSpacing: '-0.02em' }}>
        Tell Us About Yourself
      </h1>
      <p className="text-[15px] leading-7 mb-8" style={{ color: '#b1b1b1' }}>
        Your assessment link will be sent to the email you used during payment.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-white">Full name *</label>
            <input name="full_name" value={form.full_name} onChange={handleChange} required placeholder="Your full name" className="w-full px-4 py-3 text-[14px] text-white placeholder-white/30 outline-none focus:border-[#a7d252] transition-colors" style={inputStyle} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-white">Email *</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@email.com" className="w-full px-4 py-3 text-[14px] text-white placeholder-white/30 outline-none focus:border-[#a7d252] transition-colors" style={inputStyle} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-white">Phone number</label>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="+234..." className="w-full px-4 py-3 text-[14px] text-white placeholder-white/30 outline-none focus:border-[#a7d252] transition-colors" style={inputStyle} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-white">LinkedIn or portfolio URL</label>
            <input name="portfolio_url" value={form.portfolio_url} onChange={handleChange} placeholder="https://linkedin.com/in/..." className="w-full px-4 py-3 text-[14px] text-white placeholder-white/30 outline-none focus:border-[#a7d252] transition-colors" style={inputStyle} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-white">Which track? *</label>
            <select name="track" value={form.track} onChange={handleChange} required className="w-full px-4 py-3 text-[14px] text-white outline-none focus:border-[#a7d252] transition-colors" style={inputStyle}>
              <option value="" disabled>Select track…</option>
              {TRACKS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-white">Current status *</label>
            <select name="current_status" value={form.current_status} onChange={handleChange} required className="w-full px-4 py-3 text-[14px] text-white outline-none focus:border-[#a7d252] transition-colors" style={inputStyle}>
              <option value="" disabled>Select…</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-white">Why do you want to join Aorthar? *</label>
          <textarea name="motivation" value={form.motivation} onChange={handleChange} required rows={5} placeholder="Tell us what drives you and what you hope to achieve… (min. 50 characters)" className="w-full px-4 py-3 text-[14px] text-white placeholder-white/30 outline-none focus:border-[#a7d252] transition-colors resize-none" style={inputStyle} />
          <p className="text-[12px]" style={{ color: form.motivation.length < 50 ? '#6b7280' : '#a7d252' }}>
            {form.motivation.length} / 50 minimum
          </p>
        </div>

        {submitError && (
          <p className="text-[13px]" style={{ color: '#f87171' }}>{submitError}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 font-bold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-60"
          style={{ backgroundColor: '#08694a', color: '#ffffff' }}
        >
          {loading ? 'Submitting…' : 'Submit Application →'}
        </button>
      </form>
    </div>
  );
}

export default function ApplicationPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#18191a', color: '#ffffff' }}>
      <InternshipNav />
      <section className="px-5 sm:px-10" style={{ backgroundColor: '#101010', minHeight: 'calc(100vh - 56px)' }}>
        <Suspense fallback={
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#a7d252', borderTopColor: 'transparent' }} />
          </div>
        }>
          <ApplicationForm />
        </Suspense>
      </section>
    </div>
  );
}
