import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { StorageService } from './storage.service';
import { TranslateService } from '@ngx-translate/core';
import { constants } from '../constants';
import { EventService } from './event.service';
import { PlatformService } from './platform.service';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  constructor(
    private storageService: StorageService,
    private translateService: TranslateService,
    private platformService: PlatformService
  ) {}

  private currentLanguage!: string;

  init(): void {
    const savedLang = this.storageService.get('language');
    const browserLang = this.translateService.getBrowserLang();

    // Enhanced language detection with SSR support
    this.currentLanguage = this.detectLanguage(savedLang, browserLang);

    this.translateService.setDefaultLang(constants.LANGUAGE);

    // Enhanced translation loading with better error handling
    this.translateService.use(this.currentLanguage).subscribe({
      next: () => console.log(`Translation loaded for: ${this.currentLanguage}`),
      error: (err) => console.error('Translation load error:', err)
    });
  }

  private detectLanguage(savedLang: string | null, browserLang: string | undefined): string {
    // Priority: saved language > browser language > default
    if (savedLang && this.isSupportedLanguage(savedLang)) {
      return savedLang;
    }

    if (browserLang && this.isSupportedLanguage(browserLang)) {
      return browserLang;
    }

    return constants.LANGUAGE;
  }

  private isSupportedLanguage(lang: string): boolean {
    return ['en', 'it'].includes(lang);
  }

  setLanguage(lang: string): void {
    if (!this.isSupportedLanguage(lang)) {
      console.warn(`Unsupported language: ${lang}`);
      return;
    }

    this.currentLanguage = lang;

    // Only use storage in browser environment
    if (this.platformService.isBrowser()) {
      this.storageService.set('language', lang);
    }

    this.translateService.use(lang);
  }

  getLanguage(): string {
    return this.currentLanguage;
  }

  getSupportedLanguages(): string[] {
    return ['en', 'it'];
  }
}
