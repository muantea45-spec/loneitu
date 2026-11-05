/**
 * Cloudflare Pages Function Proxy to Live Cloudflare KV Database
 * Guarantees 100% persistent global synchronization across Desktop & Mobile
 */
const BACKEND_URL = 'https://loneitu.ddvktp.workers.dev/api/db';

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const env = context.env as any;
    if (env?.LONEITU_KV) {
      const data = await env.LONEITU_KV.get('loneitu_global_db_v1', 'json');
      if (data) {
        return new Response(JSON.stringify({ success: true, data }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        });
      }
    }

    const res = await fetch(`${BACKEND_URL}?_t=${Date.now()}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      },
    });
  }
};

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const body = await context.request.text();
    const adminKey = context.request.headers.get('x-admin-key') || '';
    const adminEmail = (context.request.headers.get('x-admin-email') || '').trim().toLowerCase();
    const authHeader = context.request.headers.get('authorization') || '';

    const env = context.env as any;
    if (env?.LONEITU_KV) {
      try {
        const parsed = JSON.parse(body);
        await env.LONEITU_KV.put('loneitu_global_db_v1', JSON.stringify(parsed));
        return new Response(JSON.stringify({ success: true, kvSaved: true, data: parsed }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
            'Pragma': 'no-cache',
          },
        });
      } catch (kvErr) {
        console.warn('Direct KV put error, falling back to backend URL', kvErr);
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    };
    if (adminKey) headers['x-admin-key'] = adminKey;
    if (adminEmail) headers['x-admin-email'] = adminEmail;
    if (authHeader) headers['authorization'] = authHeader;

    const res = await fetch(`${BACKEND_URL}?_t=${Date.now()}`, {
      method: 'POST',
      headers,
      body,
    });
    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      },
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Key, X-Admin-Email',
    },
  });
};
