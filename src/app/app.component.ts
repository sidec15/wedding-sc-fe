import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { StorageService } from './services/storage.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, TranslateModule, NgIf],
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

  constructor(
    private translateService: TranslateService,
    private storageService: StorageService,
    public router: Router
  ) {
    const savedLang = this.storageService.get('language');
    const browserLang = translateService.getBrowserLang();
  
    this.currentLanguage =
      savedLang ?? (browserLang?.match(/en|it/) ? browserLang : 'it');
  
    translateService.setDefaultLang('it');
    translateService.use(this.currentLanguage);
  }

  @ViewChild('languageDropdown') languageDropdownRef!: ElementRef;

  languageDropdownOpen = false;

  toggleLanguageDropdown(): void {
    this.languageDropdownOpen = !this.languageDropdownOpen;
  }
  
  selectLanguage(lang: string): void {
    this.currentLanguage = lang;
    this.languageDropdownOpen = false; // Close the dropdown
    this.translateService.use(lang);
    localStorage.setItem('language', lang);
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (
      this.languageDropdownRef &&
      !this.languageDropdownRef.nativeElement.contains(event.target)
    ) {
      this.languageDropdownOpen = false; // Close the dropdown if clicked outside
    }
  }

  private handleSwipeGesture(): void {
    const swipeThreshold = 50; // Minimum swipe distance in pixels
    if (this.touchEndX - this.touchStartX > swipeThreshold) {
      // Swipe right: Close the menu
      this.closeMenu();
    }
  }
}
