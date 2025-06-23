import { constants } from '../constants';

export function detectInitialLanguage(): string {
  const savedLang = localStorage.getItem('language');
  const browserLang = navigator.language?.slice(0, 2);

  const supportedLanguages = constants.SUPPORTED_LANGUAGES;

  if (savedLang && supportedLanguages.includes(savedLang)) {
    return savedLang;
  }

  if (browserLang && supportedLanguages.includes(browserLang)) {
    return browserLang;
  }

  return constants.LANGUAGE;
}
