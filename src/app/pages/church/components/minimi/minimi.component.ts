import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { interval, Subscription } from 'rxjs';
import { PlatformService } from '../../../../services/platform.service';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-minimi',
  imports: [TranslateModule, NgFor],
  templateUrl: './minimi.component.html',
  styleUrl: './minimi.component.scss',
  animations: [
    trigger('fadeSlide', [
      state('visible', style({ opacity: 1 })),
      state('hidden', style({ opacity: 0 })),
      transition('visible => hidden', [
        animate(MinimiComponent.fadeOutDuration + 'ms ease-out'),
      ]),
      transition('hidden => visible', [
        animate(MinimiComponent.fadeInDuration + 'ms ease-in'),
      ]),
    ]),
  ],
})
export class MinimiComponent implements AfterViewInit, OnDestroy {
  public static fadeOutDuration: number = 3000; // Duration for fade-out animation in milliseconds
  public static fadeInDuration: number = 4000; // Duration for fade-in animation in milliseconds
  public static intervalValue: number = 15000; // Interval duration in milliseconds (8 seconds)

  private slideSub!: Subscription;

  slides: Slide[] = [
    {
      imageUrl: '/images/church/origins/origins-01.png',
      title: 'church.minimi.slides.0.title',
      description: 'church.minimi.slides.0.description',
    },
    {
      imageUrl: '/images/church/origins/origins-02.png',
      title: 'church.minimi.slides.1.title',
      description: 'church.minimi.slides.1.description',
    },
    {
      imageUrl: '/images/church/origins/origins-03.png',
      title: 'church.minimi.slides.2.title',
      description: 'church.minimi.slides.2.description',
    },
    {
      imageUrl: '/images/church/origins/origins-04.png',
      title: 'church.minimi.slides.3.title',
      description: 'church.minimi.slides.3.description',
    },
    {
      imageUrl: '/images/church/origins/origins-04.png',
      title: 'church.minimi.slides.4.title',
      description: 'church.minimi.slides.4.description',
    },
  ];

  @ViewChild('carouselSection', { static: false })
  carouselSectionRef!: ElementRef<HTMLElement>;

  currentSlideIndex = 0;
  activeSlides: Slide[] = [];
  fadeState: 'visible' | 'hidden' = 'visible';

  progress = 100; // 100 to 0
  private rafId: number | null = null;

  constructor(private platformService: PlatformService) {}

  ngAfterViewInit(): void {
    if (!this.platformService.isBrowser()) return;

    // Use requestAnimationFrame to ensure the DOM has fully rendered and the element's
    // position is accurate before checking visibility. Without this, getBoundingClientRect()
    // may return incorrect values on initial load, especially when this section is the first visible one.
    requestAnimationFrame(() => {
      if (
        !this.platformService.isVisible(this.carouselSectionRef.nativeElement)
      )
        return;

      this.startSlideShow();
    });
  }

  ngOnDestroy(): void {
    this.slideSub?.unsubscribe();
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  private startSlideShow(): void {
    this.activeSlides = [{ ...this.slides[0], visible: true }];
    this.startProgressBar(MinimiComponent.intervalValue);

    this.slideSub = interval(MinimiComponent.intervalValue).subscribe(() => {
      this.handlePrograsBarAnimation();
      this.handleSlideAnimation();
    });
  }

  private startProgressBar(duration: number) {
    const start = performance.now(); // Get the start time in ms

    const loop = (now: number) => {
      const elapsed = now - start; // How much time has passed since we started
      const percent = 100 - Math.min((elapsed / duration) * 100, 100); // Compute % progress
      this.progress = percent; // Update the bound variable (Angular redraws the bar)

      if (percent > 0) {
        this.rafId = requestAnimationFrame(loop); // Call again before next repaint
      }
    };

    this.rafId = requestAnimationFrame(loop); // Start the loop
  }

  private handlePrograsBarAnimation() {
    // Reset progress bar
    this.progress = 100; // 100 to 0
    if (this.rafId) cancelAnimationFrame(this.rafId);

    // Start progress bar animation
    this.startProgressBar(MinimiComponent.intervalValue);
  }

  private handleSlideAnimation() {
    const nextIndex = (this.currentSlideIndex + 1) % this.slides.length;

    // Hide current
    this.activeSlides[0].visible = false;

    // Show next
    this.activeSlides.unshift({ ...this.slides[nextIndex], visible: true });

    // Remove old slide after fade-out
    setTimeout(() => {
      this.activeSlides.pop();
      this.currentSlideIndex = nextIndex;
    }, MinimiComponent.fadeOutDuration);
  }
}

export interface Slide {
  imageUrl: string,
  title: string,
  description: string,
  visible?: boolean
}
