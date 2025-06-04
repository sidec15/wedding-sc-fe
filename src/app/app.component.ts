import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Theme } from './models/theme';
import { PlatformService } from './services/platform.service';
import { EventService } from './services/event.service';
import { ScrollManagerService } from './services/scroll-manager.service';
import { HeaderComponent } from './components/header/header.component';
import { LanguageService } from './services/language.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    TranslateModule,
    HeaderComponent,
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
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.languageService.init(); // Initialize language service
    this.resetScroll(); // Reset scroll position on app load
  }

  ngAfterViewInit(): void {
    if (!this.platformService.isBrowser()) return;

    this.scrollManager.init(); // Initialize scroll manager
  }

  ngOnDestroy(): void {
    if (!this.platformService.isBrowser()) return;
    this.scrollManager.destroy(); // Destroy scroll manager
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
}
