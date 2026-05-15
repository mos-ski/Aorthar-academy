import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const fileId = request.nextUrl.searchParams.get('id');

  if (!fileId) {
    return new Response('Missing id parameter', { status: 400 });
  }

  const driveUrl = `https://drive.google.com/uc?export=download&confirm=t&id=${fileId}`;

  try {
    const reqHeaders: Record<string, string> = {};
    const range = request.headers.get('range');
    if (range) {
      reqHeaders['Range'] = range;
    }

    const res = await fetch(driveUrl, {
      headers: reqHeaders,
      redirect: 'follow',
    });

    if (!res.ok && res.status !== 206) {
      console.error('[stream] Drive returned status:', res.status);
      return new Response('Failed to fetch video', { status: res.status });
    }

    const responseHeaders: Record<string, string> = {
      'Content-Type': res.headers.get('content-type') ?? 'video/mp4',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=86400',
    };

    if (res.headers.get('content-range')) {
      responseHeaders['Content-Range'] = res.headers.get('content-type')!;
    }
    if (res.headers.get('content-length')) {
      responseHeaders['Content-Length'] = res.headers.get('content-length')!;
    }

    return new Response(res.body, {
      status: res.status,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error('[stream] Error fetching video:', err);
    return new Response('Failed to stream video', { status: 500 });
  }
}