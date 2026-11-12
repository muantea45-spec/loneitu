/**
 * Cloudflare Pages Function: /api/stats
 * Tracks total global website visitor views starting from 100102 (inherited Blogger total).
 */

const INITIAL_SITE_VIEWS = 100102;
const KV_VIEWS_KEY = 'loneitu_site_views_v1';
const BACKEND_STATS_URL = 'https://loneitu.ddvktp.workers.dev/api/stats';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Max-Age': '86400',
};

function parseViewCount(raw: string | null | undefined, fallback = INITIAL_SITE_VIEWS): number {
  const n = Number(raw);
  if (Number.isFinite(n) && n >= INITIAL_SITE_VIEWS) {
    return Math.floor(n);
  }
  return fallback;
}

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const env = context.env as any;

    if (env?.LONEITU_KV) {
      const raw = await env.LONEITU_KV.get(KV_VIEWS_KEY, 'text');
      const views = parseViewCount(raw, INITIAL_SITE_VIEWS);
      return new Response(JSON.stringify({ success: true, views }), {
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS,
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      });
    }

    // Fallback to dedicated backend worker if KV binding isn't attached on Pages
    try {
      const res = await fetch(`${BACKEND_STATS_URL}?_t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache' },
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const json: any = await res.json();
        const views = parseViewCount(String(json?.views), INITIAL_SITE_VIEWS);
        return new Response(JSON.stringify({ success: true, views }), {
          headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS,
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          },
        });
      }
    } catch {
      // ignore fallback network error
    }

    return new Response(JSON.stringify({ success: true, views: INITIAL_SITE_VIEWS }), {
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS,
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: true, views: INITIAL_SITE_VIEWS, warning: err.message }), {
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS,
        'Cache-Control': 'no-store',
      },
    });
  }
};

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const env = context.env as any;

    if (env?.LONEITU_KV) {
      const raw = await env.LONEITU_KV.get(KV_VIEWS_KEY, 'text');
      const current = parseViewCount(raw, INITIAL_SITE_VIEWS);
      const nextViews = current + 1;

      try {
        await env.LONEITU_KV.put(KV_VIEWS_KEY, String(nextViews));
      } catch {
        // Ignore transient KV write throttling (e.g. >1 write/sec burst) without failing request
      }

      return new Response(JSON.stringify({ success: true, views: nextViews, persisted: true }), {
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS,
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      });
    }

    // Fallback to dedicated backend worker
    try {
      const res = await fetch(`${BACKEND_STATS_URL}?_t=${Date.now()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const json: any = await res.json();
        const views = parseViewCount(String(json?.views), INITIAL_SITE_VIEWS + 1);
        return new Response(JSON.stringify({ success: true, views, persisted: Boolean(json?.persisted ?? true) }), {
          headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS,
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          },
        });
      }
    } catch {
      // ignore fallback network error
    }

    return new Response(JSON.stringify({ success: true, views: INITIAL_SITE_VIEWS + 1, persisted: false }), {
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: true, views: INITIAL_SITE_VIEWS + 1, warning: err.message }), {
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS,
        'Cache-Control': 'no-store',
      },
    });
  }
};
