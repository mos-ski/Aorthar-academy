'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import YouTubePlayer from '@/components/standalone/YouTubePlayer';
import DrivePlayer from '@/components/standalone/DrivePlayer';
import BuyButton from '@/components/standalone/BuyButton';
import UserAvatar from '@/components/standalone/UserAvatar';
import PurchasePanel from '@/components/standalone/PurchasePanel';
import { getCouponCodeFromSearch } from '@/utils/couponLink';

type Lesson = { id: string; title: string; sort_order: number; youtube_url: string; content: string | null };
type ScheduledLesson = { id: string; title: string; sort_order: number };

interface Props {
  course: {
    id: string;
    slug: string;
    title: string;
    description: string;
    long_description: string;
    price_ngn: number;
    instructor_name: string;
    instructor_avatar_url: string | null;
    thumbnail_url: string | null;
    allow_payment_plan: boolean;
  };
  lessons: Lesson[];
  scheduledLessons?: ScheduledLesson[];
  firstLesson: Lesson | null;
  hasPurchased: boolean;
  isLoggedIn: boolean;
  userEmail?: string;
  userFullName?: string | null;
  userAvatarUrl?: string | null;
  paymentPlanMinPercent: number;
  paymentPlanDeadlineDays: number;
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function extractDriveId(url: string): string | null {
  if (!url) return null;
  let m = url.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/);
  if (m) return m[1];
  m = url.match(/drive\.google\.com\/open\?id=([A-Za-z0-9_-]+)/);
  if (m) return m[1];
  m = url.match(/drive\.google\.com\/uc.*[?&]id=([A-Za-z0-9_-]+)/);
  if (m) return m[1];
  m = url.match(/([A-Za-z0-9_-]{20,})/);
  if (m && url.includes('drive.google')) return m[1];
  return null;
}

type VideoSource =
  | { type: 'youtube'; id: string }
  | { type: 'drive'; id: string }
  | null;

function detectVideo(url: string): VideoSource {
  if (!url) return null;
  const ytId = extractYouTubeId(url);
  if (ytId) return { type: 'youtube', id: ytId };
  const driveId = extractDriveId(url);
  if (driveId) return { type: 'drive', id: driveId };
  return null;
}

function getCompletedIds(lessons: Lesson[], activeId: string | undefined): Set<string> {
  const set = new Set<string>();
  for (const l of lessons) {
    if (l.id === activeId) break;
    set.add(l.id);
  }
  return set;
}

