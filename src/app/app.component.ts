import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { StorageService } from './services/storage.service';
import { NgClass, NgIf, NgStyle } from '@angular/common';
import { Theme } from './models/theme';
import { PlatformService } from './services/platform.service';
import { EventService, MenuEvent } from './services/event.service';
import { Subscription } from 'rxjs';
import { ScrollManagerService } from './services/scroll-manager.service';
import { HeaderService } from './services/header.service';
import { MenuService } from './services/menu.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, TranslateModule, NgIf, NgClass, NgStyle],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  Theme = Theme; // expose enum to template if needed

  title = 'wedding-sc-fe';

  currentYear = new Date().getFullYear();
  currentLanguage: string;
  currentTheme: Theme = Theme.Light;
  isMobile = false;

  languageDropdownOpen = false;
  themeDropdownOpen = false;

  private menuSub!: Subscription;

  @ViewChild('languageDropdown', { static: false })
  languageDropdownRef!: ElementRef;
  @ViewChild('themeDropdown', { static: false }) themeDropdownRef!: ElementRef;
  @ViewChild('navLinks', { static: false }) navRef!: ElementRef<HTMLElement>;

  constructor(
    private translateService: TranslateService,
    private storageService: StorageService,
    public router: Router,
    private platformService: PlatformService,
    private eventService: EventService,
    private scrollManager: ScrollManagerService,
    private headerService: HeaderService,
    private menuService: MenuService
  ) {
    const savedLang = this.storageService.get('language');
    const browserLang = translateService.getBrowserLang();

    this.currentLanguage =
      savedLang ?? (browserLang?.match(/en|it/) ? browserLang : 'it');

    translateService.setDefaultLang('it');
    translateService.use(this.currentLanguage);
  }

  ngOnInit(): void {
    this.isMobile = this.platformService.isMobile();
    const savedTheme = this.storageService.get('theme') as Theme | null;
    this.currentTheme = savedTheme ?? Theme.Light;
    this.applyTheme(this.currentTheme);

    this.resetScroll(); // Reset scroll position on app load
  }

  ngAfterViewInit(): void {
    if (!this.platformService.isBrowser()) return;

    this.scrollManager.init(); // Initialize scroll manager
    // for the moment don't use the resize manager and viewport height service because modifying the viewport height from javascript
    // can cause shift probles on mobile devices. Just use lvh
    // this.resizeManager.init(); // Initialize resize manager
    // this.viewportHeightService.init(); // Initialize viewport height service

    this.headerService.init(); // Initialize header service

    this.menuSub = this.eventService.menuEvent$.subscribe((event) => {
      this.onMenuEvent(event); // Handle menu events
    });
  }

  ngOnDestroy(): void {
    if (!this.platformService.isBrowser()) return;
    this.scrollManager.destroy(); // Destroy scroll manager
    this.headerService.destroy(); // Destroy header service
    this.menuSub?.unsubscribe(); // Unsubscribe from menu events
  }

  private resetScroll() {
    if (!this.platformService.isBrowser()) return;

    // Prevent browser from restoring scroll position
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Temporarily disable smooth scroll for instant scroll-to-top
    document.documentElement.style.scrollBehavior = 'auto';
    document.body.style.scrollBehavior = 'auto';

    window.scrollTo(0, 0); // Force scroll to top

    // Restore smooth scrolling
    setTimeout(() => {
      document.documentElement.style.scrollBehavior = '';
      document.body.style.scrollBehavior = '';
    }, 100);
  }

  get navBackground(): string {
    if (this.currentTheme === Theme.Dark) {
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
    if (!this.navRef?.nativeElement) return; // Ensure navRef is defined

    this.menuService.toggleMenu(); // Toggle the menu using MenuService
  }

  private onMenuEvent(event: MenuEvent): void {
    if (!this.navRef?.nativeElement) return; // Ensure navRef is defined

    const nav = this.navRef.nativeElement;

    if (event.status === 'closeStart') {
      nav.classList.remove('open');
      nav.classList.add('closing');
    } else if (event.status === 'closeEnd') {
      nav?.classList.remove('closing');
    }
  }
}
