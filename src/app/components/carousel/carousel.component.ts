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
import { Observable, Subscription } from 'rxjs';
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
import { NgClass, NgStyle } from '@angular/common';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-carousel',
  imports: [TranslateModule, NgStyle, NgClass, AsyncPipe],
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
  _overlayStatus: 'expanded' | 'collapsed' | 'hidden' = 'collapsed';
  isMobile$: Observable<boolean>;

  /** Internals */
  private slideSub!: Subscription;
  private scrollEventSubscription!: Subscription;
  private slideTimeoutId!: NodeJS.Timeout | null;
  private isSlideShowActive = false;
  private isPaused = false;
  private slideStartTimestamp = 0;
  private progressAtPause = 0;

  private mySlides: Slide[] = [];
  private rafId: number | null = null;

  constructor(
    private platformService: PlatformService,
    private eventService: EventService,
    private cdr: ChangeDetectorRef
  ) {
    this.isMobile$ = this.eventService.isMobile$;
  }

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

  get totalSlides(): number {
    return this.mySlides.length;
  }

  get overlayStatus(): 'expanded' | 'collapsed' | 'hidden' {
    return this._overlayStatus;
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
    if (this.isSlideShowActive) return;

    this.isSlideShowActive = true;
    this.setActiveSlides([{ ...this.mySlides[0], visible: true }]);
    this.currentSlideIndex = 0;
    this.onSlideVisible();

    this.startProgressBar(this.getCurrentSlideDuration());
  }

  private stopSlideShow(): void {
    if (!this.isSlideShowActive) return;

    this.isSlideShowActive = false;

    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.slideTimeoutId) clearTimeout(this.slideTimeoutId);
  }

  private pauseSlideshow(): void {
    if (!this.isSlideShowActive || this.isPaused) return;

    this.isPaused = true;

    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.slideTimeoutId) {
      clearTimeout(this.slideTimeoutId);
    }

    // Capture how far the progress bar was
    this.progressAtPause = this.progress;
  }

  private resumeSlideshow(): void {
    if (!this.isSlideShowActive || !this.isPaused) return;

    this.isPaused = false;

    this.startProgressBar(this.getCurrentSlideDuration(), this.progressAtPause);
  }

  private handleSlideTransition(nextIndex: number): void {
    if (this.slideTimeoutId) {
      clearTimeout(this.slideTimeoutId);
      this.slideTimeoutId = null;
    }

    // Visually fade out current slide
    this.disableCurrentSlide();

    // Show next slide immediately for progress/timing sync
    this.enabledSlide({ ...this.mySlides[nextIndex], visible: true });
    this.currentSlideIndex = nextIndex;
    this.onSlideVisible();

    // Delay pop only for visual fade-out effect (optional)
    setTimeout(() => {
      this.popSlide();
    }, this.fadeOutDuration());
  }

  private getCurrentSlideDuration(): number {
    return (
      this.mySlides[this.currentSlideIndex].duration ?? this.intervalValue()
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

      if (this.progress > 0 && !this.isPaused) {
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

  /** Overlay logic */
  private onSlideVisible(): void {
    // this._overlayStatus = 'collapsed';
    requestAnimationFrame(() => this.checkOverlayOverflow());
  }

  private checkOverlayOverflow(): void {
    if (!this.platformService.isBrowser() || !this.overlayRef) return;

    const el = this.overlayRef.nativeElement;
    const result = el.scrollHeight > el.clientHeight;
    this.shouldShowMore = result;
  }

  toggleExpandedState(opening: boolean): void {
    const prevaviousState = this._overlayStatus;
    if (opening) {
      if (this._overlayStatus === 'hidden') {
        this._overlayStatus = 'collapsed';
      } else if (this._overlayStatus === 'collapsed') {
        this._overlayStatus = 'expanded';
      }
    } else {
      if (this._overlayStatus === 'expanded') {
        this._overlayStatus = 'collapsed';
      } else if (this._overlayStatus === 'collapsed') {
        this._overlayStatus = 'hidden';
      }
    }

    if (this._overlayStatus === 'expanded') {
      this.pauseSlideshow();
    }
    if (prevaviousState === 'expanded') {
      this.resumeSlideshow();
    }
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
    const total = this.mySlides.length;
    const nextIndex = (this.currentSlideIndex + direction + total) % total;
    return nextIndex;
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
