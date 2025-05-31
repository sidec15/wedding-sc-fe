import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderService } from '../../services/header.service';
import { PlatformService } from '../../services/platform.service';

@Component({
  selector: 'app-home',
  imports: [TranslateModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  constructor(
    private platformService: PlatformService,
    private headerService: HeaderService
  ) {}

  ngAfterViewInit(): void {
    if (this.platformService.isMobile()) {
      this.headerService.disable(); // Disable header animation on home page
    }
  }

  ngOnDestroy(): void {
    if (this.platformService.isMobile()) this.headerService.enable(); // Re-enable header animation when leaving home page
  }
}
