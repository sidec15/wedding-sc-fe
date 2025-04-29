import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { StorageService } from './services/storage.service';
import { isPlatformBrowser, NgClass, NgIf, NgSwitch } from '@angular/common';
import { Theme } from './models/theme';
import { PlatformService } from './services/platform.service';
import Lenis from 'lenis';
import { EventService } from './services/event.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, TranslateModule, NgIf, NgClass],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  Theme = Theme; // expose enum to template if needed

  title = 'wedding-sc-fe';
  isMenuOpen = false;
  currentYear = new Date().getFullYear();
  currentLanguage: string;
  isHeaderHidden = false; // Track whether the header is hidden
  lastScrollTop = 0; // Track the last scroll position
  currentTheme: Theme = Theme.Light;

  languageDropdownOpen = false;
  themeDropdownOpen = false;

  private lenis!: Lenis;
  private rafId = 0;

  private touchStartX = 0;
  private touchEndX = 0;

  private previousScrollYValue = 0; // Store the previous scroll Y value

  @ViewChild('languageDropdown') languageDropdownRef!: ElementRef;
  @ViewChild('themeDropdown') themeDropdownRef!: ElementRef;

  constructor(
    private translateService: TranslateService,
    private storageService: StorageService,
    public router: Router,
    private platformService: PlatformService,
    private eventService: EventService
  ) {
    const savedLang = this.storageService.get('language');
    const browserLang = translateService.getBrowserLang();

    this.currentLanguage =
      savedLang ?? (browserLang?.match(/en|it/) ? browserLang : 'it');

    translateService.setDefaultLang('it');
    translateService.use(this.currentLanguage);
  }

  ngOnInit(): void {
    const savedTheme = this.storageService.get('theme') as Theme | null;
    this.currentTheme = savedTheme ?? Theme.Light;
    this.applyTheme(this.currentTheme);
  }

  ngAfterViewInit(): void {
    if (!this.platformService.isBrowser()) return;

    this.lenis = new Lenis({
      duration: 2.5,
      // smooth: true,
    });

    const raf = (time: number) => {
      this.lenis.raf(time);

      // Get scroll position from Lenis
      const scrollY = this.lenis.scroll;

      // Emit scroll event with scroll position only if the scroll really changed
      if (Math.abs(scrollY - this.previousScrollYValue) > 0.1) {
        this.eventService.emitScrollEvent(scrollY, scrollY - this.previousScrollYValue); // Emit the scroll event
        this.previousScrollYValue = scrollY; // Update the previous scroll Y value
      }

      this.rafId = requestAnimationFrame(raf);
    };

    this.rafId = requestAnimationFrame(raf);
  }

  ngOnDestroy(): void {
    if (!this.platformService.isBrowser()) return;
    cancelAnimationFrame(this.rafId);
    this.lenis.destroy();
  }

  toggleLanguageDropdown(): void {
    this.languageDropdownOpen = !this.languageDropdownOpen;
  }

  selectLanguage(lang: string): void {
    this.currentLanguage = lang;
    this.languageDropdownOpen = false; // Close the dropdown
    this.translateService.use(lang);
    localStorage.setItem('language', lang);
  }

  toggleThemeDropdown(): void {
    this.themeDropdownOpen = !this.themeDropdownOpen;
  }

  selectTheme(theme: Theme): void {
    this.currentTheme = theme;
    this.themeDropdownOpen = false;
    this.storageService.set('theme', theme);
    this.applyTheme(theme);
  }

  applyTheme(theme: Theme): void {
    // avoid SSR crash
    if (!this.platformService.isBrowser()) return;

    let themeToApply = theme;
    if (theme === Theme.System) {
      const prefersDarkScheme = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      themeToApply = prefersDarkScheme ? Theme.Dark : Theme.Light;
    }

    document.documentElement.setAttribute('data-theme', themeToApply);
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
    if (
      this.themeDropdownRef &&
      !this.themeDropdownRef.nativeElement.contains(event.target)
    ) {
      this.themeDropdownOpen = false; // Close the dropdown if clicked outside
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const currentScroll =
      window.pageYOffset || document.documentElement.scrollTop;

    // Hide the header when scrolling down, show it when scrolling up
    if (currentScroll > this.lastScrollTop && currentScroll > 50) {
      this.isHeaderHidden = true; // Hide header
    } else {
      this.isHeaderHidden = false; // Show header
    }

    this.lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // Prevent negative scroll values
  }

  private handleSwipeGesture(): void {
    const swipeThreshold = 50; // Minimum swipe distance in pixels
    if (this.touchEndX - this.touchStartX > swipeThreshold) {
      // Swipe right: Close the menu
      this.closeMenu();
    }
  }
}
