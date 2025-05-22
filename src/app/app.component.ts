import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
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
import Lenis from 'lenis';
import { EventService, ScrollEvent } from './services/event.service';
import { Subscription } from 'rxjs';

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
  private lenis!: Lenis;
  private rafId = 0;

  private touchStartY = 0;
  private touchEndY = 0;
  private isClosingMenu = false; // Track if the menu is closing

  private previousScrollYValue = 0; // Store the previous scroll Y value

  private readonly minDistanceToHideHeader = 1; // Minimum distance to hide the header in pixels
  private readonly minDistanceToShowHeader = 10; // Minimum distance to show the header in pixels
  private readonly minDistanceToCloseMenu = 50; // Minimum distance to close the menu in pixels
  private readonly lenisDuration = 2.5; // Duration for Lenis smooth scroll
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

    this.lenis = new Lenis({
      duration: this.lenisDuration,
      // smooth: true,
    });

    const raf = (time: number) => {
      this.lenis.raf(time);

      // Get scroll position from Lenis
      const scrollY = this.lenis.scroll;

      // Emit scroll event with scroll position only if the scroll really changed
      if (Math.abs(scrollY - this.previousScrollYValue) > 0.1) {
        this.eventService.emitScrollEvent(
          scrollY,
          scrollY - this.previousScrollYValue
        ); // Emit the scroll event
        this.previousScrollYValue = scrollY; // Update the previous scroll Y value
      }

      this.rafId = requestAnimationFrame(raf);
    };

    this.rafId = requestAnimationFrame(raf);

    this.scrollSub = this.eventService.scrollEvent$.subscribe(
      (e: ScrollEvent) => {
        this.onWindowScroll(e); // Call the scroll handler
      }
    );
  }

  ngOnDestroy(): void {
    if (!this.platformService.isBrowser()) return;
    cancelAnimationFrame(this.rafId);
    this.scrollSub?.unsubscribe();
    this.lenis.destroy();
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

  // ###################################################
  // disable for the moment cause is not a nice effect!!!
  // @HostListener('touchstart', ['$event'])
  // onTouchStart(event: TouchEvent): void {
  //   this.touchStartY = event.changedTouches[0].screenY;
  // }

  // @HostListener('touchend', ['$event'])
  // onTouchEnd(event: TouchEvent): void {
  //   this.touchEndY = event.changedTouches[0].screenY;
  //   this.handleSwipeGesture();
  // }
  // ###################################################

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

  private handleSwipeGesture(): void {
    if (!this.isMenuOpen) return; // Ignore swipe if menu is open
    if (this.isClosingMenu) return; // Ignore swipe if menu is closing

    if (this.touchStartY - this.touchEndY > this.minDistanceToCloseMenu) {
      // Swipe up: Close the menu
      this.closeMenu();
    }
  }
}
