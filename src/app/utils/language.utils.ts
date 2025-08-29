import { constants } from '../constants';

export function detectInitialLanguage(): string {
  const savedLang = localStorage.getItem('language');
  const browserLang = navigator.language?.slice(0, 2);

  const supportedLanguages = constants.SUPPORTED_LANGUAGES;

  let lang = constants.LANGUAGE;

  // console.log(
  //   '[detectInitialLanguage] Default language from constants:',
  //   constants.LANGUAGE
  // );
  // console.log(
  //   '[detectInitialLanguage] Saved language in localStorage:',
  //   savedLang
  // );
  // console.log('navigator.language:', navigator.language);
  // console.log('navigator.languages:', navigator.languages);

  // console.log('[detectInitialLanguage] Browser language:', browserLang);
  // console.log(
  //   '[detectInitialLanguage] Supported languages:',
  //   supportedLanguages
  // );

  if (savedLang && supportedLanguages.includes(savedLang)) {
    // console.log('[detectInitialLanguage] Using saved language:', savedLang);
    lang = savedLang;
  } else if (browserLang && supportedLanguages.includes(browserLang)) {
    // console.log('[detectInitialLanguage] Using browser language:', browserLang);
    lang = browserLang;
  } else {
    // console.log(
    //   '[detectInitialLanguage] Falling back to default language:',
    //   constants.LANGUAGE
    // );
  }

  // console.log('[detectInitialLanguage] Final detected language:', lang);

  return lang;
}
