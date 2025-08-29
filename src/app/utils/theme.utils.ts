import { constants } from '../constants';
import { Theme } from '../models/theme';

export function getTheme() {
  const userTheme = getThemeFromLocalStorage();
  const theme = userTheme || constants.DEFAULT_THEME;
  return theme;
}

function getThemeFromLocalStorage() {
  const userTheme = localStorage.getItem(constants.THEME_KEY) as Theme | null;
  if (userTheme && Object.values(Theme).includes(userTheme)) {
    return userTheme;
  }
  return constants.DEFAULT_THEME;
};

export function setThemeInLocalStorage(theme: Theme) {
  if (Object.values(Theme).includes(theme)) {
    localStorage.setItem(constants.THEME_KEY, theme);
  }
};

export function applyTheme(theme: Theme) {
  let themeToApply = theme;
  if (theme === Theme.System) {
    const prefersDarkScheme = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    themeToApply = prefersDarkScheme ? Theme.Dark : Theme.Light;
  }

  document.documentElement.setAttribute('data-theme', themeToApply);
};
