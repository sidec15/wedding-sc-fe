import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  constructor(
    private storageService: StorageService,
    private translateService: TranslateService
  ) {}

  private currentLanguage!: string;

  init(): void {
    const savedLang = this.storageService.get('language');
    const browserLang = this.translateService.getBrowserLang();

    this.currentLanguage =
      savedLang ?? (browserLang?.match(/en|it/) ? browserLang : 'it');

    this.translateService.setDefaultLang('it');
    this.translateService.use(this.currentLanguage);
  }

  setLanguage(lang: string): void {
    this.currentLanguage = lang;
    this.storageService.set('language', lang);
    this.translateService.use(lang);
  }

  getLanguage(): string {
    return this.currentLanguage;
  }

}
