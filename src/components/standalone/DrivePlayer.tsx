'use client';

import PlyrPlayer from './PlyrPlayer';

type NextLesson = { title: string; href: string };

interface Props {
  fileId: string;
  onEnded?: () => void;
  nextLesson?: NextLesson;
  className?: string;
  previewSeconds?: number;
  onPreviewExpired?: () => void;
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match?.[1] ?? null;
}

export default function DrivePlayer({ fileId, onEnded, nextLesson, className, previewSeconds, onPreviewExpired }: Props) {
  // Check if fileId is a YouTube URL or ID
  const youtubeId = extractYouTubeId(fileId) ?? (fileId.length === 11 ? fileId : null);

  if (!youtubeId) {
    return (
      <div className={`relative w-full aspect-video flex items-center justify-center rounded-xl bg-black ${className ?? ''}`}>
        <p className="text-white/50 text-sm">Video source not configured.</p>
      </div>
    );
  }

  return (
    <PlyrPlayer
      youtubeId={youtubeId}
      onEnded={onEnded}
      nextLesson={nextLesson}
      className={className}
      previewSeconds={previewSeconds}
      onPreviewExpired={onPreviewExpired}
    />
  );
}