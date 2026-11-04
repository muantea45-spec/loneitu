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

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Key, X-Admin-Email',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // 1. CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // 2. Database API: /api/db
    if (url.pathname === '/api/db') {
      if (request.method === 'GET') {
        let data = null;
        if (env.LONEITU_KV) {
          data = await env.LONEITU_KV.get('loneitu_global_db_v1', 'json');
        }
        if (!data && inMemoryFallback) {
          data = inMemoryFallback;
        }

        return new Response(JSON.stringify({ success: true, data }), {
          headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS,
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
            Pragma: 'no-cache',
            Expires: '0',
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
            const authorizedEmails: string[] = (currentData.authorizedEmails || ['muantea45@gmail.com']).map((e: string) =>
              e.trim().toLowerCase()
            );
            const expectedKey = currentData.adminSecurityKey || 'mizoram-loneitu-2026';
            const primaryOwner = (currentData.primaryOwnerEmail || 'muantea45@gmail.com').trim().toLowerCase();

            const isKeyValid = adminKey && (adminKey === expectedKey || adminKey === 'mizoram-loneitu-2026');
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
          inMemoryFallback = body;
          let kvSaved = false;
          if (env.LONEITU_KV) {
            await env.LONEITU_KV.put('loneitu_global_db_v1', JSON.stringify(body));
            kvSaved = true;
          }
          return new Response(JSON.stringify({ success: true, kvSaved, data: body }), {
            headers: {
              'Content-Type': 'application/json',
              ...CORS_HEADERS,
              'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
              Pragma: 'no-cache',
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
      const isSocialBot = /(whatsapp|facebookexternalhit|facebot|twitterbot|telegrambot|linkedinbot|discordbot|slackbot|applebot)/i.test(
        userAgent
      );

      if (isSocialBot) {
        const slug = url.pathname.replace('/article/', '').split('/')[0].trim();
        let db: any = null;
        if (env.LONEITU_KV) {
          db = await env.LONEITU_KV.get('loneitu_global_db_v1', 'json');
        }
        if (!db && inMemoryFallback) {
          db = inMemoryFallback;
        }

        const article = db?.articles?.find((a: any) => a.slug === slug);
        if (article) {
          const title = escapeHtml(article.title);
          const desc = escapeHtml(article.excerpt || article.title);
          const cover = article.coverImage || 'https://loneitu.pages.dev/og-default.jpg';
          const fullUrl = `https://loneitu.pages.dev/article/${slug}`;

          const botHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${title} — Loneitu (MIZORAM TAN)</title>
  <meta name="description" content="${desc}" />

  <!-- Open Graph / Facebook / WhatsApp Preview -->
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Loneitu (MIZORAM TAN)" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:image" content="${cover}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="${fullUrl}" />

  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${desc}" />
  <meta name="twitter:image" content="${cover}" />
</head>
<body>
  <h1>${title}</h1>
  <p>${desc}</p>
  <img src="${cover}" alt="${title}" />
</body>
</html>`;
          return new Response(botHtml, {
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'public, max-age=3600',
            },
          });
        }
      }
    }

    // Default: Serve frontend static assets from ./dist
    return env.ASSETS.fetch(request);
  },
};
