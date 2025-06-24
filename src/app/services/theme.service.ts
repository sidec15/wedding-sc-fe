import { Injectable } from '@angular/core';
import { Theme } from '../models/theme';
import { PlatformService } from './platform.service';
import { constants } from '../constants';
import * as themeUtils from '../utils/theme.utils';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {

  private currentTheme: Theme = constants.DEFAULT_THEME;

  constructor(
    private platformService: PlatformService,
  ) {}

  getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  setCurrentTheme(theme: Theme): void {
    this.currentTheme = theme;
    themeUtils.setThemeInLocalStorage(theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: Theme): void {
    // avoid SSR crash
    if (!this.platformService.isPlatformReady()) return;

    themeUtils.applyTheme(theme);
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
