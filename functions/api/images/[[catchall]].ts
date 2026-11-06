/**
 * Cloudflare Pages Function Proxy for /api/images/*
 * Serves stored KV images directly from backend worker
 */
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Max-Age': '86400',
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
};

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const reqUrl = new URL(context.request.url);
    const targetUrl = `https://loneitu.ddvktp.workers.dev${reqUrl.pathname}${reqUrl.search}`;
    const res = await fetch(targetUrl);
    
    if (!res.ok) {
      return new Response('Image not found', {
        status: res.status,
        headers: CORS_HEADERS,
      });
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    return new Response(res.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        ...CORS_HEADERS,
      },
    });
  } catch (err: any) {
    return new Response('Error retrieving image', {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
};

