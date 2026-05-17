'use client';

import PlyrPlayer from './PlyrPlayer';

type NextLesson = { title: string; href: string };

interface Props {
  videoId: string;
  onEnded?: () => void;
  nextLesson?: NextLesson;
  className?: string;
  previewSeconds?: number;
  onPreviewExpired?: () => void;
}

export default function YouTubePlayer({ videoId, onEnded, nextLesson, className, previewSeconds, onPreviewExpired }: Props) {
  return (
    <PlyrPlayer
      youtubeId={videoId}
      onEnded={onEnded}
      nextLesson={nextLesson}
      className={className}
      previewSeconds={previewSeconds}
      onPreviewExpired={onPreviewExpired}
    />
  );
}
