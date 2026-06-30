import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import DrivePlayer from '@/components/standalone/DrivePlayer';
import PlyrPlayer from '@/components/standalone/PlyrPlayer';

describe('standalone DrivePlayer', () => {
  it('renders Google Drive file ids through the standalone stream route', () => {
    const html = renderToStaticMarkup(
      createElement(DrivePlayer, { fileId: '1ABCdefGHIjklMNOpqrstUVWxyz123456' }),
    );

    expect(html).toContain('/api/standalone/stream?id=1ABCdefGHIjklMNOpqrstUVWxyz123456');
    expect(html).not.toContain('Video source not configured');
  });
});

describe('standalone PlyrPlayer', () => {
  it('renders a native YouTube iframe fallback before Plyr initializes', () => {
    const html = renderToStaticMarkup(
      createElement(PlyrPlayer, { youtubeId: 'epfevdncf7E' }),
    );

    expect(html).toContain('https://www.youtube.com/embed/epfevdncf7E');
  });
});
