'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

type NextLesson = { title: string; href: string };

interface Props {
  fileId: string;
  onEnded?: () => void;
  nextLesson?: NextLesson;
  className?: string;
  /** Show paywall overlay after this many seconds */
  previewSeconds?: number;
  onPreviewExpired?: () => void;
}

export default function DrivePlayer({ fileId, onEnded, nextLesson, className, previewSeconds, onPreviewExpired }: Props) {
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);
  const [previewExpired, setPreviewExpired] = useState(false);
  const [showEndOverlay, setShowEndOverlay] = useState(false);

  // Start counting seconds once mounted
  useEffect(() => {
    elapsedRef.current = 0;
    setPreviewExpired(false);
    setShowEndOverlay(false);

    if (!previewSeconds) return;

    pollRef.current = setInterval(() => {
      elapsedRef.current += 1;
      if (elapsedRef.current >= previewSeconds) {
        clearInterval(pollRef.current!);
        setPreviewExpired(true);
        onPreviewExpired?.();
      }
    }, 1000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId]);

  const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;

  return (
    <div className={`relative w-full aspect-video bg-black overflow-hidden ${className ?? ''}`}>
      {/* Shift iframe up by 40px to push the Drive branding out of view, compensate height */}
      <iframe
        src={embedUrl}
        allow="autoplay"
        allowFullScreen
        title="Course lesson"
        style={{
          border: 'none',
          position: 'absolute',
          top: '-40px',
          left: 0,
          width: '100%',
          height: 'calc(100% + 40px)',
        }}
      />

      {/* Preview expired — fullscreen paywall overlay */}
      {previewExpired && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)' }}
        >
          <div className="text-center px-6">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'rgba(167,210,82,0.1)', border: '1px solid rgba(167,210,82,0.25)' }}
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#a7d252" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <p className="text-white font-semibold text-lg mb-1">Preview ended</p>
            <p className="text-white/50 text-sm">Purchase to continue watching</p>
          </div>
        </div>
      )}

      {/* Custom end overlay (shown after video finishes naturally) */}
      {showEndOverlay && !previewExpired && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-10"
          style={{ backgroundColor: 'rgba(6,7,8,0.96)' }}
        >
          <div className="text-center">
            <p className="text-white/40 text-sm mb-1">Lesson complete</p>
            <p className="text-white font-semibold text-lg">
              {nextLesson ? 'Up next' : "You're done!"}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {nextLesson && (
              <a
                href={nextLesson.href}
                className="flex items-center gap-2 px-6 py-3 font-bold text-black text-sm hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#a7d252' }}
              >
                {nextLesson.title} →
              </a>
            )}
            <button
              onClick={() => setShowEndOverlay(false)}
              className="text-sm text-white/50 hover:text-white transition-colors underline"
            >
              Replay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
