/**
 * Utility functions for sharing articles across WhatsApp, Twitter, LinkedIn, and Clipboard
 */

export function cleanTextExcerpt(text?: string, maxLength = 160): string {
  if (!text) return '';
  const cleaned = text
    // 1. Remove script and style tags and content
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    // 2. Decode HTML entities
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    // 3. Remove all standard HTML tags (anything between < and >)
    .replace(/<[^>]+>/g, ' ')
    // 4. Remove markdown links and images
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // 5. Remove markdown formatting markers
    .replace(/[#*`_~[\]]/g, '')
    // 6. Specifically remove any leading/trailing dangling <div, </div, <p, etc. without consuming other text
    .replace(/^<\/?(?:div|p|span|section|article|h[1-6]|header|footer)\b(?:\s+class="[^"]*"|\s+style="[^"]*")?\s*/i, '')
    .replace(/^<[a-zA-Z1-6]+\b\s*/i, '')
    .replace(/<\/?(?:div|p|span|section|article|h[1-6]|header|footer)\b(?:\s+class="[^"]*"|\s+style="[^"]*")?\s*$/i, '')
    // 7. Remove any leftover isolated < or >
    .replace(/[<>]/g, '')
    // 8. Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();

  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.substring(0, maxLength - 3).trim() + '...';
}

export function createWhatsAppShareUrl(title: string, excerpt?: string, url?: string): string {
  const articleUrl = url || window.location.href;
  const excerptText = cleanTextExcerpt(excerpt, 150);

  const messageParts = [
    `*${title}*`,
    excerptText ? `\n${excerptText}` : '',
    `\nChhiar chhunzawmna: ${articleUrl}`,
  ].filter(Boolean);

  const fullMessage = messageParts.join('\n');
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(fullMessage)}`;
}

export function shareToWhatsApp(title: string, excerpt?: string, url?: string) {
  const shareUrl = createWhatsAppShareUrl(title, excerpt, url);
  window.open(shareUrl, '_blank', 'noopener,noreferrer');
}

export function shareToFacebook(url?: string) {
  const articleUrl = url || window.location.href;
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`, '_blank', 'noopener,noreferrer');
}

export function shareToTwitter(title: string, url?: string) {
  const articleUrl = url || window.location.href;
  const text = encodeURIComponent(`Insightful agronomy read: "${title}" via Loneitu (MIZORAM TAN):`);
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(articleUrl)}`, '_blank', 'noopener,noreferrer');
}

export function shareToLinkedIn(url?: string) {
  const articleUrl = url || window.location.href;
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`, '_blank', 'noopener,noreferrer');
}

export async function copyArticleLink(url?: string): Promise<boolean> {
  const articleUrl = url || window.location.href;
  try {
    await navigator.clipboard.writeText(articleUrl);
    return true;
  } catch {
    return false;
  }
}

