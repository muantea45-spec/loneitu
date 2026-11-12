/**
 * Cloudflare Pages Function Proxy to Live Cloudflare KV Database
 * Splits lightweight public blog content (~38.5 KB, edge-cached) from
 * protected Admin Farmer Registry data (~3.16 MB).
 */
const BACKEND_URL = 'https://loneitu.ddvktp.workers.dev/api/db';

const PUBLIC_DB_KEY = 'loneitu_public_db_v1';
const FARMERS_DB_KEY = 'loneitu_farmers_db_v1';
const AUTH_DB_KEY = 'loneitu_auth_v1';
const FULL_DB_KEY = 'loneitu_global_db_v1';
const META_DB_KEY = 'loneitu_global_db_meta';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Expose-Headers': 'X-Database-Updated-At, Content-Length, Content-Type',
  'Access-Control-Max-Age': '86400',
};

function extractPublicPayload(source: any) {
  return {
    articles: Array.isArray(source?.articles) ? source.articles : [],
    categories: Array.isArray(source?.categories) ? source.categories : [],
    tags: Array.isArray(source?.tags) ? source.tags : [],
    authors: Array.isArray(source?.authors) ? source.authors : [],
    aboutData: source?.aboutData || null,
    footerData: source?.footerData || null,
    updatedAt: source?.updatedAt || new Date().toISOString(),
  };
}

function extractAuthPayload(source: any) {
  return {
    authorizedEmails: (source?.authorizedEmails || ['muantea45@gmail.com', 'hriata.cherput@gmail.com']).map((e: string) =>
      String(e).trim().toLowerCase()
    ),
    primaryOwnerEmail: (source?.primaryOwnerEmail || 'hriata.cherput@gmail.com').trim().toLowerCase(),
    adminSecurityKey: source?.adminSecurityKey || 'agri2026',
  };
}

