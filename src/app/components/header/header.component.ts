import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { combineLatest, map, Observable, startWith, Subscription } from 'rxjs';
import { Theme } from '../../models/theme';
import {
  EventService,
  MenuEvent,
  ThemeMessage,
} from '../../services/event.service';
import { HeaderService } from '../../services/header.service';
import { MenuService } from '../../services/menu.service';
import { PlatformService } from '../../services/platform.service';
import { ThemeService } from '../../services/theme.service';
import { LanguageService } from '../../services/language.service';
import { CommonModule, NgClass, NgStyle } from '@angular/common';
import { RouterModule } from '@angular/router';
import { constants } from '../../constants';
import { LayoutType } from '../../models/layout';

@Component({
  selector: 'app-header',
  imports: [TranslateModule, RouterModule, CommonModule, NgClass],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  Theme = Theme; // expose enum to template if needed

  languageDropdownOpen = false;
  themeDropdownOpen = false;
  /**
   * navBackground$ is an observable string representing the CSS `background-image`
   * for the navigation menu.
   *
   * Reactive behavior:
   * - Listens to both theme changes (`eventService.theme$`) and layout changes (`eventService.layout$`).
   * - If the layout is **desktop**, it always emits `"none"`, meaning no background image is applied.
   * - If the layout is **mobile**, it computes the appropriate background image URL based on the current theme.
   *
   * Technical details:
   * - `combineLatest` merges the two streams (`theme$` and `layout$`), so any change
   *   in theme or layout triggers a new emission.
   * - `startWith` ensures both streams have an initial value immediately:
   *   - theme$: initialized with the current theme from ThemeService
   *   - layout$: initialized with `LayoutType.desktop` (or whatever your default is)
   * - `map` applies the logic: return `"none"` for desktop, or `computeBackground(...)` for mobile.
   *
   * Benefits:
   * - Fully reactive: no manual subscriptions or `markForCheck()` needed.
   * - Prevents ExpressionChangedAfterItHasBeenCheckedError on initialization.
   * - Keeps logic declarative and easy to maintain.
   *
   * Example usage in template:
   * ```html
   * <ul
   *   class="nav-links"
   *   [class.open]="isMenuOpen"
   *   [style.background-image]="navBackground$ | async"
   * ></ul>
   * ```
   */
  readonly navBackground$: Observable<string>;

  private menuSub!: Subscription;
  private headerBgSub!: Subscription;
  private themeSub!: Subscription;
  private layoutSub!: Subscription;

  @ViewChild('languageDropdown', { static: false })
  languageDropdownRef!: ElementRef;
  @ViewChild('themeDropdown', { static: false }) themeDropdownRef!: ElementRef;
  @ViewChild('navLinks', { static: false }) navRef!: ElementRef<HTMLElement>;

  isHeaderFilled = constants.IS_HEADER_FILLED; // Track if the header background is filled

  private documentClickListener?: (event: MouseEvent) => void;

  constructor(
    private platformService: PlatformService,
    private eventService: EventService,
    private headerService: HeaderService,
    private menuService: MenuService,
    private themeService: ThemeService,
    private languageService: LanguageService,
    private cdr: ChangeDetectorRef
  ) {
    this.navBackground$ = combineLatest([
      this.eventService.theme$.pipe(
        startWith({ theme: this.themeService.getCurrentThemeToApply() } as ThemeMessage)
      ),
      this.eventService.layout$.pipe(
        startWith(LayoutType.desktop) // fallback if no value yet
      )
    ]).pipe(
      map(([themeMessage, layout]) =>
        layout === LayoutType.desktop
          ? 'none'
          : this.computeBackground(themeMessage.theme)
      )
    );
  }

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

    this.layoutSub = this.eventService.layout$.subscribe((e) => {
      this.onLayoutEvent(e);
    });
  }

  ngOnDestroy(): void {
    this.menuSub?.unsubscribe(); // Unsubscribe from menu events
    this.headerBgSub?.unsubscribe(); // Unsubscribe from header background events
    this.themeSub?.unsubscribe();
    this.headerService.destroy(); // Clean up header service
    this.removeDocumentClickListener();
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
    if (this.platformService.isMobile()) {
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
    } else if (event.status === 'closeEnd') {
      nav.classList.remove('closing');
      this.setBodyScrollLock(false);
    } else if (event.status === 'openStart') {
      this.headerService.enableHeader();
      this.setBodyScrollLock(true);
    }
  }

  private addDocumentClickListener(type: 'language' | 'theme') {
    this.removeDocumentClickListener();
    this.documentClickListener = (event: MouseEvent) => {
      const dropdownRef =
        type === 'language' ? this.languageDropdownRef : this.themeDropdownRef;
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

  private computeBackground(t: Theme) {
    const url =
      t === Theme.Dark
        ? 'url("/images/mobile-menu/bg-02.png")'
        : 'url("/images/mobile-menu/bg-01.png")';

    return url;
  }

  private onLayoutEvent(layoutType: LayoutType) {
    if (layoutType == LayoutType.desktop && this.isMenuOpen) {
      this.menuService.closeMenu();
    }
  }
}
