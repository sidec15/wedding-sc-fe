import DOMPurify from 'dompurify';

/**
 * Context in which HTML sanitization is applied:
 * - 'user-input': from untrusted users (strict)
 * - 'trusted-content': from static files (e.g., translations) with safe links
 */
export type SanitizationContext = 'user-input' | 'trusted-content';

/**
 * Sanitize input HTML according to the specified context.
 * Automatically applies link safety hooks in trusted content.
 *
 * @param input - raw HTML string to sanitize
 * @param context - sanitization context (default: 'user-input')
 * @returns sanitized string safe to render with innerHTML
 */
export function sanitizeHtml(
  input: string,
  context: SanitizationContext = 'user-input'
): string {
  const html = input ?? '';

  // Define default rules
  const config: Parameters<typeof DOMPurify.sanitize>[1] = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 's', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
  };

  // Extend rules for trusted system content
  if (context === 'trusted-content') {
    config.ALLOWED_TAGS = [...config.ALLOWED_TAGS!, 'a'];
    config.ALLOWED_ATTR = ['href', 'target', 'rel'];

    // Hook for safe <a> behavior (added only once per runtime)
    if (typeof window !== 'undefined' && !hookInitialized) {
      DOMPurify.addHook('afterSanitizeAttributes', (node) => {
        if (node.tagName === 'A') {
          const href = node.getAttribute('href') || '';
          const safe =
            href.startsWith('http://') || href.startsWith('https://');
          if (!safe) {
            node.removeAttribute('href');
          } else {
            node.setAttribute('target', '_blank');
            node.setAttribute('rel', 'noopener noreferrer');
          }
        }
      });
      hookInitialized = true;
    }
  }

  return DOMPurify.sanitize(html, config);
}

// Prevent duplicate hook registration (especially in Angular SSR + hydration)
let hookInitialized = false;
