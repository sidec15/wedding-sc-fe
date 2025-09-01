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
    this.themeService.initTheme();
    this.languageService.init();
    this.resetScroll();
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

}
