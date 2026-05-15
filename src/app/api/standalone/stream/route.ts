import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const fileId = request.nextUrl.searchParams.get('id');

  if (!fileId) {
    return new Response('Missing id parameter', { status: 400 });
  }

  const driveUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

  try {
    const headRes = await fetch(driveUrl, { method: 'HEAD', redirect: 'follow' });

    const contentType = headRes.headers.get('content-type') ?? 'video/mp4';
    const contentLength = headRes.headers.get('content-length');

    const range = request.headers.get('range');

    if (range) {
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      const match = /bytes=(\d+)-(\d*)/.exec(range);
      if (!match) {
        return new Response('Invalid range', { status: 416 });
      }
      const start = parseInt(match[1], 10);
      const end = match[2] ? parseInt(match[2], 10) : total - 1;

      const res = await fetch(driveUrl, {
        headers: { Range: `bytes=${start}-${end}` },
        redirect: 'follow',
      });

      return new Response(res.body, {
        status: 206,
        headers: {
          'Content-Type': contentType,
          'Content-Range': `bytes ${start}-${end}/${total}`,
          'Content-Length': (end - start + 1).toString(),
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    const res = await fetch(driveUrl, { redirect: 'follow' });

    if (!res.ok) {
      return new Response('Failed to fetch video', { status: res.status });
    }

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600',
    };

    if (contentLength) {
      headers['Content-Length'] = contentLength;
    }

    return new Response(res.body, {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error('[stream] Error fetching video:', err);
    return new Response('Failed to stream video', { status: 500 });
  }
}