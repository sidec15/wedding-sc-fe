import { Injectable } from '@angular/core';
import { Theme } from '../models/theme';
import { PlatformService } from './platform.service';
import { StorageService } from './storage.service';
import { constants } from '../constants';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {

  private currentTheme: Theme = constants.DEFAULT_THEME;

  constructor(
    private platformService: PlatformService,
    private storageService: StorageService
  ) {}

  getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  setCurrentTheme(theme: Theme): void {
    this.currentTheme = theme;
    this.storageService.set('theme', theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: Theme): void {
    // avoid SSR crash
    if (!this.platformService.isPlatformReady()) return;

    let themeToApply = theme;
    if (theme === Theme.System) {
      const prefersDarkScheme = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      themeToApply = prefersDarkScheme ? Theme.Dark : Theme.Light;
    }

    document.documentElement.setAttribute('data-theme', themeToApply);
  }

  /**
   * Initialize theme from localStorage or use system as default.
   */
  initTheme(): void {
    if (!this.platformService.isPlatformReady()) return;
    const stored = this.storageService.get('theme') as Theme | null;
    if (stored && Object.values(Theme).includes(stored)) {
      this.setCurrentTheme(stored);
    } else {
      this.setCurrentTheme(constants.DEFAULT_THEME);
    }
  }
}
