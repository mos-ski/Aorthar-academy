'use client';

import { useState } from 'react';
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

export default function DrivePlayer({ fileId, onEnded, nextLesson, className, previewSeconds, onPreviewExpired }: Props) {
  const [error, setError] = useState(false);

  // Construct R2 URL from fileId (e.g., "lesson-1.mp4")
  // Fallback to fileId as full URL if it already looks like a URL
  const videoSrc = fileId.startsWith('http') ? fileId : `${process.env.NEXT_PUBLIC_R2_BUCKET_URL || ''}/${fileId}`;

  if (!videoSrc) {
    return (
      <div className={`relative w-full aspect-video flex items-center justify-center rounded-xl bg-black ${className ?? ''}`}>
        <p className="text-white/50 text-sm">Video source not configured.</p>
      </div>
    );
  }

  return (
    <PlyrPlayer
      src={videoSrc}
      onEnded={onEnded}
      nextLesson={nextLesson}
      className={className}
      previewSeconds={previewSeconds}
      onPreviewExpired={onPreviewExpired}
    />
  );
}