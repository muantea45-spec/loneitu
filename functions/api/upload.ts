/**
 * Cloudflare Pages Function Proxy for /api/upload
 * Forwards image uploads directly to backend KV worker
 */
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Max-Age': '86400',
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
};

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const body = await context.request.text();
    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const adminKey = context.request.headers.get('x-admin-key');
    const adminEmail = context.request.headers.get('x-admin-email');
    const authHeader = context.request.headers.get('authorization');
    if (adminKey) reqHeaders['x-admin-key'] = adminKey;
    if (adminEmail) reqHeaders['x-admin-email'] = adminEmail;
    if (authHeader) reqHeaders['authorization'] = authHeader;

    const res = await fetch('https://loneitu.ddvktp.workers.dev/api/upload', {
      method: 'POST',
      headers: reqHeaders,
      body,
    });
    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS,
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS,
      },
    });
  }
};

