/**
 * Media Embed Utilities for Loneitu
 * Enables embedding YouTube videos, YouTube Shorts, and Instagram Reels
 * into the Post Canvas and presenting them seamlessly on the Homepage.
 */

export type MediaType = 'youtube' | 'youtube_shorts' | 'instagram_reel' | 'instagram_post';

export interface ParsedMedia {
  type: MediaType;
  id: string;
  embedUrl: string;
  thumbnailUrl?: string;
  label: string;
  aspectRatio: '16/9' | '9/16' | '1/1';
}

/**
 * Parses user-provided URLs to detect YouTube or Instagram Reels links.
 */
export function parseMediaUrl(inputUrl?: string | null): ParsedMedia | null {
  if (!inputUrl || typeof inputUrl !== 'string') return null;
  const url = inputUrl.trim();

  // 1. YouTube Shorts: https://(www.)youtube.com/shorts/{id}
  const ytShortsMatch = url.match(/(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i);
  if (ytShortsMatch) {
    const id = ytShortsMatch[1];
    return {
      type: 'youtube_shorts',
      id,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
      thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
      label: 'YouTube Shorts',
      aspectRatio: '9/16',
    };
  }

  // 2. Standard YouTube / youtu.be / embed:
  // e.g. https://www.youtube.com/watch?v={id}, https://youtu.be/{id}, https://youtube.com/embed/{id}
  const ytStandardMatch = url.match(
    /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
  );
  if (ytStandardMatch) {
    const id = ytStandardMatch[1];
    return {
      type: 'youtube',
      id,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
      thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
      label: 'YouTube Video',
      aspectRatio: '16/9',
    };
  }

  // 3. Instagram Reels: https://(www.)instagram.com/reel/{shortcode}/ or /reels/{shortcode}
  const igReelMatch = url.match(
    /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:reel|reels)\/([a-zA-Z0-9_-]+)/i
  );
  if (igReelMatch) {
    const id = igReelMatch[1];
    return {
      type: 'instagram_reel',
      id,
      embedUrl: `https://www.instagram.com/reel/${id}/embed/`,
      label: 'Instagram Reel',
      aspectRatio: '9/16',
    };
  }

  // 4. Instagram Post: https://(www.)instagram.com/p/{shortcode}/
  const igPostMatch = url.match(
    /(?:https?:\/\/)?(?:www\.)?instagram\.com\/p\/([a-zA-Z0-9_-]+)/i
  );
  if (igPostMatch) {
    const id = igPostMatch[1];
    return {
      type: 'instagram_post',
      id,
      embedUrl: `https://www.instagram.com/p/${id}/embed/`,
      label: 'Instagram Post',
      aspectRatio: '1/1',
    };
  }

  return null;
}

/**
 * Generates responsive, clean HTML embed markup for the Post Canvas.
 */
export function generateMediaEmbedHtml(media: ParsedMedia, caption?: string): string {
  const cleanCaption = caption ? caption.trim() : '';
  const figcaptionHtml = cleanCaption
    ? `<figcaption style="text-align: center; font-size: 12px; color: #8f7855; margin-top: 8px; font-style: italic;">${cleanCaption}</figcaption>`
    : '';

  if (media.type === 'youtube_shorts') {
    return `
<figure class="media-embed media-youtube-shorts" data-media-type="youtube_shorts" data-media-id="${media.id}" contenteditable="false" style="margin: 28px 0; display: block; text-align: center; clear: both;">
  <div style="position: relative; width: 100%; max-width: 380px; aspect-ratio: 9/16; margin: 0 auto; border-radius: 16px; overflow: hidden; border: 1px solid #ddd4bc; background: #000; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
    <iframe
      src="${media.embedUrl}"
      title="${cleanCaption || 'YouTube Shorts video player'}"
      style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
      loading="lazy"
    ></iframe>
  </div>
  ${figcaptionHtml}
</figure>
<p><br /></p>
`;
  }

  if (media.type === 'youtube') {
    return `
<figure class="media-embed media-youtube" data-media-type="youtube" data-media-id="${media.id}" contenteditable="false" style="margin: 28px 0; display: block; text-align: center; clear: both;">
  <div style="position: relative; width: 100%; max-width: 800px; aspect-ratio: 16/9; margin: 0 auto; border-radius: 16px; overflow: hidden; border: 1px solid #ddd4bc; background: #000; box-shadow: 0 4px 12px rgba(0,0,0,0.12);">
    <iframe
      src="${media.embedUrl}"
      title="${cleanCaption || 'YouTube video player'}"
      style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
      loading="lazy"
    ></iframe>
  </div>
  ${figcaptionHtml}
</figure>
<p><br /></p>
`;
  }

  // Instagram Reel or Post
  return `
<figure class="media-embed media-instagram" data-media-type="${media.type}" data-media-id="${media.id}" contenteditable="false" style="margin: 28px 0; display: flex; flex-direction: column; align-items: center; justify-content: center; clear: both;">
  <div style="width: 100%; max-width: 440px; height: 620px; border-radius: 16px; overflow: hidden; border: 1px solid #ddd4bc; background: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <iframe
      src="${media.embedUrl}"
      title="${cleanCaption || 'Instagram Reel'}"
      style="width: 100%; height: 100%; border: 0; overflow: hidden;"
      scrolling="no"
      allowtransparency="true"
      allowfullscreen
      loading="lazy"
    ></iframe>
  </div>
  ${figcaptionHtml}
</figure>
<p><br /></p>
`;
}

