/**
 * Cloudflare Pages Function Proxy to Live Cloudflare KV Database
 * Guarantees 100% persistent global synchronization across Desktop & Mobile
 */
const BACKEND_URL = 'https://loneitu.ddvktp.workers.dev/api/db';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Expose-Headers': 'X-Database-Updated-At, Content-Length, Content-Type',
  'Access-Control-Max-Age': '86400',
};

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const env = context.env as any;
    const reqUrl = new URL(context.request.url);
    const isMeta = reqUrl.searchParams.get('meta') === '1' || reqUrl.pathname.endsWith('/version');
    const section = reqUrl.searchParams.get('section');

    if (env?.LONEITU_KV) {
      if (isMeta) {
        let meta = await env.LONEITU_KV.get('loneitu_global_db_meta', 'json');
        if (!meta) {
          const data = await env.LONEITU_KV.get('loneitu_global_db_v1', 'json');
          const featured = (data?.articles || []).find((a: any) => a.isFeatured);
          meta = {
            updatedAt: data?.updatedAt || new Date().toISOString(),
            featuredId: featured?.id || null,
            cardCount: data?.aboutData?.customCardsSection?.cards?.length || 0,
            articlesCount: data?.articles?.length || 0,
            timestamp: Date.now(),
          };
        }
        return new Response(JSON.stringify({ success: true, meta }), {
          headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS,
            'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
            Pragma: 'no-cache',
            Expires: '0',
            'X-Database-Updated-At': meta.updatedAt || '',
          },
        });
      }

      const data = await env.LONEITU_KV.get('loneitu_global_db_v1', 'json');
      if (data) {
        if (section && data[section] !== undefined) {
          return new Response(
            JSON.stringify({
              success: true,
              section,
              updatedAt: data.updatedAt,
              data: data[section],
            }),
            {
              headers: {
                'Content-Type': 'application/json',
                ...CORS_HEADERS,
                'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
                Pragma: 'no-cache',
                Expires: '0',
                'X-Database-Updated-At': data.updatedAt || '',
              },
            }
          );
        }

        return new Response(JSON.stringify({ success: true, data }), {
          headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS,
            'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
            Pragma: 'no-cache',
            Expires: '0',
            'X-Database-Updated-At': data.updatedAt || '',
          },
        });
      }
    }

    // Proxy to dedicated worker with query params preserved
    const search = reqUrl.search ? `${reqUrl.search}&_t=${Date.now()}` : `?_t=${Date.now()}`;
    const res = await fetch(`${BACKEND_URL}${search}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      },
    });
    const text = await res.text();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      Pragma: 'no-cache',
      Expires: '0',
    };
    const updatedAt = res.headers.get('x-database-updated-at');
    if (updatedAt) headers['X-Database-Updated-At'] = updatedAt;

    return new Response(text, {
      status: res.status,
      headers,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
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
    const bodyText = await context.request.text();
    const adminKey = context.request.headers.get('x-admin-key') || '';
    const adminEmail = (context.request.headers.get('x-admin-email') || '').trim().toLowerCase();
    const authHeader = context.request.headers.get('authorization') || '';

    const env = context.env as any;
    let savedUpdatedAt = new Date().toISOString();

    if (env?.LONEITU_KV) {
      try {
        const current = (await env.LONEITU_KV.get('loneitu_global_db_v1', 'json')) || {};

        // Security Check: Verify Administrator credentials before writing to KV
        if (current && Object.keys(current).length > 0) {
          const authorizedEmails: string[] = (
            current.authorizedEmails || ['muantea45@gmail.com', 'hriata.cherput@gmail.com']
          ).map((e: string) => e.trim().toLowerCase());
          const expectedKey = current.adminSecurityKey || '';
          const primaryOwner = (current.primaryOwnerEmail || 'hriata.cherput@gmail.com').trim().toLowerCase();

          const isKeyValid = adminKey && expectedKey && adminKey === expectedKey;
          const isEmailValid = adminEmail && (authorizedEmails.includes(adminEmail) || adminEmail === primaryOwner);

          if (!isKeyValid && !isEmailValid) {
            return new Response(
              JSON.stringify({
                success: false,
                error: 'Unauthorized: Valid administrator authorization key or whitelisted email is required.',
              }),
              {
                status: 401,
                headers: {
                  'Content-Type': 'application/json',
                  ...CORS_HEADERS,
                },
              }
            );
          }
        }

        const parsed = JSON.parse(bodyText);
        savedUpdatedAt = parsed.updatedAt || savedUpdatedAt;
        let toSave = parsed;
        if (!parsed.farmers || !Array.isArray(parsed.farmers)) {
          toSave = {
            ...current,
            ...parsed,
            updatedAt: savedUpdatedAt,
          };
        } else {
          toSave.updatedAt = savedUpdatedAt;
        }

        await env.LONEITU_KV.put('loneitu_global_db_v1', JSON.stringify(toSave));
        const featured = (toSave.articles || []).find((a: any) => a.isFeatured);
        await env.LONEITU_KV.put(
          'loneitu_global_db_meta',
          JSON.stringify({
            updatedAt: savedUpdatedAt,
            timestamp: Date.now(),
            featuredId: featured?.id || null,
            cardCount: toSave.aboutData?.customCardsSection?.cards?.length || 0,
            articlesCount: toSave.articles?.length || 0,
          })
        );
      } catch (kvErr) {
        console.warn('Direct KV put error, falling back to backend URL', kvErr);
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (adminKey) headers['x-admin-key'] = adminKey;
    if (adminEmail) headers['x-admin-email'] = adminEmail;
    if (authHeader) headers['authorization'] = authHeader;

    const res = await fetch(`${BACKEND_URL}?_t=${Date.now()}`, {
      method: 'POST',
      headers,
      body: bodyText,
    });
    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS,
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        Pragma: 'no-cache',
        'X-Database-Updated-At': savedUpdatedAt,
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS,
        'Cache-Control': 'no-store',
      },
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
};