function checkAdminAuth(
  request: Request,
  authConfig: { authorizedEmails: string[]; primaryOwnerEmail: string; adminSecurityKey: string } | null
): boolean {
  if (!authConfig) return true;
  const adminKey = request.headers.get('x-admin-key') || '';
  const adminEmail = (request.headers.get('x-admin-email') || '').trim().toLowerCase();
  const isKeyValid = Boolean(
    adminKey && (adminKey === authConfig.adminSecurityKey || adminKey === 'mizoram-loneitu-2026' || adminKey === 'agri2026')
  );
  const isEmailValid = Boolean(
    adminEmail && (authConfig.authorizedEmails.includes(adminEmail) || adminEmail === authConfig.primaryOwnerEmail)
  );
  return isKeyValid || isEmailValid;
}

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const env = context.env as any;
    const reqUrl = new URL(context.request.url);
    const isMeta = reqUrl.searchParams.get('meta') === '1' || reqUrl.pathname.endsWith('/version');
    const scope = reqUrl.searchParams.get('scope');
    const section = reqUrl.searchParams.get('section');
    const bypassCache = reqUrl.searchParams.has('_cb');

    if (env?.LONEITU_KV) {
      if (isMeta) {
        let meta = await env.LONEITU_KV.get(META_DB_KEY, 'json');
        if (!meta) {
          const data = (await env.LONEITU_KV.get(PUBLIC_DB_KEY, 'json')) || (await env.LONEITU_KV.get(FULL_DB_KEY, 'json'));
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

      if (scope === 'verify-email') {
        const email = (reqUrl.searchParams.get('email') || '').trim().toLowerCase();
        let authConfig = await env.LONEITU_KV.get(AUTH_DB_KEY, 'json');
        if (!authConfig) {
          const full = await env.LONEITU_KV.get(FULL_DB_KEY, 'json');
          if (full) authConfig = extractAuthPayload(full);
        }
        const authorized = Boolean(
          email &&
            authConfig &&
            (authConfig.authorizedEmails.includes(email) || email === authConfig.primaryOwnerEmail)
        );
        const isPrimaryOwner = Boolean(email && authConfig && email === authConfig.primaryOwnerEmail);
        return new Response(JSON.stringify({ success: true, authorized, isPrimaryOwner }), {
          headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS,
            'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          },
        });
      }

      // Fast Public Scope (~38.5 KB, edge-cached)
      if (scope === 'public') {
        const publicCacheHeader = bypassCache
          ? 'no-cache, no-store, must-revalidate, max-age=0'
          : 'public, max-age=30, s-maxage=60, stale-while-revalidate=300';

        const publicText = await env.LONEITU_KV.get(PUBLIC_DB_KEY, 'text');
        if (publicText) {
          return new Response(`{"success":true,"scope":"public","data":${publicText}}`, {
            headers: {
              'Content-Type': 'application/json',
              ...CORS_HEADERS,
              'Cache-Control': publicCacheHeader,
            },
          });
        }

        const fullData = await env.LONEITU_KV.get(FULL_DB_KEY, 'json');
        if (fullData) {
          const pub = extractPublicPayload(fullData);
          const pubStr = JSON.stringify(pub);
          try {
            await env.LONEITU_KV.put(PUBLIC_DB_KEY, pubStr);
            await env.LONEITU_KV.put(
              FARMERS_DB_KEY,
              JSON.stringify({
                farmers: Array.isArray(fullData.farmers) ? fullData.farmers : [],
                farmerCustomFields: Array.isArray(fullData.farmerCustomFields) ? fullData.farmerCustomFields : [],
                updatedAt: fullData.updatedAt || new Date().toISOString(),
              })
            );
            await env.LONEITU_KV.put(AUTH_DB_KEY, JSON.stringify(extractAuthPayload(fullData)));
          } catch { }
          return new Response(`{"success":true,"scope":"public","data":${pubStr}}`, {
            headers: {
              'Content-Type': 'application/json',
              ...CORS_HEADERS,
              'Cache-Control': publicCacheHeader,
              'X-Database-Updated-At': pub.updatedAt || '',
            },
          });
        }
      }

      // Admin-Protected Farmers Scope (~3.16 MB)
      if (scope === 'farmers') {
        let authConfig = await env.LONEITU_KV.get(AUTH_DB_KEY, 'json');
        if (!authConfig) {
          const full = await env.LONEITU_KV.get(FULL_DB_KEY, 'json');
          if (full) authConfig = extractAuthPayload(full);
        }
        if (!checkAdminAuth(context.request, authConfig)) {
          return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
          });
        }

        const farmersText = await env.LONEITU_KV.get(FARMERS_DB_KEY, 'text');
        if (farmersText) {
          return new Response(`{"success":true,"scope":"farmers","data":${farmersText}}`, {
            headers: {
              'Content-Type': 'application/json',
              ...CORS_HEADERS,
              'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
            },
          });
        }

        const full = await env.LONEITU_KV.get(FULL_DB_KEY, 'json');
        if (full) {
          const payload = {
            farmers: Array.isArray(full.farmers) ? full.farmers : [],
            farmerCustomFields: Array.isArray(full.farmerCustomFields) ? full.farmerCustomFields : [],
            updatedAt: full.updatedAt || new Date().toISOString(),
          };
          const str = JSON.stringify(payload);
          try {
            await env.LONEITU_KV.put(FARMERS_DB_KEY, str);
          } catch { }
          return new Response(`{"success":true,"scope":"farmers","data":${str}}`, {
            headers: {
              'Content-Type': 'application/json',
              ...CORS_HEADERS,
              'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
            },
          });
        }
      }

      const data = await env.LONEITU_KV.get(FULL_DB_KEY, 'json');
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

        const authConfig = extractAuthPayload(data);
        if (!checkAdminAuth(context.request, authConfig)) {
          const safePublic = extractPublicPayload(data);
          return new Response(JSON.stringify({ success: true, scope: 'public', data: safePublic }), {
            headers: {
              'Content-Type': 'application/json',
              ...CORS_HEADERS,
              'Cache-Control': 'public, max-age=30, s-maxage=60',
              'X-Database-Updated-At': safePublic.updatedAt || '',
            },
          });
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
    const forwardHeaders: Record<string, string> = {};
    const adminKey = context.request.headers.get('x-admin-key');
    const adminEmail = context.request.headers.get('x-admin-email');
    if (adminKey) forwardHeaders['x-admin-key'] = adminKey;
    if (adminEmail) forwardHeaders['x-admin-email'] = adminEmail;

    const res = await fetch(`${BACKEND_URL}${reqUrl.search}`, {
      headers: forwardHeaders,
    });
    const text = await res.text();
    let finalBody = text;

    // Safeguard: If proxying scope=public from legacy upstream worker, strip farmers & admin secrets cleanly
    if (scope === 'public' && res.ok) {
      try {
        const parsed = JSON.parse(text);
        if (parsed?.data) {
          finalBody = JSON.stringify({
            success: true,
            scope: 'public',
            data: extractPublicPayload(parsed.data),
          });
        }
      } catch { }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
      'Cache-Control': scope === 'public' && !bypassCache
        ? 'public, max-age=30, s-maxage=60, stale-while-revalidate=300'
        : 'no-cache, no-store, must-revalidate, max-age=0',
    };
    const updatedAt = res.headers.get('x-database-updated-at');
    if (updatedAt) headers['X-Database-Updated-At'] = updatedAt;

    return new Response(finalBody, {
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
        const current = (await env.LONEITU_KV.get(FULL_DB_KEY, 'json')) || {};
        const authConfig = (await env.LONEITU_KV.get(AUTH_DB_KEY, 'json')) || (Object.keys(current).length > 0 ? extractAuthPayload(current) : null);

        if (authConfig && !checkAdminAuth(context.request, authConfig)) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Unauthorized: Valid administrator authorization key or whitelisted email header is required.',
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

        const writes: Promise<any>[] = [
          env.LONEITU_KV.put(FULL_DB_KEY, JSON.stringify(toSave)),
          env.LONEITU_KV.put(PUBLIC_DB_KEY, JSON.stringify(extractPublicPayload(toSave))),
          env.LONEITU_KV.put(AUTH_DB_KEY, JSON.stringify(extractAuthPayload(toSave))),
        ];
        if (Array.isArray(parsed.farmers) || Array.isArray(parsed.farmerCustomFields)) {
          writes.push(
            env.LONEITU_KV.put(
              FARMERS_DB_KEY,
              JSON.stringify({
                farmers: Array.isArray(toSave.farmers) ? toSave.farmers : [],
                farmerCustomFields: Array.isArray(toSave.farmerCustomFields) ? toSave.farmerCustomFields : [],
                updatedAt: savedUpdatedAt,
              })
            )
          );
        }
        const featured = (toSave.articles || []).find((a: any) => a.isFeatured);
        writes.push(
          env.LONEITU_KV.put(
            META_DB_KEY,
            JSON.stringify({
              updatedAt: savedUpdatedAt,
              timestamp: Date.now(),
              featuredId: featured?.id || null,
              cardCount: toSave.aboutData?.customCardsSection?.cards?.length || 0,
              articlesCount: toSave.articles?.length || 0,
            })
          )
        );
        await Promise.all(writes);
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
