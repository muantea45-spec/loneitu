/**
 * Cloudflare Pages Function: /article/:slug
 * Intercepts WhatsApp, Facebook, Twitter, and other social bots
 * to serve rich Open Graph previews with Picture, Heading, and Excerpt.
 */
function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function cleanArticleExcerpt(raw: string): string {
  if (!raw) return '';
  return raw
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

export const onRequest: PagesFunction = async (context) => {
  const request = context.request;
  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();
  const isSocialBot = /(whatsapp|facebookexternalhit|facebot|twitterbot|telegrambot|linkedinbot|discordbot|slackbot|applebot|skypeuripreview|googlebot|bingbot|yahoo|duckduckbot)/i.test(
    userAgent
  );

  // If regular user in a browser, pass through to SPA index.html
  if (!isSocialBot) {
    return context.next();
  }

  const url = new URL(request.url);
  const rawSlug = (context.params.slug as string) || url.pathname.replace('/article/', '').split('/')[0].split('?')[0].trim();
  const slug = decodeURIComponent(rawSlug).replace(/\/+$/, '');

  try {
    const env = context.env as any;
    let articles: any[] = [];

    // 1. Direct KV read if available in Pages context (fastest: reads ~38 KB public DB first)
    if (env?.LONEITU_KV) {
      try {
        const kvData =
          (await env.LONEITU_KV.get('loneitu_public_db_v1', 'json')) ||
          (await env.LONEITU_KV.get('loneitu_global_db_v1', 'json'));
        if (kvData?.articles && Array.isArray(kvData.articles)) {
          articles = kvData.articles;
        }
      } catch (kvErr) {
        console.warn('KV read in social preview', kvErr);
      }
    }

    // 2. Fallback to lightweight articles-only endpoint from backend worker
    if (!articles || articles.length === 0) {
      try {
        const dbRes = await fetch('https://loneitu.ddvktp.workers.dev/api/db?section=articles');
        if (dbRes.ok) {
          const json: any = await dbRes.json();
          if (json?.data && Array.isArray(json.data)) {
            articles = json.data;
          }
        }
      } catch (fetchErr) {
        console.warn('Worker articles fetch in social preview', fetchErr);
      }
    }

    const article = articles.find((a: any) => a.slug === slug || a.id === slug);

    if (article) {
      const title = escapeHtml(article.title);

      // Clean excerpt stripped of all HTML and markdown tags
      let rawExcerpt = article.excerpt?.trim() || article.content?.trim() || '';
      let cleanExcerpt = cleanArticleExcerpt(rawExcerpt);
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

  <link rel="canonical" href="${fullUrl}" />

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

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${desc}" />
  <meta name="twitter:image" content="${cover}" />
  <meta name="twitter:url" content="${fullUrl}" />
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; max-width: 600px; margin: 0 auto; color: #1e2922;">
  <p><a href="${fullUrl}" style="color: #256b3a; font-weight: bold; text-decoration: none;">← Open on Loneitu Journal</a></p>
  <h1 style="color: #143520; font-size: 24px;">${title}</h1>
  <p style="color: #54432c; line-height: 1.6;">${desc}</p>
  <img src="${cover}" alt="${title}" style="max-width: 100%; border-radius: 12px; margin-top: 16px;" />
</body>
</html>`;

      return new Response(botHtml, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, s-maxage=86400',
        },
      });
    }
  } catch (err) {
    console.error('Error serving social preview in Pages function', err);
  }

  // Fallback to normal SPA handling
  return context.next();
};

