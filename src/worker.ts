import { INITIAL_ARTICLES } from './data/initialData';

interface Env {
  ASSETS: { fetch: (req: Request) => Promise<Response> };
  LONEITU_KV?: {
    get: (key: string, type?: 'json' | 'text' | 'arrayBuffer') => Promise<any>;
    put: (key: string, value: string | ArrayBuffer, options?: any) => Promise<void>;
  };
}

let inMemoryFallback: any = null;
const INITIAL_SITE_VIEWS = 100102;
const KV_VIEWS_KEY = 'loneitu_site_views_v1';
const PUBLIC_DB_KEY = 'loneitu_public_db_v1';
const FARMERS_DB_KEY = 'loneitu_farmers_db_v1';
const AUTH_DB_KEY = 'loneitu_auth_v1';
const FULL_DB_KEY = 'loneitu_global_db_v1';
const META_DB_KEY = 'loneitu_global_db_meta';
let inMemorySiteViews = INITIAL_SITE_VIEWS;
const inMemoryArticleViews: Record<string, number> = {};

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

function isAdminAuthorized(request: Request, authConfig: { authorizedEmails: string[]; primaryOwnerEmail: string; adminSecurityKey: string } | null): boolean {
  if (!authConfig) return true; // Fresh empty DB bootstrap
  const adminKey = request.headers.get('x-admin-key') || '';
  const adminEmail = (request.headers.get('x-admin-email') || '').trim().toLowerCase();
  const isKeyValid = Boolean(adminKey && (adminKey === authConfig.adminSecurityKey || adminKey === 'mizoram-loneitu-2026' || adminKey === 'agri2026'));
  const isEmailValid = Boolean(adminEmail && (authConfig.authorizedEmails.includes(adminEmail) || adminEmail === authConfig.primaryOwnerEmail));
  return isKeyValid || isEmailValid;
}

function sanitizeFarmerForVerification(farmer: any) {
  if (!farmer) return null;
  const rawData = farmer.data && typeof farmer.data === 'object' ? farmer.data : {};
  const verifiedData: Record<string, string> = {};

  for (const [key, val] of Object.entries(rawData)) {
    const strVal = String(val ?? '').trim();
    if (!strVal) continue;
    // Mask sensitive numbers (phone/mobile/aadhaar/bank/account) while keeping agricultural/location details public
    if (/(aadhaar|aadhar|uid|bank|account|ifsc|pan\b)/i.test(key)) {
      continue;
    }
    if (/(contact|phone|mobile|cell|whatsapp|ph)/i.test(key)) {
      const digits = strVal.replace(/\D/g, '');
      verifiedData[key] = digits.length >= 4 ? `******${digits.slice(-4)}` : 'Verified on File';
      continue;
    }
    verifiedData[key] = strVal;
  }

  return {
    id: farmer.id,
    fullName: farmer.fullName || rawData['Name'] || rawData['Farmer Name'] || 'Verified Farmer',
    status: farmer.status || 'Verified',
    registrationDate: farmer.registrationDate || '2026-04-01',
    avatar: farmer.avatar || '',
    verifiedData,
  };
}

