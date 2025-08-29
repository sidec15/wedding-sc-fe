import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Theme } from './models/theme';
import { PlatformService } from './services/platform.service';
import { ScrollManagerService } from './services/scroll-manager.service';
import { HeaderComponent } from './components/header/header.component';
import { LanguageService } from './services/language.service';
import { GlobalLoadingMaskComponent } from './components/global-loading-mask/global-loading-mask.component';
import { ThemeService } from './services/theme.service';
import { FlashMessageComponent } from './components/flash-message/flash-message.component';
import { MenuService } from './services/menu.service';
import { EventService, MenuEvent } from './services/event.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    TranslateModule,
    HeaderComponent,
    GlobalLoadingMaskComponent,
    FlashMessageComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  Theme = Theme; // expose enum to template if needed

  title = 'wedding-sc-fe';
  currentYear = new Date().getFullYear();

  private hasMenuSentinel = false;

  /**
   * Bound reference to the popstate handler so it can be removed on destroy.
   * This listens to browser history events (back/forward gestures and buttons).
   */
  private popStateHandler = (event: PopStateEvent) => this.onPopState(event);

  constructor(
    public router: Router,
    private platformService: PlatformService,
    private scrollManager: ScrollManagerService,
    private languageService: LanguageService,
    private themeService: ThemeService,
    private menuService: MenuService,
    private eventService: EventService
  ) {}

  /**
   * Lifecycle: OnInit
   * - Adds a global popstate listener (captures hardware back button / swipe gestures).
   * - Initializes theme and language services.
   * - Resets scroll restoration to manual so each page starts at the top.
   */
  ngOnInit(): void {
    window.addEventListener('popstate', this.popStateHandler);
    this.themeService.initTheme();
    this.languageService.init();
    this.resetScroll();

    // When menu opens, push one sentinel state
    this.eventService.menuEvent$.subscribe((e: MenuEvent) => {
      if (!this.platformService.isMobile()) return;

      if (e.status === 'openStart' && !this.hasMenuSentinel) {
        history.pushState({ menuOverlay: true }, '', window.location.href);
        this.hasMenuSentinel = true;
      }

      if (e.status === 'closeEnd' && this.hasMenuSentinel) {
        // optional: clear the sentinel marker; the pop will consume it anyway
        this.hasMenuSentinel = false;
      }
    });
  }


  /**
   * Lifecycle: AfterViewInit
   * - Initializes the scroll manager only when running in the browser.
   */
  ngAfterViewInit(): void {
    if (!this.platformService.isBrowser()) return;
    this.scrollManager.init();
  }

  /**
   * Lifecycle: OnDestroy
   * - Cleans up the popstate listener.
   * - Destroys the scroll manager if running in the browser.
   */
  ngOnDestroy(): void {
    window.removeEventListener('popstate', this.popStateHandler);
    if (!this.platformService.isBrowser()) return;
    this.scrollManager.destroy();
  }

  /**
   * Ensures that when navigating between Angular routes,
   * the scroll position always resets to the top of the page.
   *
   * Implementation:
   * - Temporarily disables smooth scroll so the reset is immediate.
   * - Uses a timeout to restore the original behavior.
   */
  private resetScroll() {
    if (!this.platformService.isBrowser()) return;

    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    document.documentElement.style.scrollBehavior = 'auto';
    document.body.style.scrollBehavior = 'auto';

    window.scrollTo(0, 0);

    setTimeout(() => {
      document.documentElement.style.scrollBehavior = '';
      document.body.style.scrollBehavior = '';
    }, 100);
  }

  private onPopState(event: PopStateEvent) {
    // If the popped state is our sentinel, just close the menu and stop.
    if ((event.state && event.state.menuOverlay) || this.menuService.isMenuOpened()) {
      this.menuService.closeMenu();
      // Replace the current state to avoid stacking multiple sentinels
      history.replaceState(null, '', window.location.href);
      this.hasMenuSentinel = false;
      return;
    }

  }

}
