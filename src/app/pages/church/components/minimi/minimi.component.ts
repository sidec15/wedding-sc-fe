import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  ChangeDetectorRef,
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
import { NgFor, NgStyle } from '@angular/common';
import { EventService, ScrollEvent } from '../../../../services/event.service';

@Component({
  selector: 'app-minimi',
  imports: [TranslateModule, NgFor, NgStyle],
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
  public static fadeOutDuration: number = 1000; // Duration for fade-out animation in milliseconds
  public static fadeInDuration: number = 2000; // Duration for fade-in animation in milliseconds
  public static intervalValue: number = 5000; // Interval duration in milliseconds (8 seconds)

  private slideSub!: Subscription;
  private scrollEventSubscription!: Subscription;

  private slideTimeoutId!: NodeJS.Timeout;

  private isSlideShowActive = false;

  slides: Slide[] = [
    {
      imageUrl: '/images/church/minimi/minimi-01.png',
      title: 'church.minimi.slides.0.title',
      description: 'church.minimi.slides.0.description',
      duration: 10000,
    },
    {
      imageUrl: '/images/church/minimi/minimi-02.png',
      title: 'church.minimi.slides.1.title',
      description: 'church.minimi.slides.1.description',
      duration: 20000,
    },
    {
      imageUrl: '/images/church/minimi/minimi-03.png',
      title: 'church.minimi.slides.2.title',
      description: 'church.minimi.slides.2.description',
      duration: 20000,
    },
    {
      imageUrl: '/images/church/minimi/minimi-04.png',
      title: 'church.minimi.slides.3.title',
      description: 'church.minimi.slides.3.description',
      duration: 15000,
    },
    {
      imageUrl: '/images/church/minimi/minimi-05.png',
      title: 'church.minimi.slides.4.title',
      description: 'church.minimi.slides.4.description',
      duration: 15000,
    },
  ];

  @ViewChild('minimiSection', { static: false })
  minimiSectionRef!: ElementRef<HTMLElement>;

  currentSlideIndex = 0;
  activeSlides: Slide[] = [];
  fadeState: 'visible' | 'hidden' = 'visible';

  progress = 100; // 100 to 0
  private rafId: number | null = null;

  constructor(
    private platformService: PlatformService,
    private eventService: EventService
  ) {}

  ngAfterViewInit(): void {
    if (!this.platformService.isBrowser()) return;

    // Use requestAnimationFrame to ensure the DOM has fully rendered and the element's
    // position is accurate before checking visibility. Without this, getBoundingClientRect()
    // may return incorrect values on initial load, especially when this section is the first visible one.
    requestAnimationFrame(() => {
      if (!this.platformService.isVisible(this.minimiSectionRef.nativeElement))
        return;

      this.startSlideShow();
    });

    this.scrollEventSubscription = this.eventService.scrollEvent$.subscribe(
      (e: ScrollEvent) => {
        if (
          !this.platformService.isVisible(this.minimiSectionRef.nativeElement)
        ) {
          this.stopSlideShow();
          return;
        } else {
          this.startSlideShow();
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.slideSub?.unsubscribe();
    this.scrollEventSubscription?.unsubscribe();
    this.stopSlideShow();
  }

  prevSlide(): void {
    this.goToSlide(-1);
  }

  nextSlide(): void {
    this.goToSlide(1);
  }

  private startSlideShow(): void {
    if (this.isSlideShowActive) return;
    this.isSlideShowActive = true;
    console.log('Starting slideshow');
    this.activeSlides = [{ ...this.slides[0], visible: true }];
    this.currentSlideIndex = 0;
    this.startProgressBar(
      this.slides[0].duration ?? MinimiComponent.intervalValue
    );
    this.scheduleNextSlide();
  }

  private scheduleNextSlide(): void {
    const currentSlide = this.slides[this.currentSlideIndex];
    const duration = currentSlide.duration ?? MinimiComponent.intervalValue;

    this.slideTimeoutId = setTimeout(() => {
      this.handlePrograsBarAnimation();
      this.handleSlideAnimation();
      this.scheduleNextSlide();
    }, duration);
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
    this.progress = 100;
    if (this.rafId) cancelAnimationFrame(this.rafId);

    // Use the current slide's duration for the progress bar
    const currentSlide = this.slides[this.currentSlideIndex];
    const duration = currentSlide.duration ?? MinimiComponent.intervalValue;
    this.startProgressBar(duration);
  }

  private handleSlideAnimation() {
    if (this.slideTimeoutId) clearTimeout(this.slideTimeoutId); // Add this line

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

  private goToSlide(direction: 1 | -1): void {
    // Cancel any existing animations
    this.stopSlideShow();

    const slidesCount = this.slides.length;
    let newIndex =
      (this.currentSlideIndex + direction + slidesCount) % slidesCount;

    // Hide current
    this.activeSlides[0].visible = false;

    // Show next
    this.activeSlides.unshift({ ...this.slides[newIndex], visible: true });

    this.currentSlideIndex = newIndex;

    setTimeout(() => {
      // Restart progress bar and auto-advance
      const duration =
        this.slides[this.currentSlideIndex].duration ??
        MinimiComponent.intervalValue;
      this.startProgressBar(duration);
      this.scheduleNextSlide();
    }, MinimiComponent.fadeOutDuration);
  }

  private stopSlideShow() {
    this.isSlideShowActive = false;
    // console.log('Stopping slideshow');
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.slideTimeoutId) clearTimeout(this.slideTimeoutId);
  }
}

export interface Slide {
  imageUrl: string;
  title: string;
  description: string;
  style?: { [key: string]: string };
  visible?: boolean;
  duration?: number; // visibility time in milliseconds
}
