/**
 * Utility functions for sharing articles across WhatsApp, Twitter, LinkedIn, and Clipboard
 */

export function cleanTextExcerpt(text?: string, maxLength = 160): string {
  if (!text) return '';
  const cleaned = text
    .replace(/!\[.*?\]\(.*?\)/g, '') // remove images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // remove links
    .replace(/[#*`_~>[\]]/g, '') // remove markdown symbols
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
