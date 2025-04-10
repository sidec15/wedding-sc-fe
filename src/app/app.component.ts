import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TranslateModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'wedding-sc-fe';
  isMenuOpen = false;
  currentYear = new Date().getFullYear();
  currentLanguage: string;

  private touchStartX = 0;
  private touchEndX = 0;

  constructor(private translateService: TranslateService) {
    // Get the saved language from localStorage or default to 'it'
    const savedLanguage = localStorage.getItem('language') || 'it';
    this.currentLanguage = savedLanguage;

    // Set the language in the translation service
    this.translateService.setDefaultLang('it');
    this.translateService.use(savedLanguage);
  }

  onLanguageChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const language = select.value;
    this.currentLanguage = language;
    this.translateService.use(language);
    // Save the user's choice in localStorage
    localStorage.setItem('language', language);
    this.currentLanguage = language;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  openMenu(): void {
    this.isMenuOpen = true;
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipeGesture();
  }

  private handleSwipeGesture(): void {
    const swipeThreshold = 50; // Minimum swipe distance in pixels
    if (this.touchEndX - this.touchStartX > swipeThreshold) {
      // Swipe right: Close the menu
      this.closeMenu();
    }
  }
}
