import { Component, AfterViewInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Lenis from 'lenis';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-church',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './church.component.html',
  styleUrls: ['./church.component.scss']
})
export class ChurchComponent implements AfterViewInit, OnDestroy {
  private lenis!: Lenis;
  private rafId = 0;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    this.lenis = new Lenis({
      duration: 2.5,
      // easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    const raf = (time: number) => {
      this.lenis.raf(time);
      this.rafId = requestAnimationFrame(raf);
    };

    this.rafId = requestAnimationFrame(raf);
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      cancelAnimationFrame(this.rafId);
      this.lenis.destroy();
    }
  }
}