export default function CourseWatch({ course, lessons, scheduledLessons = [], firstLesson, hasPurchased, isLoggedIn, userEmail, userFullName, userAvatarUrl, paymentPlanMinPercent, paymentPlanDeadlineDays }: Props) {
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(firstLesson);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_type: string; discount_value: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [autoApplied, setAutoApplied] = useState(false);
  const [urlCouponNotice, setUrlCouponNotice] = useState('');

  const discountedPrice = appliedCoupon
    ? appliedCoupon.discount_type === 'percentage'
      ? Math.max(0, Math.round(course.price_ngn * (1 - appliedCoupon.discount_value / 100)))
      : Math.max(0, appliedCoupon.discount_value)
    : course.price_ngn;

  // Carry the applied coupon through registration/login so it survives the
  // redirect to /courses-app/checkout/[slug] — without this, a new visitor
  // who signs up from a coupon link gets charged full price.
  const checkoutPath = `/courses-app/checkout/${course.slug}`;
  const checkoutNext = appliedCoupon ? `${checkoutPath}?coupon=${encodeURIComponent(appliedCoupon.code)}` : checkoutPath;
  const registerHref = `/register?next=${encodeURIComponent(checkoutNext)}`;
  const loginHref = `/login?next=${encodeURIComponent(checkoutNext)}`;

  async function validateCoupon(code: string, fromUrl: boolean) {
    if (!code.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await fetch(`/api/standalone/coupon?code=${encodeURIComponent(code.trim())}&course_id=${course.id}`);
      const data = await res.json();
      if (!res.ok) {
        if (fromUrl) {
          setUrlCouponNotice(data.error ?? 'This coupon code is no longer valid');
        } else {
          setCouponError(data.error ?? 'Invalid coupon code');
        }
        setAppliedCoupon(null);
        return;
      }
      setAppliedCoupon({ code: data.code, discount_type: data.discount_type, discount_value: data.discount_value });
      setCouponError('');
      setUrlCouponNotice('');
      setAutoApplied(fromUrl);
    } catch (err) {
      console.error('[CourseWatch] Coupon validation error:', err);
      if (fromUrl) {
        setUrlCouponNotice('Could not validate coupon. Please try again.');
      } else {
        setCouponError('Could not validate coupon. Please try again.');
      }
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  }

  async function applyCoupon() {
    await validateCoupon(couponInput, false);
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
    setAutoApplied(false);
    setUrlCouponNotice('');
  }

  useEffect(() => {
    const code = getCouponCodeFromSearch(window.location.search);
    if (code) {
      setCouponInput(code);
      validateCoupon(code, true);
    }
    // Intentionally run once on mount only — re-running on every render would
    // re-fetch and could clobber a coupon the visitor entered manually.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const videoSource = activeLesson ? detectVideo(activeLesson.youtube_url) : null;
  const previewSeconds = !hasPurchased && videoSource ? 60 : undefined;

  const activeLessonIdx = lessons.findIndex(l => l.id === activeLesson?.id);
  const nextLesson = lessons[activeLessonIdx + 1] ?? null;
  const completedIds = getCompletedIds(lessons, activeLesson?.id);

  // Merged course menu: published lessons (playable) + scheduled lessons (coming soon), in order
  type MenuEntry =
    | { kind: 'lesson'; lesson: Lesson; lessonIndex: number }
    | { kind: 'scheduled'; lesson: ScheduledLesson };
  const menuEntries: MenuEntry[] = [
    ...lessons.map((lesson, lessonIndex): MenuEntry => ({ kind: 'lesson', lesson, lessonIndex })),
    ...scheduledLessons.map((lesson): MenuEntry => ({ kind: 'scheduled', lesson })),
  ].sort((a, b) => a.lesson.sort_order - b.lesson.sort_order);

  function selectLesson(lesson: Lesson, unlocked: boolean) {
    if (!unlocked) return;
    setActiveLesson(lesson);
    setPaywallVisible(false);
  }

  return (
    <div className="min-h-screen md:h-[100dvh] md:overflow-hidden flex flex-col" style={{ backgroundColor: '#0f1011', color: '#fff' }}>

      {/* Top nav */}
      <header
        className="h-13 px-6 sm:px-10 flex items-center justify-between border-b shrink-0 z-20"
        style={{ borderColor: 'rgba(255,255,255,0.07)', backgroundColor: '#0f1011' }}
      >
        <Link href="/courses-app" className="flex items-center gap-2">
          <Image src="/Aorthar Logo long complete.svg" alt="Aorthar" width={104} height={45} className="h-8 w-auto" unoptimized />
        </Link>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <Link
                href="/courses-app/learn"
                className="text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: '#a7d252' }}
              >
                My Courses
              </Link>
              <UserAvatar email={userEmail ?? ''} fullName={userFullName} avatarUrl={userAvatarUrl} />
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-white/50 hover:text-white transition-colors">Sign in</Link>
              <Link
                href={registerHref}
                className="text-sm font-semibold px-4 py-2 text-black transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#a7d252' }}
              >
                Enroll — ₦{course.price_ngn.toLocaleString()}
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 md:min-h-0 md:overflow-hidden gap-4 md:gap-6 px-4 sm:px-6 md:px-10 py-4 md:py-7 max-w-[1280px] mx-auto w-full">

        {/* Left: Course Menu */}
        <div className="w-[320px] shrink-0 flex-col gap-3 hidden md:flex md:min-h-0">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest">Course Menu</h2>

          <div
            className="rounded-xl border overflow-hidden flex-1 min-h-0"
            style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: '#18191a' }}
          >
            {menuEntries.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-white/30">Lessons coming soon</div>
            ) : (
              <ul className="h-full overflow-y-auto">
                {menuEntries.map((entry) => {
                  if (entry.kind === 'scheduled') {
                    const lesson = entry.lesson;
                    return (
                      <li key={`scheduled-${lesson.id}`} className="border-b last:border-b-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                        <div className="w-full flex items-center justify-between px-5 py-3.5 cursor-default">
                          <span className="text-sm leading-snug" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            {lesson.sort_order}. {lesson.title}
                          </span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ml-3" style={{ backgroundColor: 'rgba(99,130,255,0.15)', color: 'rgba(130,160,255,0.8)' }}>
                            Scheduled
                          </span>
                        </div>
                      </li>
                    );
                  }

                  const { lesson, lessonIndex: i } = entry;
                  const isActive = activeLesson?.id === lesson.id;
                  const isDone = completedIds.has(lesson.id);
                  const isFirst = i === 0;
                  const isUnlocked = hasPurchased || isFirst;

                  return (
                    <li key={lesson.id} className="border-b last:border-b-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                      <button
                        onClick={() => selectLesson(lesson, isUnlocked)}
                        disabled={!isUnlocked}
                        className="w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors"
                        style={{
                          cursor: isUnlocked ? 'pointer' : 'default',
                          backgroundColor: isActive ? 'rgba(167,210,82,0.07)' : 'transparent',
                        }}
                      >
                        <span
                          className="text-sm leading-snug"
                          style={{
                            color: isDone
                              ? 'rgba(255,255,255,0.25)'
                              : isActive
                              ? '#a7d252'
                              : isUnlocked
                              ? 'rgba(255,255,255,0.85)'
                              : 'rgba(255,255,255,0.2)',
                            fontWeight: isActive ? 500 : 400,
                          }}
                        >
                          {lesson.sort_order}. {lesson.title}
                        </span>

                        {isDone ? (
                          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0 ml-3">
                            <path d="M3 7.5L6.5 11L12 4" stroke="rgba(255,255,255,0.25)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : isActive ? (
                          <span className="text-xs font-semibold shrink-0 ml-3" style={{ color: '#a7d252' }}>
                            {!hasPurchased ? '1:00' : '▶'}
                          </span>
                        ) : isUnlocked ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 ml-3" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 8l6 4-6 4V8z" />
                          </svg>
                        ) : (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="shrink-0 ml-3" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Middle: Video + title */}
        <div className="flex-1 flex flex-col gap-4 min-w-0 md:h-full md:overflow-y-auto md:sticky md:top-0 self-start">
          <h1 className="text-base font-semibold text-white/90">
            {activeLesson?.title ?? course.title}
          </h1>

          {/* Video player */}
          <div className="relative rounded-xl overflow-hidden bg-black w-full max-w-full shrink-0">
            {videoSource ? (
              <>
                {videoSource.type === 'youtube' ? (
                  <YouTubePlayer
                    videoId={videoSource.id}
                    previewSeconds={previewSeconds}
                    onPreviewExpired={() => setPaywallVisible(true)}
                    nextLesson={hasPurchased && nextLesson ? {
                      title: nextLesson.title,
                      href: `/courses-app/learn/${course.slug}/${nextLesson.id}`,
                    } : undefined}
                    className="w-full"
                  />
                ) : (
                  <DrivePlayer
                    fileId={videoSource.id}
                    previewSeconds={previewSeconds}
                    onPreviewExpired={() => setPaywallVisible(true)}
                    nextLesson={hasPurchased && nextLesson ? {
                      title: nextLesson.title,
                      href: `/courses-app/learn/${course.slug}/${nextLesson.id}`,
                    } : undefined}
                    className="w-full"
                  />
                )}

                {/* Paywall overlay */}
                {paywallVisible && (
                  <div
                    className="absolute inset-0 z-20 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)' }}
                  >
                    <div className="text-center max-w-xs px-6">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                        style={{ backgroundColor: 'rgba(167,210,82,0.1)', border: '1px solid rgba(167,210,82,0.25)' }}
                      >
                        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#a7d252" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </div>
                      <p className="text-white font-bold text-lg mb-1">Preview ended</p>
                      <p className="text-white/50 text-sm mb-5 leading-relaxed">
                        Get lifetime access to all {lessons.length} lessons.
                      </p>
                      <div className="flex flex-col gap-2.5">
                        {isLoggedIn ? (
                          <BuyButton
                            slug={course.slug}
                            label={appliedCoupon ? `Buy now — ₦${discountedPrice.toLocaleString()}` : `Buy now — ₦${course.price_ngn.toLocaleString()}`}
                            className="w-full py-2.5 px-6 font-bold text-black text-sm transition-opacity hover:opacity-90"
                            style={{ backgroundColor: '#a7d252' }}
                            couponCode={appliedCoupon?.code}
                          />
                        ) : (
                          <>
                            <Link
                              href={registerHref}
                              className="block w-full py-2.5 font-bold text-black text-sm text-center hover:opacity-90"
                              style={{ backgroundColor: '#a7d252' }}
                            >
                              Sign up & buy — ₦{course.price_ngn.toLocaleString()}
                            </Link>
                            <Link
                              href={loginHref}
                              className="block text-sm text-white/30 hover:text-white/60 text-center transition-colors"
                            >
                              Already have an account?
                            </Link>
                          </>
                        )}
                      </div>
                      <button
                        onClick={() => setPaywallVisible(false)}
                        className="mt-3 text-xs text-white/20 hover:text-white/40 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-video flex flex-col items-center justify-center gap-3 relative" style={{ backgroundColor: '#0d0e10' }}>
                {course.thumbnail_url ? (
                  <>
                    <Image src={course.thumbnail_url} alt={course.title} fill className="object-cover" unoptimized priority />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5">
                      <p className="text-sm font-semibold text-white">Lessons coming soon</p>
                    </div>
                  </>
                ) : (
                  <>
                    <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.1)" strokeWidth="1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                    </svg>
                    <p className="text-sm text-white/25 relative">Lessons coming soon</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Free preview notice — the inline CTA only shows on mobile;
              desktop has the sticky price card on the right for that. */}
          {!hasPurchased && videoSource && !paywallVisible && (
            <p className="text-xs text-white/35">
              Free 1-minute preview.{' '}
              <span className="md:hidden">
                {isLoggedIn ? (
                  <BuyButton
                    slug={course.slug}
                    label="Buy full course →"
                    className="font-medium underline hover:opacity-70 transition-opacity"
                    style={{ color: '#a7d252' }}
                  />
                ) : (
                  <Link href={registerHref} className="font-medium underline" style={{ color: '#a7d252' }}>
                    Sign up to get full access →
                  </Link>
                )}
              </span>
            </p>
          )}

          {/* Lesson notes */}
          {activeLesson?.content && (
            <div className="pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Lesson Notes</h3>
              <div className="text-sm text-white/55 leading-relaxed prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
            </div>
          )}

          {/* About section */}
          <div className="pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">About this course</h3>
            <p className="text-sm text-white/55 leading-relaxed whitespace-pre-wrap">
              {course.long_description || course.description}
            </p>
          </div>
        </div>

        {/* Right: sticky price card (desktop only — mobile has its own buy card below the lesson list) */}
        {!hasPurchased && (
          <div className="w-[300px] shrink-0 hidden md:flex md:flex-col md:sticky md:top-0 self-start">
            <PurchasePanel
              slug={course.slug}
              priceNgn={course.price_ngn}
              thumbnailUrl={course.thumbnail_url}
              lessonsCount={lessons.length}
              allowPaymentPlan={course.allow_payment_plan}
              minPercent={paymentPlanMinPercent}
              deadlineDays={paymentPlanDeadlineDays}
              isLoggedIn={isLoggedIn}
              couponInput={couponInput}
              onCouponInputChange={(value) => { setCouponInput(value); setCouponError(''); }}
              appliedCoupon={appliedCoupon}
              couponLoading={couponLoading}
              couponError={couponError}
              autoApplied={autoApplied}
              urlCouponNotice={urlCouponNotice}
              onApplyCoupon={applyCoupon}
              onRemoveCoupon={removeCoupon}
            />
          </div>
        )}
      </div>

      {/* Mobile lesson list */}
      <div className="md:hidden px-5 pb-8">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Course Menu</h2>
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: '#18191a' }}>
          {menuEntries.map((entry) => {
            if (entry.kind === 'scheduled') {
              const lesson = entry.lesson;
              return (
                <div
                  key={`scheduled-${lesson.id}`}
                  className="w-full flex items-center justify-between px-5 py-3.5 border-b last:border-b-0"
                  style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                >
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {lesson.sort_order}. {lesson.title}
                  </span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ml-3" style={{ backgroundColor: 'rgba(99,130,255,0.15)', color: 'rgba(130,160,255,0.8)' }}>
                    Scheduled
                  </span>
                </div>
              );
            }

            const { lesson, lessonIndex: i } = entry;
            const isActive = activeLesson?.id === lesson.id;
            const isDone = completedIds.has(lesson.id);
            const isFirst = i === 0;
            const isUnlocked = hasPurchased || isFirst;
            return (
              <button
                key={lesson.id}
                onClick={() => selectLesson(lesson, isUnlocked)}
                disabled={!isUnlocked}
                className="w-full flex items-center justify-between px-5 py-3.5 border-b last:border-b-0 text-left"
                style={{
                  borderColor: 'rgba(255,255,255,0.06)',
                  backgroundColor: isActive ? 'rgba(167,210,82,0.07)' : 'transparent',
                }}
              >
                <span
                  className="text-sm"
                  style={{
                    color: isDone
                      ? 'rgba(255,255,255,0.25)'
                      : isActive
                      ? '#a7d252'
                      : isUnlocked
                      ? 'rgba(255,255,255,0.85)'
                      : 'rgba(255,255,255,0.2)',
                    fontWeight: isActive ? 500 : 400,
                  }}
                >
                  {lesson.sort_order}. {lesson.title}
                </span>
                {isDone ? (
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0 ml-3">
                    <path d="M3 7.5L6.5 11L12 4" stroke="rgba(255,255,255,0.25)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : !isUnlocked ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="shrink-0 ml-3" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                ) : null}
              </button>
            );
          })}
        </div>
</div>

        {/* Mobile buy CTA */}
        {!hasPurchased && (
          <div className="md:hidden px-5 pb-4">
            <div
              className="rounded-xl border p-4 flex flex-col gap-2.5"
              style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: '#18191a' }}
            >
              {isLoggedIn ? (
                <BuyButton
                  slug={course.slug}
                  label={appliedCoupon ? `Buy now — ₦${discountedPrice.toLocaleString()}` : `Buy this course — ₦${course.price_ngn.toLocaleString()}`}
                  className="w-full py-2.5 font-bold text-black text-sm transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#a7d252' }}
                  couponCode={appliedCoupon?.code}
                />
              ) : (
                <Link
                  href={registerHref}
                  className="block w-full py-2.5 font-bold text-black text-sm text-center transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#a7d252' }}
                >
                  {appliedCoupon ? `Sign up & enroll — ₦${discountedPrice.toLocaleString()}` : `Sign up & enroll — ₦${course.price_ngn.toLocaleString()}`}
                </Link>
              )}

              {appliedCoupon && (
                <div className={`flex items-center justify-between text-xs ${autoApplied ? 'coupon-pulse' : ''}`} style={{ color: '#a7d252' }}>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono font-bold">{appliedCoupon.code}</span>
                    <span>applied</span>
                    <span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(167,210,82,0.15)' }}>
                      -{appliedCoupon.discount_type === 'percentage' ? `${appliedCoupon.discount_value}%` : `₦${appliedCoupon.discount_value.toLocaleString()}`}
                    </span>
                  </div>
                  <button onClick={removeCoupon} className="text-white/40 hover:text-white/60 transition-colors">Remove</button>
                </div>
              )}

              {urlCouponNotice && !appliedCoupon && (
                <p className="text-xs text-amber-400">{urlCouponNotice}</p>
              )}

              {!appliedCoupon && (
                <button
                  onClick={() => { setShowCouponInput(!showCouponInput); setCouponError(''); }}
                  className="text-xs transition-colors text-left"
                  style={{ color: showCouponInput ? 'rgba(167,210,82,0.7)' : '#a7d252' }}
                >
                  {showCouponInput ? 'Close' : 'Do you have a coupon?'}
                </button>
              )}

              {showCouponInput && !appliedCoupon && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') applyCoupon(); }}
                      placeholder="Enter coupon code"
                      className="flex-1 px-3 py-1.5 text-sm bg-white/5 border rounded text-white placeholder-white/25"
                      style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                    />
                    <button
                      onClick={applyCoupon}
                      disabled={couponLoading || !couponInput.trim()}
                      className="px-3 py-1.5 text-xs font-medium rounded border transition-colors disabled:opacity-40"
                      style={{ borderColor: '#a7d252', color: '#a7d252' }}
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && <p className="text-xs text-red-400">{couponError}</p>}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
   );
}
