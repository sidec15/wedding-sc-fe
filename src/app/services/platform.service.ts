import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PlatformService {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  isMobile(): boolean {
    return this.isBrowser() && window.innerWidth <= 768;
  }

  isVisible(element: HTMLElement): boolean {
    if (!this.isBrowser()) return false; // Ensure this runs only in the browser
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Check if the element is in the viewport
    const isVisible = rect.top < windowHeight && rect.bottom > 0;

    return isVisible;
  }

}
