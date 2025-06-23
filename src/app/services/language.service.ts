import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { TranslateService } from '@ngx-translate/core';
import { constants } from '../constants';
import { PlatformService } from './platform.service';
import { detectInitialLanguage } from '../utils/language.utils';
import { EventService } from './event.service';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  constructor(
    private storageService: StorageService,
    private translateService: TranslateService,
    private platformService: PlatformService,
    private eventService: EventService
  ) {}

  private currentLanguage!: string;

  init(): void {

    // Enhanced language detection with SSR support
    this.currentLanguage = detectInitialLanguage();

    this.translateService.setDefaultLang(constants.LANGUAGE);

    // Enhanced translation loading with better error handling
    this.translateService.use(this.currentLanguage).subscribe({
      next: () => console.log(`Translation loaded for: ${this.currentLanguage}`),
      error: (err) => console.error('Translation load error:', err)
    });
  }

  private isSupportedLanguage(lang: string): boolean {
    return constants.SUPPORTED_LANGUAGES.includes(lang);
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
    this.eventService.emitLanguageChanged(lang);
  }

  getLanguage(): string {
    return this.currentLanguage;
  }

  getSupportedLanguages(): string[] {
    return ['en', 'it'];
  }
}
