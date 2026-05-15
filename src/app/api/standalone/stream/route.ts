import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const fileId = request.nextUrl.searchParams.get('id');

  if (!fileId) {
    return new Response('Missing id parameter', { status: 400 });
  }

  const range = request.headers.get('range');

  try {
    // Step 1: Get a session cookie by visiting the download page first
    const initRes = await fetch(
      `https://drive.google.com/uc?export=download&id=${fileId}`,
      { redirect: 'follow' }
    );

    // Try to find the confirm token from any redirect HTML page
    const initBody = initRes.url.includes('accounts.google.com')
      ? null
      : await initRes.text();

    let confirmUrl = `https://drive.google.com/uc?export=download&confirm=t&id=${fileId}`;

    if (initBody) {
      const confirmMatch = initBody.match(/confirm=([A-Za-z0-9_-]+)/);
      if (confirmMatch) {
        confirmUrl = `https://drive.google.com/uc?export=download&confirm=${confirmMatch[1]}&id=${fileId}`;
      }

      // Also try to extract a direct download link
      const hrefMatch = initBody.match(/href="(\/uc\?export=download[^"]+)"/);
      if (hrefMatch) {
        confirmUrl = `https://drive.google.com${hrefMatch[1].replace(/&amp;/g, '&')}`;
      }
    }

    // Step 2: Fetch the actual file with the confirm token
    const reqHeaders: Record<string, string> = {};
    if (range) {
      reqHeaders['Range'] = range;
    }

    const downloadRes = await fetch(confirmUrl, {
      headers: reqHeaders,
      redirect: 'follow',
    });

    // Check if we got HTML instead of video (virus scan page)
    const contentType = downloadRes.headers.get('content-type') ?? '';
    if (contentType.includes('text/html')) {
      // Last resort: try the direct stream URL
      const streamUrl = `https://drive.google.com/file/d/${fileId}/preview`;
      const streamRes = await fetch(streamUrl, { redirect: 'follow' });
      const streamBody = await streamRes.text();

      // Extract video source URL from embed page
      const videoMatch = streamBody.match(/(https?:\/\/[^"'%\s]+\.googlevideo\.com\/videoplayback[^"'%\s]+)/);
      if (videoMatch) {
        const directUrl = videoMatch[1].replace(/&amp;/g, '&');
        const directHeaders: Record<string, string> = {};
        if (range) directHeaders['Range'] = range;

        const directRes = await fetch(directUrl, {
          headers: directHeaders,
          redirect: 'follow',
        });

        const resHeaders: Record<string, string> = {
          'Content-Type': 'video/mp4',
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=3600',
        };

        if (directRes.headers.get('content-range')) {
          resHeaders['Content-Range'] = directRes.headers.get('content-range')!;
        }
        if (directRes.headers.get('content-length')) {
          resHeaders['Content-Length'] = directRes.headers.get('content-length')!;
        }

        return new Response(directRes.body, {
          status: directRes.status,
          headers: resHeaders,
        });
      }

      return new Response('Video unavailable', { status: 503 });
    }

    const responseHeaders: Record<string, string> = {
      'Content-Type': contentType || 'video/mp4',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600',
    };

    if (downloadRes.headers.get('content-range')) {
      responseHeaders['Content-Range'] = downloadRes.headers.get('content-range')!;
    }
    if (downloadRes.headers.get('content-length')) {
      responseHeaders['Content-Length'] = downloadRes.headers.get('content-length')!;
    }

    return new Response(downloadRes.body, {
      status: downloadRes.status,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error('[stream] Error fetching video:', err);
    return new Response('Failed to stream video', { status: 500 });
  }
}