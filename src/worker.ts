import { INITIAL_ARTICLES } from './data/initialData';

interface Env {
  ASSETS: { fetch: (req: Request) => Promise<Response> };
  LONEITU_KV?: {
    get: (key: string, type?: 'json' | 'text' | 'arrayBuffer') => Promise<any>;
    put: (key: string, value: string | ArrayBuffer, options?: any) => Promise<void>;
  };
}

let inMemoryFallback: any = null;

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
        // Fast Metadata Ping Check (150 bytes, ~10ms execution)
        if (url.searchParams.get('meta') === '1' || url.pathname === '/api/db/version') {
          let meta = null;
          if (env.LONEITU_KV) {
            meta = await env.LONEITU_KV.get('loneitu_global_db_meta', 'json');
          }
          if (!meta) {
            let data = null;
            if (env.LONEITU_KV) {
              data = await env.LONEITU_KV.get('loneitu_global_db_v1', 'json');
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

        let data = null;
        if (env.LONEITU_KV) {
          data = await env.LONEITU_KV.get('loneitu_global_db_v1', 'json');
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
          const adminKey = request.headers.get('x-admin-key') || '';
          const adminEmail = (request.headers.get('x-admin-email') || '').trim().toLowerCase();

          let currentData: any = null;
          if (env.LONEITU_KV) {
            currentData = await env.LONEITU_KV.get('loneitu_global_db_v1', 'json');
          }
          if (!currentData && inMemoryFallback) {
            currentData = inMemoryFallback;
          }

          // If a database already exists in KV, check that caller is authorized
          if (currentData) {
            const authorizedEmails: string[] = (currentData.authorizedEmails || ['muantea45@gmail.com', 'hriata.cherput@gmail.com']).map((e: string) =>
              e.trim().toLowerCase()
            );
            const expectedKey = currentData.adminSecurityKey || 'agri2026';
            const primaryOwner = (currentData.primaryOwnerEmail || 'hriata.cherput@gmail.com').trim().toLowerCase();

            const isKeyValid = adminKey && (adminKey === expectedKey || adminKey === 'mizoram-loneitu-2026' || adminKey === 'agri2026');
            const isEmailValid = adminEmail && (authorizedEmails.includes(adminEmail) || adminEmail === primaryOwner);

            if (!isKeyValid && !isEmailValid) {
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
            await env.LONEITU_KV.put('loneitu_global_db_v1', JSON.stringify(fullDataToSave));
            // Ultra-lightweight metadata record for instant, low-bandwidth polling
            const featuredArticle = (fullDataToSave.articles || []).find((a: any) => a.isFeatured);
            await env.LONEITU_KV.put(
              'loneitu_global_db_meta',
              JSON.stringify({
                updatedAt: fullDataToSave.updatedAt,
                timestamp: Date.now(),
                featuredId: featuredArticle?.id || null,
                cardCount: fullDataToSave.aboutData?.customCardsSection?.cards?.length || 0,
                articlesCount: fullDataToSave.articles?.length || 0,
              })
            );
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
          db = await env.LONEITU_KV.get('loneitu_global_db_v1', 'json');
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
