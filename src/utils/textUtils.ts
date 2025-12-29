/**
 * Clean up text containing markdown citation links from deep research API.
 *
 * The deep research API returns inline citations like:
 * - ([www.tomshardware.com](https://www.tomshardware.com/...))
 * - [source](https://example.com)
 *
 * This function removes these to produce clean, readable text.
 */
export function cleanMarkdownLinks(text: string): string {
  if (!text) return text;

  // Remove markdown links in parentheses: ([text](url)) -> ""
  // These are citation-style links that clutter the text
  let cleaned = text.replace(/\(\[([^\]]*)\]\([^)]+\)\)/g, '');

  // Remove standalone markdown links: [text](url) -> text
  // Keep the link text since it may be meaningful
  cleaned = cleaned.replace(/\[([^\]]*)\]\([^)]+\)/g, '$1');

  // Clean up any double spaces left behind
  cleaned = cleaned.replace(/\s{2,}/g, ' ');

  // Clean up spaces before punctuation
  cleaned = cleaned.replace(/\s+([.,;:!?])/g, '$1');

  // Trim whitespace
  cleaned = cleaned.trim();

  return cleaned;
}
