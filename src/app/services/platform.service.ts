import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

/**
 * PlatformService provides utilities to detect the current platform (browser, mobile, desktop),
 * check element visibility, and expose platform-specific logic for Angular applications.
 *
 * This service is injectable and available app-wide as a singleton.
 */
@Injectable({
  providedIn: 'root',
})
export class PlatformService {
  /**
   * Constructs the PlatformService.
   * @param platformId The Angular platform ID, injected for SSR/browser detection.
   */
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  /**
   * Returns true if the code is running in a browser environment.
   */
  isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Returns true if the platform is ready for browser-specific operations.
   * Currently, this is equivalent to isBrowser().
   */
  isPlatformReady(): boolean {
    return this.isBrowser();
  }

  /**
   * Returns true if the current device is considered mobile (width <= 768px).
   * Only returns true in a browser environment.
   */
  isMobile(): boolean {
    return this.isBrowser() && window.innerWidth <= 768;
  }

  /**
   * Checks if a given HTMLElement is visible in the current viewport.
   * @param element The HTMLElement to check.
   * @returns True if any part of the element is visible in the viewport.
   */
  isVisible(element: HTMLElement): boolean {
    if (!this.isBrowser()) return false; // Ensure this runs only in the browser
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    // An element is considered visible if it is within the viewport bounds
    const isVisible = rect.top < windowHeight && rect.bottom > 0;
    return isVisible;
  }

  positionYInViewport(
    element: HTMLElement
  ): 'visible' | 'above' | 'below' {
    if (!this.isBrowser()) return 'visible'; // Ensure this runs only in the browser
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    if (rect.bottom < 0) {
      return 'above'; // Element is above the viewport
    } else if (rect.top > windowHeight) {
      return 'below'; // Element is below the viewport
    } else {
      return 'visible'; // Element is within the viewport
    }
  }

  /**
   * Returns the current platform type (Mobile or Desktop) based on window width.
   */
  getPlatform(): PlatformType {
    if (this.isMobile()) {
      return PlatformType.Mobile;
    } else {
      return PlatformType.Desktop;
    }
  }
}

/**
 * Enum representing the possible platform types.
 */
export enum PlatformType {
  Desktop = 'desktop',
  Mobile = 'mobile',
}
