import {
  AfterViewInit,
  Component,
  ElementRef,
  input,
  InputSignal,
  OnDestroy,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { EventService, ScrollEvent } from '../../services/event.service';
import { PlatformService } from '../../services/platform.service';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { TranslateModule } from '@ngx-translate/core';
import { NgFor, NgIf, NgStyle } from '@angular/common';

@Component({
  selector: 'app-carousel',
  imports: [TranslateModule, NgFor, NgStyle, NgIf],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss',
  animations: [
    trigger('fadeSlide', [
      state('visible', style({ opacity: 1 })),
      state('hidden', style({ opacity: 0 })),
      transition('visible => hidden', [animate('1000ms ease-out')]),
      transition('hidden => visible', [animate('2000ms ease-in')]),
    ]),
  ],
})
export class CarouselComponent implements OnInit, AfterViewInit, OnDestroy {
  /** Inputs */
  fadeOutDuration: InputSignal<number> = input(1000);
  fadeInDuration: InputSignal<number> = input(2000);
  intervalValue: InputSignal<number> = input(5000);
  slides: InputSignal<Slide[]> = input.required();
  slidesMobile: InputSignal<Slide[]> = input([] as Slide[]);

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
  shouldShowMore = false;
  expanded = false;

  /** Internals */
  private slideSub!: Subscription;
  private scrollEventSubscription!: Subscription;
  private slideTimeoutId!: NodeJS.Timeout;
  private isSlideShowActive = false;
  private isPaused = false;
  private pauseTimestamp = 0;
  private remainingSlideDuration = 0;
  private slideStartTimestamp = 0;
  private slideDurationMs = 0;
  private progressAtPause = 0;

  private mySlides: Slide[] = [];
  private rafId: number | null = null;

  constructor(
    private platformService: PlatformService,
    private eventService: EventService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.mySlides =
      this.platformService.isMobile() && this.slidesMobile()?.length > 0
        ? this.slidesMobile()
        : this.slides();
  }

  ngAfterViewInit(): void {
    if (!this.platformService.isBrowser()) return;

    requestAnimationFrame(() => {
      if (
        this.platformService.isVisible(this.carouselSectionRef.nativeElement)
      ) {
        this.startSlideShow();
      }
    });

    this.scrollEventSubscription = this.eventService.scrollEvent$.subscribe(
      () => {
        const isVisible = this.platformService.isVisible(
          this.carouselSectionRef.nativeElement
        );
        if (!isVisible) {
          if (this.isSlideShowActive) {
            this.stopSlideShow();
          }
        } else {
          if (!this.isSlideShowActive) {
            this.startSlideShow();
          }
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.slideSub?.unsubscribe();
    this.scrollEventSubscription?.unsubscribe();
    this.stopSlideShow();
  }

  /** Public slide controls */
  prevSlide(): void {
    this.goToSlide(-1);
  }

  nextSlide(): void {
    this.goToSlide(1);
  }

  private activateslideShow(): void {
    if (this.isSlideShowActive) return;
    console.log('Activating slideshow');
    this.isSlideShowActive = true;
  }

  /** Slide management */
  private startSlideShow(): void {
    if (this.isSlideShowActive) return;

    this.activateslideShow();
    console.log('Starting slideshow');
    this.setActiveSlides([{ ...this.mySlides[0], visible: true }]);
    this.currentSlideIndex = 0;
    this.onSlideVisible();

    this.startProgressBar(this.getCurrentSlideDuration());
    this.scheduleNextSlide();
  }

  private stopSlideShow(): void {
    if (!this.isSlideShowActive) return;

    console.log('Stopping slideshow');
    this.isSlideShowActive = false;
    this.expanded = false;

    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.slideTimeoutId) clearTimeout(this.slideTimeoutId);
  }

  private pauseSlideshow(): void {
    if (!this.isSlideShowActive || this.isPaused) return;

    this.isPaused = true;
    this.pauseTimestamp = performance.now();

    if (this.slideTimeoutId) {
      clearTimeout(this.slideTimeoutId);
      this.remainingSlideDuration =
        this.slideDurationMs - (this.pauseTimestamp - this.slideStartTimestamp);
    }

    if (this.rafId) cancelAnimationFrame(this.rafId);

    // Capture how far the progress bar was
    this.progressAtPause = this.progress;

    console.log('Slideshow paused');
  }

  private resumeSlideshow(): void {
    if (!this.isSlideShowActive || !this.isPaused) return;

    this.isPaused = false;

    console.log('Resuming slideshow');
    this.startProgressBar(this.remainingSlideDuration, this.progressAtPause);
    this.scheduleNextSlide(this.remainingSlideDuration);
  }

  private scheduleNextSlide(duration?: number): void {
    const delay = duration ?? this.getCurrentSlideDuration();
    this.slideTimeoutId = setTimeout(() => {
      this.handleProgressBarReset();
      this.handleSlideTransition();
      this.scheduleNextSlide();
    }, delay);
  }

  private handleSlideTransition(): void {
    if (this.slideTimeoutId) clearTimeout(this.slideTimeoutId);

    const nextIndex = (this.currentSlideIndex + 1) % this.mySlides.length;
    this.setSlideVisible(false, 0);
    this.unshiftSlide({ ...this.mySlides[nextIndex], visible: true });

    setTimeout(() => {
      this.popSlide();
      this.currentSlideIndex = nextIndex;
      this.onSlideVisible();
    }, this.fadeOutDuration());
  }

  private goToSlide(direction: 1 | -1): void {
    this.stopSlideShow();

    const total = this.mySlides.length;
    const newIndex = (this.currentSlideIndex + direction + total) % total;

    this.activateslideShow();
    this.setSlideVisible(false, 0);
    this.unshiftSlide({ ...this.mySlides[newIndex], visible: true });
    this.currentSlideIndex = newIndex;

    setTimeout(() => {
      this.startProgressBar(this.getCurrentSlideDuration());
      this.scheduleNextSlide();
      this.onSlideVisible();
    }, this.fadeOutDuration());
  }

  private getCurrentSlideDuration(): number {
    return (
      this.mySlides[this.currentSlideIndex].duration ?? this.intervalValue()
    );
  }

  /** Progress bar handling */
  private startProgressBar(duration: number, initialProgress = 100): void {
    this.slideDurationMs = duration;
    this.slideStartTimestamp = performance.now();
    const initialElapsed = ((100 - initialProgress) / 100) * duration;

    const animate = () => {
      const now = performance.now();
      const elapsed = now - this.slideStartTimestamp + initialElapsed;
      const percent = 100 - Math.min((elapsed / duration) * 100, 100);

      this.progress = percent;

      if (this.progress > 0 && !this.isPaused) {
        this.rafId = requestAnimationFrame(animate);
      }
    };

    this.rafId = requestAnimationFrame(animate);
  }

  private handleProgressBarReset(): void {
    this.progress = 100;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.startProgressBar(this.getCurrentSlideDuration());
  }

  /** Overlay logic */
  private onSlideVisible(): void {
    this.expanded = false;
    requestAnimationFrame(() => this.checkOverlayOverflow());
  }

  private checkOverlayOverflow(): void {
    if (!this.platformService.isBrowser() || !this.overlayRef) return;

    const el = this.overlayRef.nativeElement;
    const result = el.scrollHeight > el.clientHeight;
    this.shouldShowMore = result;
    console.log('Checking overlay overflow. Result:', result);
  }

  toggleExpandedState(state: boolean): void {
    this.expanded = state;
    if (state) {
      this.pauseSlideshow();
    } else {
      this.resumeSlideshow();
    }
    // if (!state) {
    //   requestAnimationFrame(() => this.checkOverlayOverflow());
    // }
  }

  /** Slide mutation helpers (with detectChanges) */
  private setActiveSlides(slides: Slide[]): void {
    this.activeSlides = slides;
    this.cdr.detectChanges(); // Tell Angular it's okay, now reconcile the view
  }

  private unshiftSlide(slide: Slide): void {
    this.activeSlides.unshift(slide);
    this.cdr.detectChanges(); // Tell Angular it's okay, now reconcile the view
  }

  private popSlide(): void {
    this.activeSlides.pop();
    this.cdr.detectChanges(); // Tell Angular it's okay, now reconcile the view
  }

  private setSlideVisible(visible: boolean, index: number): void {
    if (this.activeSlides[index]) {
      this.activeSlides[index].visible = visible;
      this.cdr.detectChanges(); // Tell Angular it's okay, now reconcile the view
    }
  }
}

/** Slide model */
export interface Slide {
  imageUrl: string;
  title: string;
  description: string;
  style?: { [key: string]: string };
  visible?: boolean;
  duration?: number;
}
