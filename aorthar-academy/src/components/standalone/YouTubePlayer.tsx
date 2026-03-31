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
    destroy(): void;
  }
}

type NextLesson = { title: string; href: string };

interface Props {
  videoId: string;
  onEnded?: () => void;
  nextLesson?: NextLesson;
  className?: string;
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

export default function YouTubePlayer({ videoId, onEnded, nextLesson, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [apiReady, setApiReady] = useState(false);

  const handleEnded = useCallback(() => {
    setShowOverlay(true);
    onEnded?.();
  }, [onEnded]);

  // Load YT API once
  useEffect(() => {
    loadYouTubeAPI(() => setApiReady(true));
  }, []);

  // Create player when API ready or videoId changes
  useEffect(() => {
    if (!apiReady || !containerRef.current) return;
    setShowOverlay(false);

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
        rel: 0,              // no related videos from other channels
        modestbranding: 1,   // reduced YouTube logo
        iv_load_policy: 3,   // no annotations
        showinfo: 0,         // no video title overlay
        origin: window.location.origin,
        enablejsapi: 1,
        // youtube-nocookie is set via the host parameter below
      },
      events: {
        onStateChange(event) {
          // YT.PlayerState.ENDED = 0
          if (event.data === 0) {
            event.target.stopVideo(); // dismiss recommendation grid
            handleEnded();
          }
        },
      },
    });

    return () => {
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

      {/* Custom end overlay — covers recommendation grid */}
      {showOverlay && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-10"
          style={{ backgroundColor: 'rgba(6,7,8,0.96)' }}
        >
          <div className="text-center">
            <p className="text-white/40 text-sm mb-1">Lesson complete</p>
            <p className="text-white font-semibold text-lg">
              {nextLesson ? 'Up next' : 'You\'re done!'}
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
