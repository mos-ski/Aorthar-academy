'use client';

import { useEffect, useRef, useState } from 'react';
import type Plyr from 'plyr';
import 'plyr/dist/plyr.css';

declare global {
  interface Window {
    YT: { Player: unknown };
    onYouTubeIframeAPIReady: () => void;
  }
}

type NextLesson = { title: string; href: string };
type YouTubeEmbed = {
  loadModule?: (module: string) => void;
  unloadModule?: (module: string) => void;
  setOption?: (module: string, option: string, value: unknown) => void;
};
type PlyrWithEmbed = Plyr & { embed?: YouTubeEmbed };

interface Props {
  src?: string;
  youtubeId?: string;
  poster?: string;
  onEnded?: () => void;
  nextLesson?: NextLesson;
  className?: string;
  previewSeconds?: number;
  onPreviewExpired?: () => void;
}

// Ensure YouTube API is loaded
function loadYouTubeAPI(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve();
    if (window.YT?.Player) return resolve();
    
    window.onYouTubeIframeAPIReady = () => resolve();
    
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(script);
    }
  });
}

export default function PlyrPlayer({ src, youtubeId, poster, onEnded, nextLesson, className, previewSeconds, onPreviewExpired }: Props) {
  const containerRef = useRef<HTMLElement | null>(null);
  const playerRef = useRef<Plyr | null>(null);
  const captionListenerRef = useRef<((e: Event) => void) | null>(null);
  const fullscreenListenerRef = useRef<((e: Event) => void) | null>(null);
  const orientationHandlerRef = useRef<() => void>(null);
  const [previewExpired, setPreviewExpired] = useState(false);
  const [showEndOverlay, setShowEndOverlay] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullscreenOptIn, setFullscreenOptIn] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

  // Load opt-in preference from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('plyr-fullscreen-optin');
      if (stored === 'true') setFullscreenOptIn(true);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    setError(null);
    setPlayerReady(false);

    // Validate YouTube ID
    if (youtubeId && youtubeId.length !== 11) {
      setError('Invalid YouTube ID');
      return;
    }

    // Destroy previous instance
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }

    // Determine source type
    const isYouTube = !!youtubeId;
    const source = isYouTube ? youtubeId : src;

    if (!source) {
      setError('No video source provided');
      return;
    }

    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);

    // Initialize Plyr
    const initPlayer = async () => {
      try {
        if (isYouTube) {
          await loadYouTubeAPI();
        }

        const { default: Plyr } = await import('plyr');
        const player = new Plyr(container, {
          controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'],
          settings: ['captions', 'quality', 'speed', 'loop'],
          speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
          keyboard: { focused: true, global: false },
          tooltips: { controls: true, seek: true },
          captions: { active: false, language: 'auto', update: true },
          youtube: {
            noCookie: true,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            cc_load_policy: 1,
            cc_lang_pref: 'en',
          },
        });

        playerRef.current = player;
        setPlayerReady(true);

        // Plyr's toggleCaptions() never calls the YouTube IFrame API — we own
        // the toggle completely. Capture phase so we intercept before Plyr's
        // bubble-phase delegation runs and double-toggles the UI state.
        if (isYouTube) {
          let captionsEnabled = false;

          const handleCaptionClick = (e: Event) => {
            if (!(e.target as HTMLElement).closest?.('[data-plyr="captions"]')) return;
            // Stop Plyr's bubble-phase handler from also firing
            e.stopImmediatePropagation();

            captionsEnabled = !captionsEnabled;
            const ytPlayer = (playerRef.current as PlyrWithEmbed | null)?.embed;

            if (captionsEnabled) {
              ytPlayer?.loadModule?.('captions');
              ytPlayer?.setOption?.('captions', 'track', { languageCode: 'en' });
              ytPlayer?.setOption?.('captions', 'fontSize', -1); // smaller caption text
            } else {
              ytPlayer?.setOption?.('captions', 'track', {});
              ytPlayer?.unloadModule?.('captions');
            }

            // Keep Plyr button in sync
            const btn = container.querySelector('[data-plyr="captions"]') as HTMLElement | null;
            if (btn) {
              btn.setAttribute('aria-pressed', String(captionsEnabled));
              btn.classList.toggle('plyr__control--pressed', captionsEnabled);
            }
          };

          captionListenerRef.current = handleCaptionClick;
          // Use capture:true so our handler fires before Plyr's bubble handler
          container.addEventListener('click', handleCaptionClick, true);
        }

        // iOS Safari can't put an arbitrary <div> into chrome-hiding fullscreen
        // (Plyr's default falls back to a CSS-positioned overlay that leaves the
        // tab bar visible), but it CAN do real fullscreen on the YouTube <iframe>
        // itself — that's how every other site's embedded YouTube player gets a
        // proper fullscreen on iPhone. Request it directly on the iframe so we
        // get the same native, chrome-hiding result.
        const requestIframeFullscreen = (): boolean => {
          const iframe = container.querySelector('iframe') as (HTMLIFrameElement & {
            webkitRequestFullscreen?: () => void;
            webkitEnterFullscreen?: () => void;
          }) | null;
          if (!iframe) return false;
          const request = iframe.requestFullscreen?.bind(iframe)
            ?? iframe.webkitRequestFullscreen?.bind(iframe)
            ?? iframe.webkitEnterFullscreen?.bind(iframe);
          if (!request) return false;
          request();
          return true;
        };

        if (isYouTube && isIos) {
          const handleFullscreenClick = (e: Event) => {
            if (!(e.target as HTMLElement).closest?.('[data-plyr="fullscreen"]')) return;
            if (requestIframeFullscreen()) {
              // Stop Plyr's bubble-phase handler — it would otherwise also
              // engage its CSS-fallback fullscreen on top of the real one
              e.stopImmediatePropagation();
              e.preventDefault();
            }
          };

          fullscreenListenerRef.current = handleFullscreenClick;
          container.addEventListener('click', handleFullscreenClick, true);
        }

        // Lock body scroll when fullscreen
        const handleEnterFullscreen = () => {
          document.body.classList.add('plyr--fullscreen-active');
          // User manually entered fullscreen - opt them in for auto-fullscreen on rotation
          if (!fullscreenOptIn) {
            setFullscreenOptIn(true);
            if (typeof window !== 'undefined') {
              localStorage.setItem('plyr-fullscreen-optin', 'true');
            }
          }
        };
        const handleExitFullscreen = () => document.body.classList.remove('plyr--fullscreen-active');

        player.on('enterfullscreen', handleEnterFullscreen);
        player.on('exitfullscreen', handleExitFullscreen);

        // Auto-fullscreen on landscape rotation (only after user has manually entered fullscreen once)
        const handleOrientationChange = () => {
          if (fullscreenOptIn && isYouTube && window.innerHeight > 0 && window.innerWidth > window.innerHeight) {
            // Landscape mode - request fullscreen
            setTimeout(() => {
              try {
                if (!(isIos && requestIframeFullscreen())) {
                  player.fullscreen.enter();
                }
              } catch {
                // Silently fail if fullscreen not available
              }
            }, 100);
          }
        };

        orientationHandlerRef.current = handleOrientationChange;
        window.addEventListener('orientationchange', handleOrientationChange);
        window.addEventListener('resize', handleOrientationChange);

        // Preview limit logic
        if (previewSeconds) {
          const checkTime = () => {
            if (player.currentTime >= previewSeconds) {
              player.pause();
              setPreviewExpired(true);
              onPreviewExpired?.();
              player.off('timeupdate', checkTime);
            }
          };
          player.on('timeupdate', checkTime);
        }

        // End logic
        player.on('ended', () => {
          setShowEndOverlay(true);
          onEnded?.();
        });
      } catch (err) {
        console.error('Plyr init error:', err);
        setError('Failed to load video player');
      }
    };

    void initPlayer();

    return () => {
      if (captionListenerRef.current) {
        container.removeEventListener('click', captionListenerRef.current, true);
        captionListenerRef.current = null;
      }
      if (fullscreenListenerRef.current) {
        container.removeEventListener('click', fullscreenListenerRef.current, true);
        fullscreenListenerRef.current = null;
      }
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      document.body.classList.remove('plyr--fullscreen-active');
      if (orientationHandlerRef.current) {
        window.removeEventListener('orientationchange', orientationHandlerRef.current);
        window.removeEventListener('resize', orientationHandlerRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [youtubeId, src]);

  if (error) {
    return (
      <div className={`relative w-full aspect-video flex items-center justify-center rounded-xl bg-black ${className ?? ''}`}>
        <p className="text-white/50 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className={`relative w-full aspect-video bg-black rounded-xl ${className ?? ''}`}>
      {/* Video or YouTube container */}
      {youtubeId ? (
        <>
          {!playerReady && (
            <iframe
              className="absolute inset-0 h-full w-full rounded-xl"
              src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&playsinline=1`}
              title="Lesson video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}
          <div
            ref={(node) => {
              containerRef.current = node;
            }}
            data-plyr-provider="youtube"
            data-plyr-embed-id={youtubeId}
            className={`absolute inset-0 ${playerReady ? '' : 'pointer-events-none opacity-0'}`}
          />
        </>
      ) : (
        <video
          ref={(node) => {
            containerRef.current = node;
          }}
          className="w-full h-full rounded-xl"
          poster={poster}
          playsInline
          crossOrigin="anonymous"
        >
          <source src={src} type="video/mp4" />
        </video>
      )}

      {/* Preview Expired Overlay */}
      {previewExpired && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)' }}>
          <div className="text-center max-w-sm">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4" style={{ backgroundColor: 'rgba(167,210,82,0.1)', border: '1px solid rgba(167,210,82,0.25)' }}>
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="#a7d252" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <p className="text-white font-semibold text-base sm:text-lg mb-1">Preview ended</p>
            <p className="text-white/50 text-xs sm:text-sm">Purchase to continue watching</p>
          </div>
        </div>
      )}

      {/* End Overlay */}
      {showEndOverlay && !previewExpired && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 sm:gap-6 z-20 rounded-xl p-4" style={{ backgroundColor: 'rgba(6,7,8,0.96)' }}>
          <div className="text-center">
            <p className="text-white/40 text-xs sm:text-sm mb-1">Lesson complete</p>
            <p className="text-white font-semibold text-base sm:text-lg">
              {nextLesson ? 'Up next' : "You're done!"}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {nextLesson && (
              <a href={nextLesson.href} className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 font-bold text-black text-xs sm:text-sm hover:opacity-90 transition-opacity" style={{ backgroundColor: '#a7d252' }}>
                {nextLesson.title} →
              </a>
            )}
            <button onClick={() => { setShowEndOverlay(false); playerRef.current?.restart(); }} className="text-xs sm:text-sm text-white/50 hover:text-white transition-colors underline">
              Replay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
