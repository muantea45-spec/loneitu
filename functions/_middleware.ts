/**
 * Cloudflare Pages Middleware:
 * Intercepts social media bots (WhatsApp, Facebook, Twitter, Telegram, LinkedIn, etc.)
 * when sharing the root site URL or homepage to serve the Mizo Farm Solutions Logo
 * and branded metadata dynamically for any domain name.
 */
export const onRequest: PagesFunction = async (context) => {
  const request = context.request;
  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();
  const isSocialBot = /(whatsapp|facebookexternalhit|facebot|twitterbot|telegrambot|linkedinbot|discordbot|slackbot|applebot|skypeuripreview|googlebot|bingbot|yahoo|duckduckbot)/i.test(
    userAgent
  );

  const url = new URL(request.url);

  // If a social crawler requests the root site URL or homepage
  if (isSocialBot && (url.pathname === '/' || url.pathname === '/index.html' || url.pathname === '')) {
    const siteTitle = 'Loneitu (MIZORAM TAN) — Mizo Farm Solutions';
    const siteDesc = 'Mizo Farm Solutions — Loneitu: Mizoram leilung mil thlai enkawl dan, huan siam dan thar, leh ran vulh dan tha ziah chhuahna journal.';
    const logoUrl = `${url.origin}/logo.jpg`;
    const fullUrl = `${url.origin}/`;

    const html = `<!DOCTYPE html>
<html lang="en" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${siteTitle}</title>
  <meta name="description" content="${siteDesc}" />
  <link rel="canonical" href="${fullUrl}" />

  <meta property="og:site_name" content="Mizo Farm Solutions — Loneitu" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${siteTitle}" />
  <meta property="og:description" content="${siteDesc}" />
  <meta property="og:image" content="${logoUrl}" />
  <meta property="og:image:secure_url" content="${logoUrl}" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="696" />
  <meta property="og:image:height" content="705" />
  <meta property="og:image:alt" content="Mizo Farm Solutions Logo" />
  <meta property="og:url" content="${fullUrl}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${siteTitle}" />
  <meta name="twitter:description" content="${siteDesc}" />
  <meta name="twitter:image" content="${logoUrl}" />
  <meta name="twitter:url" content="${fullUrl}" />
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 32px 16px; text-align: center; color: #1e2922; background-color: #f7f7f7;">
  <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 32px 24px; border: 1px solid #e5e5e5; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <img src="${logoUrl}" alt="Mizo Farm Solutions" style="width: 130px; height: 130px; object-fit: contain; margin-bottom: 20px; border-radius: 16px;" />
    <h1 style="color: #143520; font-size: 22px; margin-bottom: 12px; line-height: 1.3;">${siteTitle}</h1>
    <p style="color: #54432c; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">${siteDesc}</p>
    <a href="${fullUrl}" style="display: inline-block; padding: 12px 24px; background: #143520; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px;">Visit Loneitu Website</a>
  </div>
</body>
</html>`;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    });
  }

  return context.next();
};
