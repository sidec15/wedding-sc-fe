import { Component, ElementRef, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Theme } from '../../models/theme';
import { EventService, MenuEvent } from '../../services/event.service';
import { HeaderService } from '../../services/header.service';
import { MenuService } from '../../services/menu.service';
import { PlatformService } from '../../services/platform.service';
import { ThemeService } from '../../services/theme.service';
import { LanguageService } from '../../services/language.service';
import { NgClass, NgStyle } from '@angular/common';
import { RouterModule } from '@angular/router';
import { constants } from '../../constants';

@Component({
  selector: 'app-header',
  imports: [TranslateModule, RouterModule, NgClass, NgStyle],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  Theme = Theme; // expose enum to template if needed

  languageDropdownOpen = false;
  themeDropdownOpen = false;

  private menuSub!: Subscription;
  private headerBgSub!: Subscription;

  @ViewChild('languageDropdown', { static: false })
  languageDropdownRef!: ElementRef;
  @ViewChild('themeDropdown', { static: false }) themeDropdownRef!: ElementRef;
  @ViewChild('navLinks', { static: false }) navRef!: ElementRef<HTMLElement>;

  isHeaderFilled = constants.IS_HEADER_FILLED; // Track if the header background is filled

  private documentClickListener?: (event: MouseEvent) => void;

  // --- Swipe up to close menu logic ---
  private touchStartY: number | null = null;
  private touchEndY: number | null = null;
  private swipeListenerAdded = false;
  private swipeUpThreshold = 60;

  constructor(
    private platformService: PlatformService,
    private eventService: EventService,
    private headerService: HeaderService,
    private menuService: MenuService,
    private themeService: ThemeService,
    private languageService: LanguageService
  ) {}

  ngAfterViewInit(): void {
    if (!this.platformService.isPlatformReady()) return;

    this.headerService.init(); // Initialize header service

    this.menuSub = this.eventService.menuEvent$.subscribe((event) => {
      this.onMenuEvent(event); // Handle menu events
    });

    this.headerBgSub = this.eventService.headerBackgroundSubject$.subscribe(
      (e) => {
        this.isHeaderFilled = e.fillBackground; // Update header background state
      }
    );

    // Attach swipe listener if menu is open on mobile
    if (this.isMobile && this.isMenuOpen) {
      this.addSwipeListener();
    }
  }

  ngOnDestroy(): void {
    this.menuSub?.unsubscribe(); // Unsubscribe from menu events
    this.headerBgSub?.unsubscribe(); // Unsubscribe from header background events
    this.headerService.destroy(); // Clean up header service
    this.removeDocumentClickListener();
    this.removeSwipeListener();
  }

  get isMobile(): boolean {
    return this.platformService.isMobile(); // Check if the platform is mobile
  }

  get navBackground(): string {
    if (this.themeService.getCurrentTheme() === Theme.Dark) {
      return 'url("/images/mobile-menu/bg-02.png")';
    }
    return 'url("/images/mobile-menu/bg-01.png")';
  }

  get isMenuOpen(): boolean {
    return this.menuService.isMenuOpened(); // Check if the menu is open using MenuService
  }

  get isHeaderHidden(): boolean {
    return this.headerService.isHeaderHidden; // Get header visibility state from HeaderService
  }

  get currentTheme(): Theme {
    return this.themeService.getCurrentTheme(); // Get current theme from ThemeService
  }

  toggleLanguageDropdown(): void {
    this.languageDropdownOpen = !this.languageDropdownOpen;
    if (this.languageDropdownOpen) {
      this.addDocumentClickListener('language');
    } else {
      this.removeDocumentClickListener();
    }
  }

  selectLanguage(lang: string): void {
    this.languageDropdownOpen = false;
    this.languageService.setLanguage(lang); // Update language in LanguageService
  }

  toggleThemeDropdown(): void {
    this.themeDropdownOpen = !this.themeDropdownOpen;
    if (this.themeDropdownOpen) {
      this.addDocumentClickListener('theme');
    } else {
      this.removeDocumentClickListener();
    }
  }

  selectTheme(theme: Theme): void {
    this.themeService.setCurrentTheme(theme); // Update theme in ThemeService
    this.themeDropdownOpen = false;
  }

  toggleMenu(): void {
    if (!this.navRef?.nativeElement) return; // Ensure navRef is defined

    this.menuService.toggleMenu(); // Toggle the menu using MenuService
  }

  private setBodyScrollLock(lock: boolean) {
    if (this.isMobile) {
      document.body.style.overflow = lock ? 'hidden' : '';
      document.body.style.touchAction = lock ? 'none' : '';
    }
  }

  private onMenuEvent(event: MenuEvent): void {
    if (!this.navRef?.nativeElement) return; // Ensure navRef is defined

    const nav = this.navRef.nativeElement;

    if (event.status === 'closeStart') {
      nav.classList.remove('open');
      nav.classList.add('closing');
      this.removeSwipeListener();
    } else if (event.status === 'closeEnd') {
      nav.classList.remove('closing');
      this.setBodyScrollLock(false);
    } else if (event.status === 'openStart') {
      this.setBodyScrollLock(true);
      this.addSwipeListener();
    }
  }

  private addDocumentClickListener(type: 'language' | 'theme') {
    this.removeDocumentClickListener();
    this.documentClickListener = (event: MouseEvent) => {
      const dropdownRef = type === 'language' ? this.languageDropdownRef : this.themeDropdownRef;
      if (dropdownRef && !dropdownRef.nativeElement.contains(event.target)) {
        if (type === 'language') this.languageDropdownOpen = false;
        if (type === 'theme') this.themeDropdownOpen = false;
        this.removeDocumentClickListener();
      }
    };
    document.addEventListener('click', this.documentClickListener, true);
  }

  private removeDocumentClickListener() {
    if (this.documentClickListener) {
      document.removeEventListener('click', this.documentClickListener, true);
      this.documentClickListener = undefined;
    }
  }

  // --- Swipe up to close menu logic ---
  private onTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      this.touchStartY = e.touches[0].clientY;
    }
  };

  private onTouchEnd = (e: TouchEvent) => {
    if (this.touchStartY !== null && e.changedTouches.length === 1) {
      this.touchEndY = e.changedTouches[0].clientY;
      const deltaY = this.touchStartY - this.touchEndY;
      if (deltaY > this.swipeUpThreshold) { // swipe up threshold
        this.menuService.toggleMenu();
      }
    }
    this.touchStartY = null;
    this.touchEndY = null;
  };

  private addSwipeListener() {
    if (this.swipeListenerAdded || !this.navRef?.nativeElement) return;
    const nav = this.navRef.nativeElement;
    nav.addEventListener('touchstart', this.onTouchStart, { passive: true });
    nav.addEventListener('touchend', this.onTouchEnd, { passive: true });
    this.swipeListenerAdded = true;
  }

  private removeSwipeListener() {
    if (!this.swipeListenerAdded || !this.navRef?.nativeElement) return;
    const nav = this.navRef.nativeElement;
    nav.removeEventListener('touchstart', this.onTouchStart);
    nav.removeEventListener('touchend', this.onTouchEnd);
    this.swipeListenerAdded = false;
  }
}
