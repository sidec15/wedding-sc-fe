// src/app/shared/pipes/strip-html-length.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'stripHtmlLength', standalone: true })
export class StripHtmlLengthPipe implements PipeTransform {
  transform(html: string): number {
    const div = document.createElement('div');
    div.innerHTML = html || '';
    return (div.textContent || div.innerText || '').length;
  }
}
