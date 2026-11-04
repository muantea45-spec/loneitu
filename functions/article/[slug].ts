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

function stripMarkdown(text: string): string {
  return (text || '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*`_~>[\]]/g, '')
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
  const slug = (context.params.slug as string) || url.pathname.replace('/article/', '').split('/')[0].split('?')[0].trim();

  try {
    // Fetch latest database from backend KV API
    const dbRes = await fetch('https://loneitu.ddvktp.workers.dev/api/db');
    const json = await dbRes.json();
    const articles = json?.data?.articles || [];

    const article = articles.find((a: any) => a.slug === slug || a.id === slug);

    if (article) {
      const title = escapeHtml(article.title);

      let rawExcerpt = article.excerpt || article.content || '';
      let cleanExcerpt = stripMarkdown(rawExcerpt);
      if (cleanExcerpt.length > 180) {
        cleanExcerpt = cleanExcerpt.substring(0, 177).trim() + '...';
      }
      if (!cleanExcerpt) {
        cleanExcerpt = article.title;
      }
      const desc = escapeHtml(cleanExcerpt);

      let cover = article.coverImage || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80';
      if (cover.startsWith('/')) {
        cover = `https://loneitu.ddvktp.workers.dev${cover}`;
      }

      const fullUrl = `${url.origin}/article/${slug}`;

      const botHtml = `<!DOCTYPE html>
<html lang="en" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — Loneitu (MIZORAM TAN)</title>
  <meta name="description" content="${desc}" />

  <link rel="canonical" href="${fullUrl}" />

  <meta property="og:site_name" content="Loneitu (MIZORAM TAN)" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:image" content="${cover}" />
  <meta property="og:image:secure_url" content="${cover}" />
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
  <p style="color: #54432c;">${desc}</p>
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

