import { constants } from '../constants';

export function detectInitialLanguage(): string {
  const savedLang = localStorage.getItem('language');
  const browserLang = navigator.language?.slice(0, 2);

  const supportedLanguages = constants.SUPPORTED_LANGUAGES;

  let lang = constants.LANGUAGE;

  if (savedLang && supportedLanguages.includes(savedLang)) {
    lang = savedLang;
  } else if (browserLang && supportedLanguages.includes(browserLang)) {
    lang = browserLang;
  }

  console.log('Language detected:', lang);

  return lang;
}
