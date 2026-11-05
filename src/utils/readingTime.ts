export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const clean = (text || '').replace(/<[^>]*>/g, ' ');
  const wordCount = clean.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, minutes);
}

