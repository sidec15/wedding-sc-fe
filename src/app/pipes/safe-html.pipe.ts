import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PlatformService } from '../services/platform.service'; // Adjust the path if needed
import * as securityUtils from '../utils/security.utils';

/**
 * Angular pipe that sanitizes HTML content using DOMPurify to prevent XSS attacks.
 * This version uses the shared PlatformService to ensure browser-only execution (SSR-safe),
 * and delegates the actual sanitization logic to a centralized utility method.
 *
 * Usage:
 * <p [innerHTML]="someContent | safeHtml"></p>
 */
@Pipe({
  name: 'safeHtml',
  standalone: true,
})
export class SafeHtmlPipe implements PipeTransform {
  // Angular's built-in DOM sanitizer
  private readonly sanitizer = inject(DomSanitizer);

  // Injected platform service for SSR-safe browser detection
  private readonly platformService = inject(PlatformService);

  /**
   * Transforms the input HTML string into a safe, trusted version
   * that can be rendered via Angular's [innerHTML] without XSS risk.
   *
   * @param value - Raw HTML string (e.g., from translations or card descriptions)
   * @returns A SafeHtml instance for use with [innerHTML]
   */
  transform(value: string): SafeHtml {
    if (!value) return '';

    // Ensure DOMPurify runs only in the browser (avoids SSR issues)
    if (!this.platformService.isBrowser()) {
      // During SSR, Angular doesn't render [innerHTML], so we return raw string
      return value;
    }

    // Use shared utility to sanitize trusted content (e.g. translation strings)
    const clean = securityUtils.sanitizeHtml(value, 'trusted-content');

    // Angular requires that [innerHTML] receives a "trusted" HTML object
    return this.sanitizer.bypassSecurityTrustHtml(clean);
  }
}
