import { Injectable } from '@angular/core';
import { Theme } from '../models/theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private currentTheme: Theme = Theme.Light;

  constructor() {}

  getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  setCurrentTheme(theme: Theme): void {
    this.currentTheme = theme;
  }
}
