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
import { EventService, ScrollEvent } from './services/event.service';
import { Subscription } from 'rxjs';
import { ScrollManagerService } from './services/scroll-manager.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, TranslateModule, NgIf, NgClass, NgStyle],
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
  currentTheme: Theme = Theme.Light;
  isMobile = false;

  languageDropdownOpen = false;
  themeDropdownOpen = false;

  private scrollSub!: Subscription;
  private swipeCloseSub!: Subscription;

  private isClosingMenu = false; // Track if the menu is closing

  private readonly minDistanceToHideHeader = 1; // Minimum distance to hide the header in pixels
  private readonly minDistanceToShowHeader = 10; // Minimum distance to show the header in pixels
  private readonly minDistanceToCloseMenu = 50; // Minimum distance to close the menu in pixels
  private readonly closeMenuTimeout = 3400; // 2.8s (item delay) + 0.6s (container slide)

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
    private scrollManager: ScrollManagerService
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

  ngAfterViewInit(): void {
    if (!this.platformService.isBrowser()) return;

    this.scrollManager.initialize(); // Initialize scroll manager
    
    this.scrollSub = this.eventService.scrollEvent$.subscribe(
      (e: ScrollEvent) => {
        this.onWindowScroll(e); // Call the scroll handler
      }
    );

    this.swipeCloseSub = this.eventService.swipeCloseEvent$.subscribe(
      (e) => {
        if (this.isMenuOpen && e.swipeXOffset <= -this.minDistanceToCloseMenu) {
          this.closeMenu(); // Close the menu on swipe close
        }
      }
    );

  }

  ngOnDestroy(): void {
    if (!this.platformService.isBrowser()) return;
    this.scrollManager.destroy(); // Destroy scroll manager
    this.scrollSub?.unsubscribe();
    this.swipeCloseSub?.unsubscribe();
  }

  get navBackground(): string {
    if (this.currentTheme === Theme.Dark) {
      return 'url("/images/mobile-menu/bg-02.png")';
    }
    return 'url("/images/mobile-menu/bg-01.png")';
  }

  private onWindowScroll(event: ScrollEvent): void {
    if (this.isMenuOpen || this.isClosingMenu) return; // Ignore scroll event if menu is open or closing
    if (
      event.scrollDirection() === 'down' &&
      event.scrollYOffset > this.minDistanceToHideHeader
    ) {
      this.isHeaderHidden = true;
    } else if (
      event.scrollDirection() === 'up' &&
      event.scrollYOffset < -this.minDistanceToShowHeader
    ) {
      this.isHeaderHidden = false;
    }
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
    if (this.isMenuOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  closeMenu(): void {
    if (!this.isMenuOpen) return; // Ignore if menu is already closed
    if (!this.navRef?.nativeElement) return; // Ensure navRef is defined
    if (this.isClosingMenu) return; // Ignore if menu is already closing

    this.isClosingMenu = true; // Set the flag to indicate menu is closing

    const nav = this.navRef.nativeElement;

    nav.classList.remove('open');
    nav.classList.add('closing');

    setTimeout(() => {
      nav?.classList.remove('closing');
      this.isMenuOpen = false;
      this.isClosingMenu = false; // Reset the flag after closing
    }, this.closeMenuTimeout);
  }

  openMenu(): void {
    if (this.isMenuOpen) return; // Ignore if menu is already open
    if (this.isClosingMenu) return; // Ignore if menu is already closing
    this.isMenuOpen = true;
  }

}
