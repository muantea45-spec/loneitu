/**
 * Cloudflare Pages Function: /api/import-blogspot
 * Secure serverless edge proxy to import posts directly from any Blogspot / Blogger blog.
 * Bypasses browser CORS restrictions and parses both single articles and entire blog feeds.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Max-Age': '86400',
};

function normalizeBlogspotUrl(rawUrl: string): URL {
  let urlStr = (rawUrl || '').trim();
  if (!/^https?:\/\//i.test(urlStr)) {
    urlStr = 'https://' + urlStr;
  }
  return new URL(urlStr);
}

function cleanExcerpt(raw: string, maxLength = 160): string {
  if (!raw) return '';
  const cleaned = raw
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

  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.substring(0, maxLength - 3).trim() + '...';
}

function extractCoverImage(entry: any, htmlContent = ''): string {
  let cover = '';
  if (entry.media$thumbnail?.url) {
    cover = entry.media$thumbnail.url
      .replace(/\/s72-c(\/|$)/, '/s1600$1')
      .replace(/\/w\d+-h\d+-c\//, '/s1600/')
      .replace(/\/s72-w\d+-h\d+-c\//, '/s1600/');
  }
  if (!cover && htmlContent) {
    const imgMatch = htmlContent.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch) cover = imgMatch[1];
  }
  return cover;
}

function parseEntry(entry: any): any {
  const title = (entry.title?.$t || '').trim();
  const content = (entry.content?.$t || entry.summary?.$t || '').trim();
  const coverImage = extractCoverImage(entry, content);
  const publishedAt = entry.published?.$t || new Date().toISOString();
  const tags: string[] = Array.isArray(entry.category)
    ? entry.category.map((c: any) => (c.term || '').trim()).filter(Boolean)
    : [];
  const authorName = entry.author?.[0]?.name?.$t || '';
  const altLink = Array.isArray(entry.link)
    ? entry.link.find((l: any) => l.rel === 'alternate')?.href || ''
    : '';

  return {
    title,
    content,
    excerpt: cleanExcerpt(content, 160),
    coverImage,
    publishedAt,
    tags,
    authorName,
    originalUrl: altLink,
  };
}

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const body = (await context.request.json()) as {
      url?: string;
      mode?: 'auto' | 'single' | 'feed';
      maxResults?: number;
    };

    if (!body || !body.url || !body.url.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: 'A valid Blogspot URL is required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    let urlObj: URL;
    try {
      urlObj = normalizeBlogspotUrl(body.url);
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid URL format. Please enter a valid Blogspot URL.' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    const pathname = urlObj.pathname.toLowerCase();
    const isSinglePost =
      body.mode === 'single' ||
      (body.mode !== 'feed' && (pathname.endsWith('.html') || /\/\d{4}\/\d{2}\//.test(pathname)));

    // 1. Single Post Import Mode
    if (isSinglePost) {
      // Try official Blogger JSON Feed by path query
      const feedUrl = `https://${urlObj.hostname}/feeds/posts/default?alt=json&path=${encodeURIComponent(urlObj.pathname)}`;
      let postData: any = null;

      try {
        const feedRes = await fetch(feedUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        });

        if (feedRes.ok) {
          const feedJson: any = await feedRes.json();
          const entry = feedJson.entry || feedJson.feed?.entry?.[0];
          if (entry) {
            postData = parseEntry(entry);
          }
        }
      } catch (feedErr) {
        console.warn('Blogger feed query error:', feedErr);
      }

      // Fallback: Direct HTML scraping if feed query failed or template restricts path feeds
      if (!postData) {
        try {
          const pageRes = await fetch(urlObj.href, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          });

          if (pageRes.ok) {
            const html = await pageRes.text();

            // Extract Title
            const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
            const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
            const title = (ogTitle ? ogTitle[1] : titleMatch ? titleMatch[1] : '').replace(/\s*[-–|].*$/, '').trim();

            // Extract Cover Image
            const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
            let cover = ogImage ? ogImage[1] : '';
            if (cover) {
              cover = cover.replace(/\/s72-c(\/|$)/, '/s1600$1').replace(/\/w\d+-h\d+-c\//, '/s1600/');
            }

            // Extract Body
            const bodyMatch =
              html.match(/<div[^>]*class=["'][^"']*(?:post-body|entry-content)[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<(?:div class=["']post-footer|footer)/i) ||
              html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
            const content = bodyMatch ? bodyMatch[1].trim() : '';

            // Extract Tags/Labels
            const tagMatches = [...html.matchAll(/rel=["']tag["'][^>]*>([^<]+)<\/a>/gi)];
            const tags = tagMatches.map(m => m[1].trim()).filter(Boolean);

            if (title && (content || cover)) {
              postData = {
                title,
                content: content || `<p>${cleanExcerpt(html, 200)}</p>`,
                excerpt: cleanExcerpt(content || html, 160),
                coverImage: cover,
                publishedAt: new Date().toISOString(),
                tags,
                authorName: '',
                originalUrl: urlObj.href,
              };
            }
          }
        } catch (pageErr) {
          console.warn('Direct HTML scrape error:', pageErr);
        }
      }

      if (!postData) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Could not extract article content from this Blogspot URL. Ensure the post is published publicly.',
          }),
          { status: 404, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, mode: 'single', post: postData }),
        { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    // 2. Blog Feed Import Mode (Fetch recent posts)
    const limit = Math.min(Math.max(body.maxResults || 25, 1), 50);
    const feedUrl = `https://${urlObj.hostname}/feeds/posts/default?alt=json&max-results=${limit}`;

    const feedRes = await fetch(feedUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });

    if (!feedRes.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to fetch blog feed from ${urlObj.hostname}. Please verify the domain and ensure public access is enabled.`,
        }),
        { status: feedRes.status, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    const feedJson: any = await feedRes.json();
    const blogTitle = (feedJson.feed?.title?.$t || urlObj.hostname).trim();
    const rawEntries = feedJson.feed?.entry || [];
    const posts = rawEntries.map(parseEntry).filter((p: any) => p.title);

    return new Response(
      JSON.stringify({
        success: true,
        mode: 'feed',
        blogTitle,
        totalPosts: posts.length,
        posts,
      }),
      { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Internal error processing Blogspot import' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  }
};

