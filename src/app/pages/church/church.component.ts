import {
  Component,
  AfterViewInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { isPlatformBrowser, NgFor } from '@angular/common';
import Lenis from 'lenis';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-church',
  standalone: true,
  imports: [TranslateModule, NgFor],
  templateUrl: './church.component.html',
  styleUrls: ['./church.component.scss'],
})
export class ChurchComponent implements AfterViewInit, OnDestroy {
  private lenis!: Lenis;
  private rafId = 0;
  private isBrowser: boolean;

  private heroHeight = 300; // fallback value

  churchHistoryImages = [
    { src: 'images/church/origins/origins-01.png', alt: 'History Image 1' },
    { src: 'images/church/origins/origins-02.png', alt: 'History Image 2' },
    { src: 'images/church/origins/origins-03.png', alt: 'History Image 3' },
    { src: 'images/church/origins/origins-04.png', alt: 'History Image 4' },
  ];

  @ViewChild('heroOverlay', { static: false })
  heroOverlayRef!: ElementRef<HTMLElement>;
  @ViewChild('heroSection', { static: false })
  heroSectionRef!: ElementRef<HTMLElement>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    const heroSection = this.heroSectionRef?.nativeElement;
    if (heroSection) {
      this.heroHeight = heroSection.offsetHeight;
    }

    this.lenis = new Lenis({
      duration: 2.5,
      // smooth: true,
    });

    const raf = (time: number) => {
      this.lenis.raf(time);

      // Get scroll position from Lenis
      const scrollY = this.lenis.scroll;

      // Apply scroll-based fade to hero overlay
      this.animateHero(scrollY);

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

  private animateHero(scrollY: number) {
    if (!this.heroOverlayRef) return;

    const opacity = Math.max(0, 1 - scrollY / this.heroHeight);
    const translateY = Math.min(scrollY * 0.05, 30);

    const el = this.heroOverlayRef.nativeElement;
    el.style.opacity = `${opacity}`;
    el.style.transform = `translateY(${translateY}px)`;
  }
}
