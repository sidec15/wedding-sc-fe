import { Injectable } from '@angular/core';
import { Theme } from '../models/theme';
import { PlatformService } from './platform.service';
import { constants } from '../constants';
import { EventService, ThemeMessage } from './event.service';
import { StorageService } from './storage.service';
import * as themeUtils from '../utils/theme.utils';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private currentTheme: Theme = constants.DEFAULT_THEME;

  constructor(
    private platformService: PlatformService,
    private storageService: StorageService,
    private eventService: EventService
  ) {}

  getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  getCurrentThemeToApply(): Theme {
    return this.getThemeToApply(this.getCurrentTheme());
  }

  private getThemeToApply(theme: Theme) {
    let themeToApply = theme;
    if (theme === Theme.System) {
      const prefersDarkScheme = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      themeToApply = prefersDarkScheme ? Theme.Dark : Theme.Light;
      themeToApply;
    }
    return themeToApply;
  }

  setCurrentTheme(theme: Theme): void {
    this.currentTheme = theme;
    this.storageService.set('theme', theme);
    const themeToApply = this.applyTheme(this.currentTheme);
    this.eventService.emitThemeChange({
      theme: themeToApply,
    } as ThemeMessage);
  }

  private applyTheme(theme: Theme) {
    // avoid SSR crash
    if (!this.platformService.isPlatformReady()) return;

    let themeToApply = this.getThemeToApply(theme);

    document.documentElement.setAttribute('data-theme', themeToApply);

    return themeToApply;
  }

  /**
   * Initialize theme from localStorage or use system as default.
   */
  initTheme(): void {
    if (!this.platformService.isPlatformReady()) return;
    const theme = themeUtils.getTheme();
    this.setCurrentTheme(theme);
  }
}