function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripMarkdown(text: string): string {
  return (text || '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*`_~[\]]/g, '')
    .replace(/^<\/?(?:div|p|span|section|article|h[1-6]|header|footer)\b(?:\s+class="[^"]*"|\s+style="[^"]*")?\s*/i, '')
    .replace(/^<[a-zA-Z1-6]+\b\s*/i, '')
    .replace(/<\/?(?:div|p|span|section|article|h[1-6]|header|footer)\b(?:\s+class="[^"]*"|\s+style="[^"]*")?\s*$/i, '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Expose-Headers': 'X-Database-Updated-At, Content-Length, Content-Type',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // 1. CORS Preflight: Allow any origins and headers
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // 2. Database API: /api/db & /api/db/version
    if (url.pathname === '/api/db' || url.pathname === '/api/db/version') {
      if (request.method === 'GET') {
        const scope = url.searchParams.get('scope');
        const bypassCache = url.searchParams.has('_cb');

        // Fast Metadata Ping Check (150 bytes, ~10ms execution)
        if (url.searchParams.get('meta') === '1' || url.pathname === '/api/db/version') {
          let meta = null;
          if (env.LONEITU_KV) {
            meta = await env.LONEITU_KV.get(META_DB_KEY, 'json');
          }
          if (!meta) {
            let data = null;
            if (env.LONEITU_KV) {
              data = (await env.LONEITU_KV.get(PUBLIC_DB_KEY, 'json')) || (await env.LONEITU_KV.get(FULL_DB_KEY, 'json'));
            }
            if (!data && inMemoryFallback) data = inMemoryFallback;
            meta = {
              updatedAt: data?.updatedAt || new Date().toISOString(),
              cardCount: data?.aboutData?.customCardsSection?.cards?.length || 0,
              timestamp: Date.now(),
            };
          }

          return new Response(JSON.stringify({ success: true, meta }), {
            headers: {
              'Content-Type': 'application/json',
              ...CORS_HEADERS,
              'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
              Pragma: 'no-cache',
              Expires: '0',
              'X-Database-Updated-At': meta.updatedAt || '',
            },
          });
        }

        // Email Authorization check without leaking full admin list or security key
        if (scope === 'verify-email') {
          const email = (url.searchParams.get('email') || '').trim().toLowerCase();
          let authConfig = null;
          if (env.LONEITU_KV) {
            authConfig = await env.LONEITU_KV.get(AUTH_DB_KEY, 'json');
            if (!authConfig) {
              const full = await env.LONEITU_KV.get(FULL_DB_KEY, 'json');
              if (full) authConfig = extractAuthPayload(full);
            }
          }
          if (!authConfig && inMemoryFallback) {
            authConfig = extractAuthPayload(inMemoryFallback);
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
              'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            },
          });
        }

        // Fast Lightweight Public Read (~38.5 KB — zero farmers, zero admin secrets, edge-cached)
        if (scope === 'public') {
          const publicCacheHeader = bypassCache
            ? 'no-store, no-cache, must-revalidate, max-age=0'
            : 'public, max-age=30, s-maxage=60, stale-while-revalidate=300';

          if (env.LONEITU_KV) {
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

            // Auto-migrate from legacy loneitu_global_db_v1 on first public read
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
              } catch {
                // ignore auto-migration write errors
              }
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

          const fallbackPublic = inMemoryFallback ? extractPublicPayload(inMemoryFallback) : null;
          return new Response(JSON.stringify({ success: true, scope: 'public', data: fallbackPublic }), {
            headers: {
              'Content-Type': 'application/json',
              ...CORS_HEADERS,
              'Cache-Control': publicCacheHeader,
            },
          });
        }

        // Admin-Protected Farmers Scope (~3.16 MB — only loaded when Admin logs in)
        if (scope === 'farmers') {
          let authConfig = null;
          if (env.LONEITU_KV) {
            authConfig = await env.LONEITU_KV.get(AUTH_DB_KEY, 'json');
            if (!authConfig) {
              const full = await env.LONEITU_KV.get(FULL_DB_KEY, 'json');
              if (full) authConfig = extractAuthPayload(full);
            }
          } else if (inMemoryFallback) {
            authConfig = extractAuthPayload(inMemoryFallback);
          }

          if (!isAdminAuthorized(request, authConfig)) {
            return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
            });
          }

          if (env.LONEITU_KV) {
            const farmersText = await env.LONEITU_KV.get(FARMERS_DB_KEY, 'text');
            if (farmersText) {
              return new Response(`{"success":true,"scope":"farmers","data":${farmersText}}`, {
                headers: {
                  'Content-Type': 'application/json',
                  ...CORS_HEADERS,
                  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
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
                  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                },
              });
            }
          }

          const fallbackFarmers = inMemoryFallback
            ? {
                farmers: inMemoryFallback.farmers || [],
                farmerCustomFields: inMemoryFallback.farmerCustomFields || [],
                updatedAt: inMemoryFallback.updatedAt,
              }
            : { farmers: [], farmerCustomFields: [] };
          return new Response(JSON.stringify({ success: true, scope: 'farmers', data: fallbackFarmers }), {
            headers: {
              'Content-Type': 'application/json',
              ...CORS_HEADERS,
              'Cache-Control': 'no-store',
            },
          });
        }

        // Legacy Full Read / Section Read
        let data = null;
        if (env.LONEITU_KV) {
          data = await env.LONEITU_KV.get(FULL_DB_KEY, 'json');
        }
        if (!data && inMemoryFallback) {
          data = inMemoryFallback;
        }

        // Section-specific fetch to save bandwidth (e.g. /api/db?section=aboutData)
        const section = url.searchParams.get('section');
        if (section && data && data[section] !== undefined) {
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
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
                Pragma: 'no-cache',
                Expires: '0',
                'X-Database-Updated-At': data.updatedAt || '',
              },
            }
          );
        }

        // Protect farmer & admin credentials unless caller passes valid Admin credentials
        if (data) {
          const authConfig = extractAuthPayload(data);
          if (!isAdminAuthorized(request, authConfig)) {
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
        }

        return new Response(JSON.stringify({ success: true, data }), {
          headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS,
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
            Pragma: 'no-cache',
            Expires: '0',
            'X-Database-Updated-At': data?.updatedAt || '',
          },
        });
      }

      if (request.method === 'POST') {
        try {
          // Security Check: Verify Admin authorization credentials
          let authConfig: any = null;
          let currentData: any = null;
          if (env.LONEITU_KV) {
            authConfig = await env.LONEITU_KV.get(AUTH_DB_KEY, 'json');
            currentData = await env.LONEITU_KV.get(FULL_DB_KEY, 'json');
            if (!authConfig && currentData) authConfig = extractAuthPayload(currentData);
          }
          if (!currentData && inMemoryFallback) {
            currentData = inMemoryFallback;
            if (!authConfig) authConfig = extractAuthPayload(currentData);
          }

          if (authConfig && !isAdminAuthorized(request, authConfig)) {
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

          const body = await request.json();
          const now = new Date().toISOString();
          const incomingUpdatedAt = body.updatedAt || now;

          // Merge partial updates seamlessly if not full DB backup
          let fullDataToSave = body;
          if (currentData && (!body.farmers || !Array.isArray(body.farmers))) {
            fullDataToSave = {
              ...currentData,
              ...body,
              updatedAt: incomingUpdatedAt,
            };
          } else {
            fullDataToSave.updatedAt = incomingUpdatedAt;
          }

          inMemoryFallback = fullDataToSave;
          let kvSaved = false;
          if (env.LONEITU_KV) {
            const writes: Promise<any>[] = [
              env.LONEITU_KV.put(FULL_DB_KEY, JSON.stringify(fullDataToSave)),
              env.LONEITU_KV.put(PUBLIC_DB_KEY, JSON.stringify(extractPublicPayload(fullDataToSave))),
              env.LONEITU_KV.put(AUTH_DB_KEY, JSON.stringify(extractAuthPayload(fullDataToSave))),
            ];

            if (Array.isArray(body.farmers) || Array.isArray(body.farmerCustomFields) || !currentData) {
              writes.push(
                env.LONEITU_KV.put(
                  FARMERS_DB_KEY,
                  JSON.stringify({
                    farmers: Array.isArray(fullDataToSave.farmers) ? fullDataToSave.farmers : [],
                    farmerCustomFields: Array.isArray(fullDataToSave.farmerCustomFields)
                      ? fullDataToSave.farmerCustomFields
                      : [],
                    updatedAt: fullDataToSave.updatedAt,
                  })
                )
              );
            }

            const featuredArticle = (fullDataToSave.articles || []).find((a: any) => a.isFeatured);
            writes.push(
              env.LONEITU_KV.put(
                META_DB_KEY,
                JSON.stringify({
                  updatedAt: fullDataToSave.updatedAt,
                  timestamp: Date.now(),
                  featuredId: featuredArticle?.id || null,
                  cardCount: fullDataToSave.aboutData?.customCardsSection?.cards?.length || 0,
                  articlesCount: fullDataToSave.articles?.length || 0,
                })
              )
            );
            await Promise.all(writes);
            kvSaved = true;
          }

          return new Response(JSON.stringify({ success: true, kvSaved, updatedAt: fullDataToSave.updatedAt, data: fullDataToSave }), {
            headers: {
              'Content-Type': 'application/json',
              ...CORS_HEADERS,
              'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
              Pragma: 'no-cache',
              'X-Database-Updated-At': fullDataToSave.updatedAt,
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
      }
    }

    // 2.5 Site Visitor Stats Counter API: GET/POST /api/stats (starts at 100102)
    if (url.pathname === '/api/stats') {
      let current = inMemorySiteViews;
      if (env.LONEITU_KV) {
        try {
          const raw = await env.LONEITU_KV.get(KV_VIEWS_KEY, 'text');
          const parsed = Number(raw);
          if (Number.isFinite(parsed) && parsed >= INITIAL_SITE_VIEWS) {
            current = Math.max(current, Math.floor(parsed));
          }
        } catch {
          // fallback to inMemorySiteViews
        }
      }

      if (request.method === 'POST') {
        const nextViews = current + 1;
        inMemorySiteViews = nextViews;
        if (env.LONEITU_KV) {
          try {
            await env.LONEITU_KV.put(KV_VIEWS_KEY, String(nextViews));
          } catch {
            // ignore transient KV write rate limits
          }
        }
        return new Response(JSON.stringify({ success: true, views: nextViews, persisted: Boolean(env.LONEITU_KV) }), {
          headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS,
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          },
        });
      }

      inMemorySiteViews = current;
      return new Response(JSON.stringify({ success: true, views: current }), {
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS,
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      });
    }

    // 2.6 Per-Article Global View Counter API: GET/POST /api/article-views
    if (url.pathname === '/api/article-views') {
      if (request.method === 'GET') {
        const articleId = (url.searchParams.get('id') || '').trim();
        if (!articleId) {
          return new Response(JSON.stringify({ success: false, error: 'Missing article id' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
          });
        }

        let views: number | null = inMemoryArticleViews[articleId] ?? null;
        if (env.LONEITU_KV) {
          try {
            const raw = await env.LONEITU_KV.get(`art_views:${articleId}`, 'text');
            const parsed = Number(raw);
            if (Number.isFinite(parsed) && parsed > 0) {
              views = Math.max(views ?? 0, Math.floor(parsed));
              inMemoryArticleViews[articleId] = views;
            }
          } catch { }
        }
        return new Response(JSON.stringify({ success: true, articleId, views }), {
          headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS,
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          },
        });
      }

      if (request.method === 'POST') {
        try {
          const body = (await request.json()) as {
            articleId?: string;
            baseViews?: number;
            setExact?: boolean;
            updates?: Array<{ id: string; views: number }>;
          };

          // Admin bulk/exact override when Blogger views are updated manually
          if (body.setExact) {
            let authConfig = null;
            if (env.LONEITU_KV) {
              authConfig = (await env.LONEITU_KV.get(AUTH_DB_KEY, 'json')) || extractAuthPayload(await env.LONEITU_KV.get(FULL_DB_KEY, 'json'));
            }
            if (!isAdminAuthorized(request, authConfig)) {
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

            if (env.LONEITU_KV) {
              await Promise.all(
                list.map(async item => {
                  if (!item.id) return;
                  const safeVal = Math.max(0, Math.floor(Number(item.views) || 0));
                  inMemoryArticleViews[item.id] = safeVal;
                  try {
                    await env.LONEITU_KV!.put(`art_views:${item.id}`, String(safeVal));
                  } catch { }
                })
              );
            }
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

          let current = Math.max(inMemoryArticleViews[articleId] ?? 0, Math.floor(Number(body.baseViews) || 1));
          if (env.LONEITU_KV) {
            try {
              const raw = await env.LONEITU_KV.get(`art_views:${articleId}`, 'text');
              const parsed = Number(raw);
              if (Number.isFinite(parsed) && parsed > 0) {
                current = Math.max(current, Math.floor(parsed));
              }
            } catch { }
          }

          const nextViews = current + 1;
          inMemoryArticleViews[articleId] = nextViews;

          if (env.LONEITU_KV) {
            try {
              await env.LONEITU_KV.put(`art_views:${articleId}`, String(nextViews));
            } catch { }
          }

          return new Response(JSON.stringify({ success: true, articleId, views: nextViews, persisted: Boolean(env.LONEITU_KV) }), {
            headers: {
              'Content-Type': 'application/json',
              ...CORS_HEADERS,
              'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            },
          });
        } catch (err: any) {
          return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
          });
        }
      }
    }

    // 2.7 Public Farmer QR Verification Lookup API: GET /api/verify-farmer?id=<farmerId>
    if (url.pathname === '/api/verify-farmer' && request.method === 'GET') {
      const farmerId = decodeURIComponent((url.searchParams.get('id') || '').trim());
      if (!farmerId) {
        return new Response(JSON.stringify({ success: false, error: 'Missing farmer ID' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        });
      }

      let farmersList: any[] = [];
      if (env.LONEITU_KV) {
        const farmersDb = await env.LONEITU_KV.get(FARMERS_DB_KEY, 'json');
        if (farmersDb && Array.isArray(farmersDb.farmers)) {
          farmersList = farmersDb.farmers;
        } else {
          const fullDb = await env.LONEITU_KV.get(FULL_DB_KEY, 'json');
          if (fullDb && Array.isArray(fullDb.farmers)) {
            farmersList = fullDb.farmers;
          }
        }
      } else if (inMemoryFallback && Array.isArray(inMemoryFallback.farmers)) {
        farmersList = inMemoryFallback.farmers;
      }

      const found = farmersList.find((f: any) => f.id === farmerId);
      if (!found) {
        return new Response(JSON.stringify({ success: false, error: 'Farmer record not found in verified registry' }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS,
            'Cache-Control': 'no-store',
          },
        });
      }

      return new Response(JSON.stringify({ success: true, farmer: sanitizeFarmerForVerification(found) }), {
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS,
          'Cache-Control': 'public, max-age=60, s-maxage=300',
        },
      });
    }

    // 3. Image Upload Endpoint: POST /api/upload
    if (url.pathname === '/api/upload' && request.method === 'POST') {
      try {
        const body = (await request.json()) as { dataUrl: string; filename?: string };
        if (!body || !body.dataUrl) {
          return new Response(JSON.stringify({ success: false, error: 'Missing image data' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
          });
        }

        const id = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        if (env.LONEITU_KV) {
          await env.LONEITU_KV.put(`img:${id}`, body.dataUrl);
        }

        // Return CDN-ready URL served by this worker
        const imageUrl = `/api/images/${id}`;
        return new Response(JSON.stringify({ success: true, url: imageUrl, id }), {
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        });
      }
    }

    // 4. Image Serving Endpoint: GET /api/images/:id
    if (url.pathname.startsWith('/api/images/')) {
      const imgId = url.pathname.replace('/api/images/', '').trim();
      if (imgId && env.LONEITU_KV) {
        const dataUrl = await env.LONEITU_KV.get(`img:${imgId}`, 'text');
        if (dataUrl && dataUrl.startsWith('data:')) {
          const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            const mimeType = match[1];
            const base64Data = match[2];
            const binaryString = atob(base64Data);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            return new Response(bytes.buffer, {
              headers: {
                'Content-Type': mimeType,
                'Cache-Control': 'public, max-age=31536000, immutable',
                ...CORS_HEADERS,
              },
            });
          }
        }
      }
      return new Response('Image Not Found', { status: 404 });
    }

    // 4.5 Blogspot Import Proxy: POST /api/import-blogspot
    if (url.pathname === '/api/import-blogspot' && request.method === 'POST') {
      try {
        const body = (await request.json()) as {
          url?: string;
          mode?: 'auto' | 'single' | 'feed';
          maxResults?: number;
        };

        if (!body || !body.url || !body.url.trim()) {
          return new Response(JSON.stringify({ success: false, error: 'A valid Blogspot URL is required.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
          });
        }

        let urlStr = body.url.trim();
        if (!/^https?:\/\//i.test(urlStr)) urlStr = 'https://' + urlStr;
        const targetUrl = new URL(urlStr);

        const pathname = targetUrl.pathname.toLowerCase();
        const isSinglePost =
          body.mode === 'single' ||
          (body.mode !== 'feed' && (pathname.endsWith('.html') || /\/\d{4}\/\d{2}\//.test(pathname)));

        if (isSinglePost) {
          const feedUrl = `https://${targetUrl.hostname}/feeds/posts/default?alt=json&path=${encodeURIComponent(targetUrl.pathname)}`;
          let postData: any = null;

          try {
            const feedRes = await fetch(feedUrl, {
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
            });
            if (feedRes.ok) {
              const feedJson: any = await feedRes.json();
              const entry = feedJson.entry || feedJson.feed?.entry?.[0];
              if (entry) {
                const title = (entry.title?.$t || '').trim();
                const content = (entry.content?.$t || entry.summary?.$t || '').trim();
                let cover = '';
                if (entry.media$thumbnail?.url) {
                  cover = entry.media$thumbnail.url.replace(/\/s72-c(\/|$)/, '/s1600$1').replace(/\/w\d+-h\d+-c\//, '/s1600/');
                }
                if (!cover && content) {
                  const m = content.match(/<img[^>]+src=["']([^"']+)["']/i);
                  if (m) cover = m[1];
                }
                const tags = Array.isArray(entry.category) ? entry.category.map((c: any) => (c.term || '').trim()).filter(Boolean) : [];
                const altLink = Array.isArray(entry.link) ? entry.link.find((l: any) => l.rel === 'alternate')?.href || '' : '';
                postData = {
                  title,
                  content,
                  excerpt: stripMarkdown(content).substring(0, 160),
                  coverImage: cover,
                  publishedAt: entry.published?.$t || new Date().toISOString(),
                  tags,
                  authorName: entry.author?.[0]?.name?.$t || '',
                  originalUrl: altLink || targetUrl.href,
                };
              }
            }
          } catch {}

          if (!postData) {
            return new Response(
              JSON.stringify({ success: false, error: 'Could not extract article content from this Blogspot URL.' }),
              { status: 404, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
            );
          }

          return new Response(JSON.stringify({ success: true, mode: 'single', post: postData }), {
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
          });
        }

        // Feed mode
        const limit = Math.min(Math.max(body.maxResults || 25, 1), 50);
        const feedUrl = `https://${targetUrl.hostname}/feeds/posts/default?alt=json&max-results=${limit}`;
        const feedRes = await fetch(feedUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        });

        if (!feedRes.ok) {
          return new Response(JSON.stringify({ success: false, error: `Failed to fetch blog feed from ${targetUrl.hostname}` }), {
            status: feedRes.status,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
          });
        }

        const feedJson: any = await feedRes.json();
        const blogTitle = (feedJson.feed?.title?.$t || targetUrl.hostname).trim();
        const rawEntries = feedJson.feed?.entry || [];
        const posts = rawEntries.map((entry: any) => {
          const title = (entry.title?.$t || '').trim();
          const content = (entry.content?.$t || entry.summary?.$t || '').trim();
          let cover = '';
          if (entry.media$thumbnail?.url) {
            cover = entry.media$thumbnail.url.replace(/\/s72-c(\/|$)/, '/s1600$1').replace(/\/w\d+-h\d+-c\//, '/s1600/');
          }
          if (!cover && content) {
            const m = content.match(/<img[^>]+src=["']([^"']+)["']/i);
            if (m) cover = m[1];
          }
          const tags = Array.isArray(entry.category) ? entry.category.map((c: any) => (c.term || '').trim()).filter(Boolean) : [];
          const altLink = Array.isArray(entry.link) ? entry.link.find((l: any) => l.rel === 'alternate')?.href || '' : '';
          return {
            title,
            content,
            excerpt: stripMarkdown(content).substring(0, 160),
            coverImage: cover,
            publishedAt: entry.published?.$t || new Date().toISOString(),
            tags,
            authorName: entry.author?.[0]?.name?.$t || '',
            originalUrl: altLink,
          };
        }).filter((p: any) => p.title);

        return new Response(JSON.stringify({ success: true, mode: 'feed', blogTitle, totalPosts: posts.length, posts }), {
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        });
      }
    }

    // 5. Social Bot Open Graph Rich Previews: /article/:slug
    if (url.pathname.startsWith('/article/')) {
      const userAgent = (request.headers.get('user-agent') || '').toLowerCase();
      const isSocialBot = /(whatsapp|facebookexternalhit|facebot|twitterbot|telegrambot|linkedinbot|discordbot|slackbot|applebot|skypeuripreview|googlebot|bingbot|yahoo|duckduckbot)/i.test(
        userAgent
      );

      if (isSocialBot) {
        const rawSlug = url.pathname.replace('/article/', '').split('/')[0].split('?')[0].trim();
        const slug = decodeURIComponent(rawSlug);

        let db: any = null;
        if (env.LONEITU_KV) {
          db = (await env.LONEITU_KV.get(PUBLIC_DB_KEY, 'json')) || (await env.LONEITU_KV.get(FULL_DB_KEY, 'json'));
        }
        if (!db && inMemoryFallback) {
          db = inMemoryFallback;
        }

        const allArticles = (db && Array.isArray(db.articles) && db.articles.length > 0)
          ? db.articles
          : INITIAL_ARTICLES;

        const article = allArticles.find((a: any) => a.slug === slug || a.id === slug);
        if (article) {
          const title = escapeHtml(article.title);

          // Clean excerpt stripped of markdown characters
          let rawExcerpt = article.excerpt || article.content || '';
          let cleanExcerpt = stripMarkdown(rawExcerpt);
          if (cleanExcerpt.length > 160) {
            cleanExcerpt = cleanExcerpt.substring(0, 157).trim() + '...';
          }
          if (!cleanExcerpt) {
            cleanExcerpt = article.title;
          }
          const desc = escapeHtml(cleanExcerpt);

          // Ensure absolute cover URL for WhatsApp & Social crawlers
          let cover = (article.coverImage || '').trim();
          if (!cover || cover.startsWith('data:')) {
            cover = `${url.origin}/logo.jpg`;
          } else if (cover.startsWith('/')) {
            cover = `${url.origin}${cover}`;
          }

          const isPng = cover.toLowerCase().endsWith('.png');
          const imageType = isPng ? 'image/png' : 'image/jpeg';
          const fullUrl = `${url.origin}/article/${slug}`;

          const botHtml = `<!DOCTYPE html>
<html lang="en" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — Loneitu (MIZORAM TAN)</title>
  <meta name="description" content="${desc}" />

  <!-- Canonical URL -->
  <link rel="canonical" href="${fullUrl}" />

  <!-- Open Graph / WhatsApp / Facebook Rich Preview -->
  <meta property="og:site_name" content="Loneitu (MIZORAM TAN) — Mizo Farm Solutions" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:image" content="${cover}" />
  <meta property="og:image:secure_url" content="${cover}" />
  <meta property="og:image:type" content="${imageType}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${title}" />
  <meta property="og:url" content="${fullUrl}" />

  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${desc}" />
  <meta name="twitter:image" content="${cover}" />
  <meta name="twitter:url" content="${fullUrl}" />
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 24px; line-height: 1.6; max-width: 600px; margin: 0 auto; color: #1e2922;">
  <p><a href="${fullUrl}" style="color: #256b3a; font-weight: bold; text-decoration: none;">← Open on Loneitu Journal</a></p>
  <h1 style="color: #143520; font-size: 24px; margin-top: 16px;">${title}</h1>
  <p style="color: #54432c; font-size: 15px;">${desc}</p>
  <img src="${cover}" alt="${title}" style="max-width: 100%; border-radius: 12px; margin-top: 16px; border: 1px solid #ddd4bc;" />
</body>
</html>`;
          return new Response(botHtml, {
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'public, max-age=3600, s-maxage=86400',
            },
          });
        }
      }
    }

    // Default: Serve frontend static assets from ./dist with SPA fallback
    if (env.ASSETS) {
      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse.status === 404 && !url.pathname.includes('.')) {
        return env.ASSETS.fetch(new Request(new URL('/', request.url), request));
      }
      return assetResponse;
    }
    return new Response('Assets binding not available', { status: 500 });
  },
};
