/**
 * Utility to convert between Markdown and rich HTML for Loneitu's Post Canvas
 */

import { parseMediaUrl, generateMediaEmbedHtml } from './mediaEmbed';

export function markdownToHtml(md: string): string {
  if (!md) return '';

  // If already full HTML without markdown symbols, return directly
  if (/<(p|h[1-6]|ul|ol|blockquote|div|table|strong|em|img)\b/i.test(md) && !/^(##|\*\*|> |- |\d+\. )/m.test(md)) {
    return md;
  }

  let html = md;

  // 1. Tables (Markdown GFM table to HTML table)
  html = html.replace(/(?:^|\n)(\|.+?\|\n\|[-: |]+?\|\n(?:\|.+?\|\n?)+)/g, (match, tableText) => {
    const lines = tableText.trim().split('\n');
    if (lines.length < 2) return match;
    const parseRow = (line: string) =>
      line
        .replace(/^\||\|$/g, '')
        .split('|')
        .map(c => c.trim());

    const headers = parseRow(lines[0]);
    const rows = lines.slice(2).map(parseRow);

    const thead = `<thead><tr>${headers.map((h: string) => `<th style="border: 1px solid #ddd4bc; padding: 10px 14px; background: #faf8f3; font-weight: bold; text-align: left; color: #143520;">${h}</th>`).join('')}</tr></thead>`;
    const tbody = `<tbody>${rows.map((r: string[]) => `<tr>${r.map((c: string) => `<td style="border: 1px solid #ddd4bc; padding: 8px 12px; color: #3b2e1d;">${c}</td>`).join('')}</tr>`).join('')}</tbody>`;

    return `\n<table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #ddd4bc; border-radius: 12px; overflow: hidden;">${thead}${tbody}</table>\n`;
  });

  // 2. Code blocks (```lang ... ```)
  html = html.replace(/```([a-z0-9_-]*)\n([\s\S]*?)```/gi, (_, _lang, code) => {
    return `<pre style="background: #143520; color: #fbfbf8; padding: 16px; border-radius: 12px; overflow-x: auto; font-family: monospace; font-size: 13px; margin: 16px 0;"><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
  });

  // 3. Inline code (`code`)
  html = html.replace(/`([^`]+)`/g, '<code style="background: #f6f4eb; color: #143520; padding: 2px 6px; border-radius: 6px; font-family: monospace; font-size: 13px; font-weight: 600;">$1</code>');

  // 4. Images: ![alt](url)
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; border-radius: 16px; margin: 20px 0; border: 1px solid #ddd4bc; display: block;" />');

  // 5. Links: [text](url)
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #256b3a; text-decoration: underline; font-weight: 600;">$1</a>');

  // 6. Blockquotes: > line
  html = html.replace(/^(?:> (.*)(?:\n|$))+/gm, match => {
    const quoteContent = match
      .split('\n')
      .map(l => l.replace(/^>\s?/, ''))
      .join('<br />');
    return `<blockquote style="border-left: 4px solid #256b3a; padding: 12px 18px; margin: 20px 0; background: #f6f4eb; border-radius: 0 12px 12px 0; color: #3b2e1d; font-style: italic;">${quoteContent}</blockquote>`;
  });

  // 7. Headings:
  html = html.replace(/^### (.*$)/gm, '<h3 style="font-size: 1.25rem; font-weight: 700; color: #143520; margin-top: 24px; margin-bottom: 8px;">$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2 style="font-size: 1.5rem; font-weight: 700; color: #143520; margin-top: 28px; margin-bottom: 12px;">$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1 style="font-size: 1.875rem; font-weight: 800; color: #143520; margin-top: 32px; margin-bottom: 16px;">$1</h1>');

  // 8. Horizontal rules: --- or ***
  html = html.replace(/^(?:---|\*\*\*|___)\s*$/gm, '<hr style="border: none; border-top: 1px solid #ddd4bc; margin: 24px 0;" />');

  // 9. Bold & Italic:
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_\n]+)_/g, '<em>$1</em>');
  html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');

  // 10. Unordered Lists:
  html = html.replace(/^(?:[-*] (.*)(?:\n|$))+/gm, match => {
    const items = match
      .trim()
      .split('\n')
      .map(l => `<li>${l.replace(/^[-*]\s+/, '')}</li>`)
      .join('');
    return `<ul style="list-style-type: disc; padding-left: 24px; margin: 14px 0;">${items}</ul>`;
  });

  // 11. Ordered Lists:
  html = html.replace(/^(?:\d+\. (.*)(?:\n|$))+/gm, match => {
    const items = match
      .trim()
      .split('\n')
      .map(l => `<li>${l.replace(/^\d+\.\s+/, '')}</li>`)
      .join('');
    return `<ol style="list-style-type: decimal; padding-left: 24px; margin: 14px 0;">${items}</ol>`;
  });

  // 12. Paragraphs: split by double newlines, wrap in <p> if not already wrapped in a block tag
  const blocks = html.split(/\n\s*\n/);
  const formattedBlocks = blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    const parsedMedia = parseMediaUrl(trimmed);
    if (parsedMedia) {
      return generateMediaEmbedHtml(parsedMedia);
    }
    if (/^<(h[1-6]|ul|ol|blockquote|table|pre|hr|div|p|figure)\b/i.test(trimmed)) {
      return trimmed;
    }
    return `<p style="margin-bottom: 16px; line-height: 1.75;">${trimmed.replace(/\n/g, '<br />')}</p>`;
  });

  return formattedBlocks.filter(Boolean).join('\n\n');
}
