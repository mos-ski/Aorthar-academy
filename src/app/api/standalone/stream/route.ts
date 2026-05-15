import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const fileId = request.nextUrl.searchParams.get('id');

  if (!fileId) {
    return new Response('Missing id parameter', { status: 400 });
  }

  // confirm=1 bypasses the virus scan warning for large files
  const driveUrl = `https://drive.google.com/uc?export=download&confirm=1&id=${fileId}`;
  const range = request.headers.get('range');

  try {
    if (range) {
      const res = await fetch(driveUrl, {
        headers: { Range: range },
        redirect: 'follow',
      });

      const responseHeaders: Record<string, string> = {
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
      };

      if (res.headers.get('content-range')) {
        responseHeaders['Content-Range'] = res.headers.get('content-range')!;
      }
      if (res.headers.get('content-length')) {
        responseHeaders['Content-Length'] = res.headers.get('content-length')!;
      }

      return new Response(res.body, {
        status: res.status,
        headers: responseHeaders,
      });
    }

    const res = await fetch(driveUrl, { redirect: 'follow' });

    if (!res.ok) {
      return new Response('Failed to fetch video', { status: res.status });
    }

    const responseHeaders: Record<string, string> = {
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600',
    };

    if (res.headers.get('content-length')) {
      responseHeaders['Content-Length'] = res.headers.get('content-length')!;
    }

    return new Response(res.body, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error('[stream] Error fetching video:', err);
    return new Response('Failed to stream video', { status: 500 });
  }
}