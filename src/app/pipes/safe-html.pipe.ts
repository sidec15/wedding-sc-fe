// src/app/shared/pipes/safe-html.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import DOMPurify from 'dompurify';

@Pipe({ name: 'safeHtml', standalone: true })
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(value: string): SafeHtml {
    const clean = DOMPurify.sanitize(value ?? '', {
      USE_PROFILES: { html: true },
    });
    return this.sanitizer.bypassSecurityTrustHtml(clean);
  }
}
