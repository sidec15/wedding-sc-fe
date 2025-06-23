import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';

import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { constants } from './constants';
import {
  RecaptchaModule,
  RECAPTCHA_LOADER_OPTIONS,
  RecaptchaLoaderOptions,
} from 'ng-recaptcha-2';
import { detectInitialLanguage } from './utils/language.utils';

// 🔧 Loader factory for ngx-translate
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, '/i18n/', '.json');
}

// reCAPTCHA loader config
export function recaptchaLoaderConfig(): RecaptchaLoaderOptions {
  return {
    onBeforeLoad: (url: URL) => {
      const lang = detectInitialLanguage();
      url.searchParams.set('hl', lang);
      return { url };
    },
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(),
    provideAnimations(),
    {
      provide: RECAPTCHA_LOADER_OPTIONS,
      useValue: recaptchaLoaderConfig(),
    },
    importProvidersFrom(RecaptchaModule),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: constants.LANGUAGE,
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      })
    ),
  ],
};
