'use client';

import { useEffect, useRef, useState } from 'react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';

type NextLesson = { title: string; href: string };

interface Props {
  fileId: string;
  onEnded?: () => void;
  nextLesson?: NextLesson;
  className?: string;
  previewSeconds?: number;
  onPreviewExpired?: () => void;
}

export default function DrivePlayer({ fileId, onEnded, nextLesson, className, previewSeconds, onPreviewExpired }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Plyr | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>( null);
  const [previewExpired, setPreviewExpired] = useState(false);
  const [showEndOverlay, setShowEndOverlay] = useState(false);

  const directUrl = `/api/standalone/stream?id=${fileId}`;

  useEffect(() => {
    if (!videoRef.current) return;

    const player = new Plyr(videoRef.current, {
      controls: [
        'play-large', 'play', 'progress', 'current-time', 'duration',
        'mute', 'volume', 'settings', 'fullscreen',
      ],
      settings: ['quality', 'speed'],
      ratio: '16:9',
    });

    playerRef.current = player;

    player.on('ended', () => {
      setShowEndOverlay(true);
      onEnded?.();
    });

    if (previewSeconds) {
      pollRef.current = setInterval(() => {
        try {
          const t = player.currentTime ?? 0;
          if (t >= previewSeconds) {
            player.pause();
            setPreviewExpired(true);
            onPreviewExpired?.();
            if (pollRef.current) clearInterval(pollRef.current);
          }
        } catch { /* ignore */ }
      }, 500);
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      player.destroy();
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId]);

  return (
    <div className={`relative bg-black overflow-hidden ${className ?? ''}`}>
      <div className="relative w-full aspect-video">
        <video ref={videoRef} playsInline>
          <source src={directUrl} type="video/mp4" />
        </video>
      </div>

      {/* Preview expired — paywall overlay */}
      {previewExpired && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center"
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

      {/* Custom end overlay */}
      {showEndOverlay && !previewExpired && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-20"
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