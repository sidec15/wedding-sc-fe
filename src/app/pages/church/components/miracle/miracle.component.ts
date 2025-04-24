import { NgFor, NgStyle } from '@angular/common';
import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PlatformService } from '../../../../services/platform.service';

@Component({
  selector: 'app-miracle',
  imports: [TranslateModule, NgFor, NgStyle],
  templateUrl: './miracle.component.html',
  styleUrl: './miracle.component.scss',
})
export class MiracleComponent implements AfterViewInit, OnDestroy {
  private intervalId!: NodeJS.Timeout;

  currentImageIndex = 0;
  carouselImages = [
    'images/church/miracle/miracle-01.jpg',
    'images/church/miracle/miracle-02.jpg',
  ];

  constructor(private platfoemService: PlatformService) {}

  ngAfterViewInit() {
    if (!this.platfoemService.isBrowser()) return;
    this.startImageCarousel();
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private startImageCarousel() {
    this.intervalId = setInterval(() => {
      this.currentImageIndex =
        (this.currentImageIndex + 1) % this.carouselImages.length;
    }, 5000);
  }
}
