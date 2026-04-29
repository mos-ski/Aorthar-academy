'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

type ExamStep = 'verify-email' | 'enter-otp' | 'exam' | 'result' | 'error';

type Question = {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
};

type ExamResult = {
  score_percent: number;
  passed: boolean;
  correct_count: number;
  total_questions: number;
};

function Nav() {
  return (
    <header
      className="flex items-center px-5 sm:px-10 h-14 border-b"
      style={{ backgroundColor: '#18191a', borderColor: 'rgba(255,255,255,0.08)' }}
    >
      <img src="/Aorthar Logo long complete.svg" alt="Aorthar" width={99} height={43} />
    </header>
  );
}

function StepIndicator({ current }: { current: ExamStep }) {
  const steps: { key: ExamStep; label: string }[] = [
    { key: 'verify-email', label: 'Verify Email' },
    { key: 'enter-otp', label: 'Confirm Code' },
    { key: 'exam', label: 'Assessment' },
    { key: 'result', label: 'Results' },
  ];
  const order = steps.map((s) => s.key);
  const currentIdx = order.indexOf(current);

  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={s.key} className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
              style={
                done
                  ? { backgroundColor: '#08694a', color: '#ffffff' }
                  : active
                  ? { backgroundColor: '#a7d252', color: '#18191a' }
                  : { backgroundColor: 'rgba(255,255,255,0.1)', color: '#a0aba7' }
              }
            >
              {done ? '✓' : i + 1}
            </div>
            <span className="text-[12px] hidden sm:block" style={{ color: active ? '#ffffff' : '#a0aba7' }}>
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div className="w-6 h-px mx-1" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ExamPortalPage() {
  const params = useParams();
  const token = Array.isArray(params.token) ? params.token[0] : (params.token ?? '');

  const [step, setStep] = useState<ExamStep>('verify-email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [applicationId, setApplicationId] = useState('');
  const [result, setResult] = useState<ExamResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // OTP cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const sendOtp = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/internship/exam/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setResendCooldown(60);
      } else if (res.status === 429) {
        setResendCooldown(data.retry_after ?? 60);
        setOtpSent(true);
      } else {
        setError(data.error ?? 'Failed to send code. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token, email]);

  async function handleVerifyEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/internship/exam/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email: email.trim() }),
      });
      const data = await res.json();

      if (res.ok) {
        setApplicationId(data.application_id);
        setStep('enter-otp');
        sendOtp();
      } else if (res.status === 409 && data.already_attempted) {
        setError('You have already completed this assessment.');
        setStep('error');
      } else if (res.status === 410) {
        setError(data.error ?? 'This exam link has expired or is invalid.');
        setStep('error');
      } else {
        setError(data.error ?? 'Could not verify your email. Please check and try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/internship/exam/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email: email.trim(), otp: otp.trim() }),
      });
      const data = await res.json();

      if (res.ok) {
        await startExam();
      } else {
        setError(data.error ?? 'Incorrect code. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function startExam() {
    setLoading(true);
    try {
      const res = await fetch('/api/internship/exam/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email: email.trim() }),
      });
      const data = await res.json();

      if (res.ok) {
        setQuestions(data.questions ?? []);
        setApplicationId(data.application_id);
        setStep('exam');
      } else {
        setError(data.error ?? 'Failed to start exam. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function submitExam() {
    setShowConfirmModal(false);
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/internship/exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id: applicationId, answers }),
      });
      const data = await res.json();

      if (res.ok) {
        setResult(data);
        setStep('result');
      } else {
        setError(data.error ?? 'Failed to submit exam. Please try again.');
      }
    } catch {
      setError('Network error during submission. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id]);

  const inputStyle = {
    backgroundColor: '#1c1c1c',
    border: '1px solid rgba(255,255,255,0.12)',
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#18191a', color: '#ffffff' }}>
      <Nav />

      <section className="px-5 sm:px-10 py-12" style={{ backgroundColor: '#101010', minHeight: 'calc(100vh - 56px)' }}>
        <div className="max-w-[700px] mx-auto">
          {step !== 'error' && step !== 'result' && <StepIndicator current={step} />}

          {/* ── Step: Verify Email ── */}
          {step === 'verify-email' && (
            <div className="space-y-6 max-w-[480px]">
              <div>
                <p className="text-[13px] font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: '#a7d252' }}>Step 1</p>
                <h2 className="text-[28px] font-semibold mb-3" style={{ letterSpacing: '-0.02em' }}>Confirm Your Email</h2>
                <p className="text-[15px] leading-7" style={{ color: '#b1b1b1' }}>
                  Enter the email address you used when you applied to verify your identity.
                </p>
              </div>
              <form onSubmit={handleVerifyEmail} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-white">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@email.com"
                    className="w-full px-4 py-3 text-[15px] text-white placeholder-white/30 outline-none focus:border-[#a7d252] transition-colors"
                    style={inputStyle}
                  />
                </div>
                {error && <p className="text-[13px]" style={{ color: '#f87171' }}>{error}</p>}
                <button type="submit" disabled={loading} className="w-full py-3 font-bold text-[14px] hover:opacity-90 transition-opacity disabled:opacity-60" style={{ backgroundColor: '#08694a', color: '#ffffff' }}>
                  {loading ? 'Verifying…' : 'Continue →'}
                </button>
              </form>
            </div>
          )}

          {/* ── Step: Enter OTP ── */}
          {step === 'enter-otp' && (
            <div className="space-y-6 max-w-[480px]">
              <div>
                <p className="text-[13px] font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: '#a7d252' }}>Step 2</p>
                <h2 className="text-[28px] font-semibold mb-3" style={{ letterSpacing: '-0.02em' }}>Enter Your Code</h2>
                <p className="text-[15px] leading-7" style={{ color: '#b1b1b1' }}>
                  {otpSent
                    ? <>We sent a 6-digit code to <strong className="text-white">{email}</strong>. Enter it below.</>
                    : 'Sending your code…'}
                </p>
              </div>
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-white">6-digit code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    maxLength={6}
                    placeholder="000000"
                    className="w-full px-4 py-3 text-[24px] font-bold tracking-[0.3em] text-white placeholder-white/20 outline-none focus:border-[#a7d252] transition-colors text-center"
                    style={inputStyle}
                  />
                </div>
                {error && <p className="text-[13px]" style={{ color: '#f87171' }}>{error}</p>}
                <button type="submit" disabled={loading || otp.length < 6} className="w-full py-3 font-bold text-[14px] hover:opacity-90 transition-opacity disabled:opacity-60" style={{ backgroundColor: '#08694a', color: '#ffffff' }}>
                  {loading ? 'Verifying…' : 'Verify and Start Exam →'}
                </button>
              </form>
              <div className="flex items-center gap-2">
                <p className="text-[13px]" style={{ color: '#6b7280' }}>Didn&apos;t receive it?</p>
                <button
                  onClick={sendOtp}
                  disabled={resendCooldown > 0 || loading}
                  className="text-[13px] font-medium underline disabled:opacity-40"
                  style={{ color: '#a7d252' }}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                </button>
              </div>
            </div>
          )}

          {/* ── Step: Exam ── */}
          {step === 'exam' && (
            <div className="space-y-8">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.2em] mb-1" style={{ color: '#a7d252' }}>Assessment</p>
                  <h2 className="text-[24px] font-semibold" style={{ letterSpacing: '-0.02em' }}>{questions.length} Questions</h2>
                </div>
                <div className="text-right">
                  <p className="text-[13px]" style={{ color: '#6b7280' }}>Answered</p>
                  <p className="text-[20px] font-bold text-white">{Object.keys(answers).length} / {questions.length}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${questions.length > 0 ? (Object.keys(answers).length / questions.length) * 100 : 0}%`, backgroundColor: '#a7d252' }}
                />
              </div>

              <div
                className="p-4 rounded-xl text-[13px]"
                style={{ backgroundColor: 'rgba(167,210,82,0.07)', border: '1px solid rgba(167,210,82,0.2)', color: '#c4cdd6' }}
              >
                Pass mark is <strong className="text-white">70%</strong>. There are no retakes — submit when you&apos;re ready.
              </div>

              {/* Questions */}
              <div className="space-y-8">
                {questions.map((q, qi) => (
                  <div
                    key={q.id}
                    className="p-6 rounded-xl"
                    style={{ backgroundColor: '#1c1c1c', border: answers[q.id] ? '1px solid rgba(167,210,82,0.3)' : '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <p className="text-[13px] font-semibold mb-3" style={{ color: '#a7d252' }}>Question {qi + 1}</p>
                    <p className="text-[15px] leading-6 text-white mb-5">{q.question_text}</p>
                    <div className="space-y-2">
                      {(['a', 'b', 'c', 'd'] as const).map((opt) => {
                        const text = q[`option_${opt}`];
                        const selected = answers[q.id] === opt;
                        return (
                          <label
                            key={opt}
                            className="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all"
                            style={{
                              backgroundColor: selected ? 'rgba(167,210,82,0.12)' : 'rgba(255,255,255,0.03)',
                              border: selected ? '1px solid rgba(167,210,82,0.5)' : '1px solid rgba(255,255,255,0.06)',
                            }}
                          >
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-bold"
                              style={{
                                backgroundColor: selected ? '#a7d252' : 'rgba(255,255,255,0.1)',
                                color: selected ? '#18191a' : '#a0aba7',
                              }}
                            >
                              {opt.toUpperCase()}
                            </div>
                            <span className="text-[14px] leading-6" style={{ color: selected ? '#ffffff' : '#c4cdd6' }}>{text}</span>
                            <input
                              type="radio"
                              name={q.id}
                              value={opt}
                              checked={selected}
                              onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                              className="sr-only"
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {error && <p className="text-[13px]" style={{ color: '#f87171' }}>{error}</p>}

              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={!allAnswered || submitting}
                className="w-full py-4 font-bold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-40"
                style={{ backgroundColor: allAnswered ? '#08694a' : 'rgba(255,255,255,0.1)', color: '#ffffff' }}
              >
                {submitting ? 'Submitting…' : allAnswered ? 'Submit Exam →' : `Answer all ${questions.length - Object.keys(answers).length} remaining question${questions.length - Object.keys(answers).length !== 1 ? 's' : ''} to submit`}
              </button>
            </div>
          )}

          {/* ── Result ── */}
          {step === 'result' && result && (
            <div className="space-y-8 max-w-[560px]">
              <div className="text-center space-y-4">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                  style={{ backgroundColor: result.passed ? 'rgba(167,210,82,0.15)' : 'rgba(248,113,113,0.12)' }}
                >
                  {result.passed ? (
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                      <path d="M7 18l7 7 15-15" stroke="#a7d252" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                      <path d="M11 11l14 14M25 11L11 25" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  )}
                </div>

                <div>
                  <p
                    className="text-[13px] font-semibold uppercase tracking-[0.15em] mb-2"
                    style={{ color: result.passed ? '#a7d252' : '#f87171' }}
                  >
                    {result.passed ? 'Passed' : 'Not Passed'}
                  </p>
                  <p
                    className="text-[72px] font-black leading-none"
                    style={{ fontFamily: "Impact, 'Arial Narrow', Arial, sans-serif", color: result.passed ? '#a7d252' : '#f87171', letterSpacing: '-2px' }}
                  >
                    {Math.round(result.score_percent)}%
                  </p>
                  <p className="text-[16px] mt-2" style={{ color: '#b1b1b1' }}>
                    {result.correct_count} of {result.total_questions} questions correct · Pass mark: 70%
                  </p>
                </div>
              </div>

              <div
                className="p-5 rounded-xl text-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {result.passed ? (
                  <p className="text-[15px] leading-7" style={{ color: '#c4cdd6' }}>
                    Excellent work! Our team will review all results and <strong className="text-white">reach out within 5 business days</strong> with next steps. Check your email for a copy of your result.
                  </p>
                ) : (
                  <p className="text-[15px] leading-7" style={{ color: '#c4cdd6' }}>
                    Thank you for applying. We appreciate the effort you put in. A copy of your result has been sent to your email. <strong className="text-white">We encourage you to apply again in our next cohort.</strong>
                  </p>
                )}
              </div>

              {result.passed && (
                <a
                  href="https://chat.whatsapp.com/BaZqynmCDKrEkiY0OED51K"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 font-bold text-[14px] hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#25D366', color: '#ffffff' }}
                >
                  Join the WhatsApp Community →
                </a>
              )}

              <p className="text-center text-[13px]" style={{ color: '#6b7280' }}>
                <Link href="/internship" className="underline hover:text-white transition-colors">Back to internship page</Link>
              </p>
            </div>
          )}

          {/* ── Error ── */}
          {step === 'error' && (
            <div className="max-w-[480px] space-y-6 text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                style={{ backgroundColor: 'rgba(248,113,113,0.12)' }}
              >
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M14 10v6M14 19h.01M26 14a12 12 0 11-24 0 12 12 0 0124 0z" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <h2 className="text-[24px] font-semibold text-white">Something Went Wrong</h2>
              <p className="text-[15px] leading-7" style={{ color: '#b1b1b1' }}>{error || 'This exam link is invalid or has expired.'}</p>
              <Link
                href="/internship"
                className="inline-block px-6 py-3 font-bold text-[14px] hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#08694a', color: '#ffffff' }}
              >
                Back to Internship Page
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Confirm submit modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div
            className="w-full max-w-[400px] p-8 rounded-2xl space-y-5"
            style={{ backgroundColor: '#1c1c1c', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            <h3 className="text-[20px] font-semibold text-white">Submit Your Exam?</h3>
            <p className="text-[14px] leading-6" style={{ color: '#b1b1b1' }}>
              You&apos;ve answered all {questions.length} questions. Once submitted, <strong className="text-white">you cannot change your answers</strong>. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 text-[14px] font-medium hover:opacity-80 transition-opacity"
                style={{ border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff' }}
              >
                Go Back
              </button>
              <button
                onClick={submitExam}
                className="flex-1 py-3 font-bold text-[14px] hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#08694a', color: '#ffffff' }}
              >
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
