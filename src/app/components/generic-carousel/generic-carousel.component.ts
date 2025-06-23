import {
  AfterViewInit,
  Component,
  ElementRef,
  input,
  InputSignal,
  OnDestroy,
  ViewChild,
  ChangeDetectorRef,
  TemplateRef,
  computed,
  Signal,
  Input,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { EventService } from '../../services/event.service';
import { PlatformService } from '../../services/platform.service';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { TranslateModule } from '@ngx-translate/core';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-generic-carousel',
  imports: [TranslateModule, NgTemplateOutlet],
  templateUrl: './generic-carousel.component.html',
  styleUrl: './generic-carousel.component.scss',
  animations: [
    trigger('fadeSlide', [
      state('visible', style({ opacity: 1 })),
      state('hidden', style({ opacity: 0 })),
      transition('visible => hidden', [animate('1000ms ease-out')]),
      transition('hidden => visible', [animate('2000ms ease-in')]),
    ]),
  ],
})
export class GenericCarouselComponent implements AfterViewInit, OnDestroy {
  /** Inputs */
  fadeOutDuration: InputSignal<number> = input(1000);
  fadeInDuration: InputSignal<number> = input(2000);
  intervalValue: InputSignal<number> = input(5000);

  /** DOM references */
  @ViewChild('carousel', { static: false })
  carouselSectionRef!: ElementRef<HTMLElement>;
  @ViewChild('overlayRef', { static: false })
  overlayRef!: ElementRef<HTMLElement>;

  /** State */
  currentSlideIndex = 0;
  activeSlides: Slide[] = [];
  fadeState: 'visible' | 'hidden' = 'visible';
  progress = 100;

  /** Internals */
  private _slides: Slide[] = [];
  private slideSub!: Subscription;
  private scrollEventSub!: Subscription;
  private slideTimeoutId!: NodeJS.Timeout | null;
  private isSlideShowActive = false;
  private slideStartTimestamp = 0;

  private rafId: number | null = null;

  constructor(
    private platformService: PlatformService,
    private eventService: EventService,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    if (!this.platformService.isPlatformReady()) return;

    // We no longer start the slideshow here because slides might not be ready yet.
    // The setter of @Input() slides will handle initialization as soon as the data arrives.

    // Subscribe to scroll events to control autoplay visibility
    this.scrollEventSub = this.eventService.scrollEvent$.subscribe(() => {
      const isVisible = this.platformService.isVisible(
        this.carouselSectionRef.nativeElement
      );
      if (!isVisible && this.isSlideShowActive) {
        this.stopSlideShow();
      } else if (
        isVisible &&
        !this.isSlideShowActive &&
        this.slides.length > 0
      ) {
        this.startSlideShow();
      }
    });
  }

  ngOnDestroy(): void {
    this.slideSub?.unsubscribe();
    this.scrollEventSub?.unsubscribe();
    this.stopSlideShow();
  }

  /**
   * Input setter for slides.
   * As soon as the parent sets a valid non-empty list of slides,
   * we initialize the activeSlides array and start the slideshow.
   */
  @Input()
  set slides(slides: Slide[]) {
    this._slides = slides;

    // Ensure slideshow starts only once and only if slides are available
    if (
      this.platformService.isPlatformReady() &&
      slides?.length > 0 &&
      !this.isSlideShowActive
    ) {
      this.activeSlides = slides.map((s, i) => ({
        ...s,
        visible: i === 0, // Only the first slide is visible initially
      }));
      this.currentSlideIndex = 0;
      this.cdr.detectChanges(); // Force refresh if binding happens after view init
      this.startSlideShow();
    }
  }

  get slides(): Slide[] {
    return this._slides;
  }

  get totalSlides(): number {
    return this._slides.length;
  }

  /** Public slide controls */
  prevSlide(): void {
    this.goToSlide(-1);
  }

  nextSlide(): void {
    this.goToSlide(1);
  }

  private goToSlide(direction: 1 | -1): void {
    const nextIndex = this.getNextSlideIndex(direction);

    this.handleSlideTransition(nextIndex);
    this.resetProgressBar();
  }

  /** Slide management */
  private startSlideShow(): void {
    if (this.isSlideShowActive && this._slides?.length > 0) return;

    this.isSlideShowActive = true;
    this.setActiveSlides([{ ...this._slides[0], visible: true }]);
    this.currentSlideIndex = 0;

    this.startProgressBar(this.getCurrentSlideDuration());
  }

  private stopSlideShow(): void {
    if (!this.isSlideShowActive) return;

    this.isSlideShowActive = false;

    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.slideTimeoutId) clearTimeout(this.slideTimeoutId);
  }

  private handleSlideTransition(nextIndex: number): void {
    if (this.slideTimeoutId) {
      clearTimeout(this.slideTimeoutId);
      this.slideTimeoutId = null;
    }

    // Visually fade out current slide
    this.disableCurrentSlide();

    // Show next slide immediately for progress/timing sync
    this.enabledSlide({ ...this._slides[nextIndex], visible: true });
    this.currentSlideIndex = nextIndex;

    // Delay pop only for visual fade-out effect (optional)
    setTimeout(() => {
      this.popSlide();
    }, this.fadeOutDuration());
  }

  private getCurrentSlideDuration(): number {
    return (
      this._slides[this.currentSlideIndex].duration ?? this.intervalValue()
    );
  }

  private startProgressBar(duration: number, initialProgress = 100): void {
    this.slideStartTimestamp = performance.now();
    const initialElapsed = ((100 - initialProgress) / 100) * duration;
    const remainingDuration = duration - initialElapsed;

    const animate = () => {
      const now = performance.now();
      const elapsed = now - this.slideStartTimestamp + initialElapsed;
      const percent = 100 - Math.min((elapsed / duration) * 100, 100);

      this.progress = percent;

      if (this.progress > 0) {
        this.rafId = requestAnimationFrame(animate);
      }
    };

    const delay = remainingDuration;
    this.slideTimeoutId = setTimeout(() => {
      this.handleSlideTransition(this.getNextSlideIndex(1)); // Move to next slide
      this.resetProgressBar();
    }, delay);

    this.rafId = requestAnimationFrame(animate);
  }

  private resetProgressBar(): void {
    this.progress = 100;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.startProgressBar(this.getCurrentSlideDuration());
  }

  /** Slide mutation helpers (with detectChanges) */
  private setActiveSlides(slides: Slide[]): void {
    this.activeSlides = slides;
    this.cdr.detectChanges(); // Tell Angular it's okay, now reconcile the view
  }

  private popSlide(): void {
    this.activeSlides.pop();
    this.cdr.detectChanges(); // Tell Angular it's okay, now reconcile the view
  }

  private enabledSlide(slide: Slide): void {
    this.activeSlides.unshift(slide);
    this.cdr.detectChanges(); // Tell Angular it's okay, now reconcile the view
  }

  private disableCurrentSlide(): void {
    if (this.activeSlides[0]) {
      this.activeSlides[0].visible = false;
      this.cdr.detectChanges(); // Tell Angular it's okay, now reconcile the view
    }
  }

  private getNextSlideIndex(direction: 1 | -1): number {
    const total = this._slides.length;
    const nextIndex = (this.currentSlideIndex + direction + total) % total;
    return nextIndex;
  }
}

/** Slide model */
export interface Slide {
  elementRef: TemplateRef<any>;
  style?: { [key: string]: string };
  visible?: boolean;
  duration?: number;
}
