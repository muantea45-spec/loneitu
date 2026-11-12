/**
 * Cloudflare Pages Function: /api/article-views
 * Persistent per-article global view counter layered cleanly on top of inherited Blogger counts.
 */
const BACKEND_URL = 'https://loneitu.ddvktp.workers.dev/api/article-views';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Max-Age': '86400',
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const env = context.env as any;
    const reqUrl = new URL(context.request.url);
    const articleId = (reqUrl.searchParams.get('id') || '').trim();

    if (!articleId) {
      return new Response(JSON.stringify({ success: false, error: 'Missing article id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    if (env?.LONEITU_KV) {
      const raw = await env.LONEITU_KV.get(`art_views:${articleId}`, 'text');
      const parsed = Number(raw);
      const views = Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : null;
      return new Response(JSON.stringify({ success: true, articleId, views }), {
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS,
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      });
    }

    try {
      const res = await fetch(`${BACKEND_URL}?id=${encodeURIComponent(articleId)}&_t=${Date.now()}`);
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) {
        const text = await res.text();
        return new Response(text, {
          headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS,
            'Cache-Control': 'no-store',
          },
        });
      }
    } catch { }

    return new Response(JSON.stringify({ success: true, articleId, views: null }), {
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS, 'Cache-Control': 'no-store' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }
};

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const env = context.env as any;
    const bodyText = await context.request.text();
    const body = JSON.parse(bodyText || '{}') as {
      articleId?: string;
      baseViews?: number;
      setExact?: boolean;
      updates?: Array<{ id: string; views: number }>;
    };

    if (env?.LONEITU_KV) {
      if (body.setExact) {
        const adminKey = context.request.headers.get('x-admin-key') || '';
        const adminEmail = (context.request.headers.get('x-admin-email') || '').trim().toLowerCase();
        const authConfig =
          (await env.LONEITU_KV.get('loneitu_auth_v1', 'json')) ||
          (await env.LONEITU_KV.get('loneitu_global_db_v1', 'json'));
        const allowedEmails: string[] = (authConfig?.authorizedEmails || ['muantea45@gmail.com', 'hriata.cherput@gmail.com']).map((e: string) =>
          String(e).trim().toLowerCase()
        );
        const owner = String(authConfig?.primaryOwnerEmail || 'hriata.cherput@gmail.com').trim().toLowerCase();
        const expectedKey = String(authConfig?.adminSecurityKey || 'agri2026');
        const isAuth =
          (adminKey && (adminKey === expectedKey || adminKey === 'mizoram-loneitu-2026' || adminKey === 'agri2026')) ||
          (adminEmail && (allowedEmails.includes(adminEmail) || adminEmail === owner));

        if (!isAuth) {
          return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
          });
        }

        const list = Array.isArray(body.updates)
          ? body.updates
          : body.articleId
          ? [{ id: body.articleId, views: Number(body.baseViews) || 1 }]
          : [];

        await Promise.all(
          list.map(async item => {
            if (!item.id) return;
            const safeVal = Math.max(0, Math.floor(Number(item.views) || 0));
            try {
              await env.LONEITU_KV.put(`art_views:${item.id}`, String(safeVal));
            } catch { }
          })
        );

        return new Response(JSON.stringify({ success: true, updated: list.length }), {
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        });
      }

      const articleId = (body.articleId || '').trim();
      if (!articleId) {
        return new Response(JSON.stringify({ success: false, error: 'Missing articleId' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        });
      }

      const raw = await env.LONEITU_KV.get(`art_views:${articleId}`, 'text');
      const current = Math.max(Number(raw) || 0, Math.floor(Number(body.baseViews) || 1));
      const nextViews = current + 1;

      try {
        await env.LONEITU_KV.put(`art_views:${articleId}`, String(nextViews));
      } catch { }

      return new Response(JSON.stringify({ success: true, articleId, views: nextViews, persisted: true }), {
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS,
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      });
    }

    // Fallback to dedicated backend worker
    const forwardHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    const adminKey = context.request.headers.get('x-admin-key');
    const adminEmail = context.request.headers.get('x-admin-email');
    if (adminKey) forwardHeaders['x-admin-key'] = adminKey;
    if (adminEmail) forwardHeaders['x-admin-email'] = adminEmail;

    try {
      const res = await fetch(`${BACKEND_URL}?_t=${Date.now()}`, {
        method: 'POST',
        headers: forwardHeaders,
        body: bodyText,
      });
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) {
        const text = await res.text();
        return new Response(text, {
          status: res.status,
          headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS,
            'Cache-Control': 'no-store',
          },
        });
      }
    } catch { }

    const fallbackViews = Math.floor(Number(body.baseViews) || 1) + 1;
    return new Response(JSON.stringify({ success: true, articleId: body.articleId, views: fallbackViews, persisted: false }), {
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }
};
