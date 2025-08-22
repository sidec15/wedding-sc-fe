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

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    TranslateModule,
    HeaderComponent,
    GlobalLoadingMaskComponent,
    FlashMessageComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  Theme = Theme; // expose enum to template if needed

  title = 'wedding-sc-fe';

  currentYear = new Date().getFullYear();

  globalFlash: any = null;

  constructor(
    public router: Router,
    private platformService: PlatformService,
    private scrollManager: ScrollManagerService,
    private languageService: LanguageService,
    private themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    this.themeService.initTheme();
    this.languageService.init();
    this.resetScroll();
  }

  ngAfterViewInit(): void {
    if (!this.platformService.isBrowser()) return;

    this.scrollManager.init();
  }

  ngOnDestroy(): void {
    if (!this.platformService.isBrowser()) return;
    this.scrollManager.destroy();
  }

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
