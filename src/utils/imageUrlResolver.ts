/**
 * Resolves any image URL to ensure relative /api/images/* paths 
 * point directly to the active backend Worker CDN.
 */
export function resolveImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string' || !url.trim()) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('/api/images/')) {
    return `https://loneitu.ddvktp.workers.dev${trimmed}`;
  }
  return trimmed;
}

