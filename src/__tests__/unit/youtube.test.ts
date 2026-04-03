import { describe, it, expect } from 'vitest';
import { extractYouTubeId, canonicalYouTubeWatchUrl } from '@/lib/youtube';

describe('extractYouTubeId', () => {
  it('extracts ID from standard watch URL', () => {
    expect(extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extracts ID from short youtu.be URL', () => {
    expect(extractYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extracts ID from embed URL', () => {
    expect(extractYouTubeId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('returns null for a non-YouTube URL', () => {
    expect(extractYouTubeId('https://www.vimeo.com/123456')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(extractYouTubeId('')).toBeNull();
  });

  it('returns null for a malformed YouTube URL', () => {
    expect(extractYouTubeId('https://youtube.com/watch?v=short')).toBeNull();
  });

  it('handles watch URL with extra query params', () => {
    expect(extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s')).toBe('dQw4w9WgXcQ');
  });

  it('extracts a video ID containing underscores and dashes', () => {
    expect(extractYouTubeId('https://youtu.be/Ab_-1234567')).toBe('Ab_-1234567');
  });
});

describe('canonicalYouTubeWatchUrl', () => {
  it('converts a short URL to canonical watch URL', () => {
    expect(canonicalYouTubeWatchUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    );
  });

  it('keeps a standard watch URL as canonical', () => {
    expect(canonicalYouTubeWatchUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    );
  });

  it('converts an embed URL to canonical watch URL', () => {
    expect(canonicalYouTubeWatchUrl('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe(
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    );
  });

  it('returns the original input when no YouTube ID is found', () => {
    const nonYt = 'https://example.com/video';
    expect(canonicalYouTubeWatchUrl(nonYt)).toBe(nonYt);
  });
});
