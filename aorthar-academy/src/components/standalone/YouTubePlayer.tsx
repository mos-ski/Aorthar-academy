'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

declare global {
  interface Window {
    YT: {
      Player: new (
        el: HTMLElement | string,
        opts: {
          videoId: string;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: (e: { target: YTPlayer }) => void;
            onStateChange?: (e: { data: number; target: YTPlayer }) => void;
          };
        },
      ) => YTPlayer;
      PlayerState: { ENDED: number; PLAYING: number; PAUSED: number };
    };
    onYouTubeIframeAPIReady: () => void;
  }
  interface YTPlayer {
    stopVideo(): void;
    playVideo(): void;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    getCurrentTime(): number;
    destroy(): void;
  }
}

type NextLesson = { title: string; href: string };

interface Props {
  videoId: string;
  onEnded?: () => void;
  nextLesson?: NextLesson;
  className?: string;
  /** If set, player pauses and shows paywall overlay after this many seconds */
  previewSeconds?: number;
  onPreviewExpired?: () => void;
}

let ytApiLoaded = false;
let ytApiCallbacks: Array<() => void> = [];

function loadYouTubeAPI(cb: () => void) {
  if (typeof window === 'undefined') return;
  if (window.YT?.Player) { cb(); return; }
  ytApiCallbacks.push(cb);
  if (ytApiLoaded) return;
  ytApiLoaded = true;
  window.onYouTubeIframeAPIReady = () => {
    ytApiCallbacks.forEach((fn) => fn());
    ytApiCallbacks = [];
  };
  const script = document.createElement('script');
  script.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(script);
}

export default function YouTubePlayer({ videoId, onEnded, nextLesson, className, previewSeconds, onPreviewExpired }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  const [previewExpired, setPreviewExpired] = useState(false);

  const handleEnded = useCallback(() => {
    setShowOverlay(true);
    onEnded?.();
  }, [onEnded]);

  const triggerPreviewExpired = useCallback(() => {
    if (playerRef.current) {
      try { playerRef.current.stopVideo(); } catch { /* ignore */ }
    }
    if (pollRef.current) clearInterval(pollRef.current);
    setPreviewExpired(true);
    onPreviewExpired?.();
  }, [onPreviewExpired]);

  // Load YT API once
  useEffect(() => {
    loadYouTubeAPI(() => setApiReady(true));
  }, []);

  // Create player when API ready or videoId changes
  useEffect(() => {
    if (!apiReady || !containerRef.current) return;
    setShowOverlay(false);
    setPreviewExpired(false);
    if (pollRef.current) clearInterval(pollRef.current);

    // Destroy previous player
    if (playerRef.current) {
      try { playerRef.current.destroy(); } catch { /* ignore */ }
      playerRef.current = null;
    }

    // Create a fresh div for the player (YT replaces the element)
    const div = document.createElement('div');
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(div);

    playerRef.current = new window.YT.Player(div, {
      videoId,
      playerVars: {
        rel: 0,
        modestbranding: 1,
        iv_load_policy: 3,
        showinfo: 0,
        origin: window.location.origin,
        enablejsapi: 1,
      },
      events: {
        onReady() {
          // Start polling for preview limit once playing
          if (previewSeconds) {
            pollRef.current = setInterval(() => {
              try {
                const t = playerRef.current?.getCurrentTime() ?? 0;
                if (t >= previewSeconds) {
                  triggerPreviewExpired();
                }
              } catch { /* ignore */ }
            }, 500);
          }
        },
        onStateChange(event) {
          if (event.data === 0) {
            event.target.stopVideo();
            handleEnded();
          }
        },
      },
    });

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch { /* ignore */ }
        playerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiReady, videoId]);

  return (
    <div className={`relative w-full aspect-video bg-black ${className ?? ''}`}>
      {/* YT iframe mounts here */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full [&>div]:w-full [&>div]:h-full [&_iframe]:w-full [&_iframe]:h-full" />

      {/* Preview expired paywall — rendered by parent via onPreviewExpired, this just dims */}
      {previewExpired && (
        <div className="absolute inset-0 z-10 bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(167,210,82,0.15)', border: '1px solid rgba(167,210,82,0.3)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a7d252" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <p className="text-white font-semibold text-lg mb-1">Preview ended</p>
            <p className="text-white/50 text-sm">Purchase to continue watching</p>
          </div>
        </div>
      )}

      {/* Custom end overlay — covers recommendation grid */}
      {showOverlay && !previewExpired && (
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
                className="flex items-center gap-2 px-6 py-3 font-bold text-white text-sm hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#08694a' }}
              >
                {nextLesson.title} →
              </a>
            )}
            <button
              onClick={() => {
                setShowOverlay(false);
                playerRef.current?.seekTo(0, true);
                playerRef.current?.playVideo();
              }}
              className="text-sm text-white/50 hover:text-white transition-colors underline"
            >
              Replay
            </button>
          </div>
        </div>
      )}

      {/* No API yet — placeholder */}
      {!apiReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