/**
 * Extracts the first embedded media (YouTube / Instagram Reel) from article content or coverImage.
 */
export function extractMediaFromContent(content?: string): ParsedMedia | null {
  if (!content || typeof content !== 'string') return null;

  // Check for explicit data-media attributes
  const typeMatch = content.match(/data-media-type="([^"]+)"/i);
  const idMatch = content.match(/data-media-id="([^"]+)"/i);
  if (typeMatch && idMatch) {
    const rawType = typeMatch[1];
    const id = idMatch[1];
    if (rawType === 'youtube_shorts') {
      return {
        type: 'youtube_shorts',
        id,
        embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
        thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
        label: 'YouTube Shorts',
        aspectRatio: '9/16',
      };
    }
    if (rawType === 'youtube') {
      return {
        type: 'youtube',
        id,
        embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
        thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
        label: 'YouTube Video',
        aspectRatio: '16/9',
      };
    }
    if (rawType === 'instagram_reel') {
      return {
        type: 'instagram_reel',
        id,
        embedUrl: `https://www.instagram.com/reel/${id}/embed/`,
        label: 'Instagram Reel',
        aspectRatio: '9/16',
      };
    }
  }

  // Check for YouTube iframe embed src
  const ytEmbedMatch = content.match(/(?:youtube(?:-nocookie)?\.com\/embed\/)([a-zA-Z0-9_-]{11})/i);
  if (ytEmbedMatch) {
    const id = ytEmbedMatch[1];
    return {
      type: 'youtube',
      id,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
      thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
      label: 'YouTube Video',
      aspectRatio: '16/9',
    };
  }

  // Check for Instagram iframe embed src
  const igEmbedMatch = content.match(/instagram\.com\/(?:reel|reels)\/([a-zA-Z0-9_-]+)/i);
  if (igEmbedMatch) {
    const id = igEmbedMatch[1];
    return {
      type: 'instagram_reel',
      id,
      embedUrl: `https://www.instagram.com/reel/${id}/embed/`,
      label: 'Instagram Reel',
      aspectRatio: '9/16',
    };
  }

  // Fallback: check for raw YouTube links within the content
  const rawYtMatch = content.match(
    /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
  );
  if (rawYtMatch) {
    const id = rawYtMatch[1];
    const isShorts = rawYtMatch[0].includes('/shorts/');
    return {
      type: isShorts ? 'youtube_shorts' : 'youtube',
      id,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
      thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
      label: isShorts ? 'YouTube Shorts' : 'YouTube Video',
      aspectRatio: isShorts ? '9/16' : '16/9',
    };
  }

  return null;
}

/**
 * Returns media badge metadata for article cards on Homepage and listings.
 */
export function getArticleMediaBadge(article: { content?: string; coverImage?: string }): {
  type: 'youtube' | 'instagram';
  label: string;
  thumbnailUrl?: string;
} | null {
  // If coverImage points to YouTube thumbnail
  if (article.coverImage && /img\.youtube\.com\/vi\/([a-zA-Z0-9_-]{11})/i.test(article.coverImage)) {
    return {
      type: 'youtube',
      label: 'YouTube Video',
      thumbnailUrl: article.coverImage,
    };
  }

  // Scan content
  const media = extractMediaFromContent(article.content);
  if (!media) return null;

  if (media.type === 'youtube' || media.type === 'youtube_shorts') {
    return {
      type: 'youtube',
      label: media.label,
      thumbnailUrl: media.thumbnailUrl,
    };
  }

  if (media.type === 'instagram_reel' || media.type === 'instagram_post') {
    return {
      type: 'instagram',
      label: media.label,
    };
  }

  return null;
}

