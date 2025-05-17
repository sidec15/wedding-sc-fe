import {
  AfterViewInit,
  Component,
  ElementRef,
  input,
  InputSignal,
  OnDestroy,
  OnInit,
  ViewChild,
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
import { MinimiComponent } from '../../pages/church/components/minimi/minimi.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgFor, NgStyle } from '@angular/common';

@Component({
  selector: 'app-carousel',
  imports: [TranslateModule, NgFor, NgStyle],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss',
  animations: [
    trigger('fadeSlide', [
      state('visible', style({ opacity: 1 })),
      state('hidden', style({ opacity: 0 })),
      transition('visible => hidden', [
        //todo_here
        animate(1000 + 'ms ease-out'),
      ]),
      transition('hidden => visible', [animate(2000 + 'ms ease-in')]),
    ]),
  ],
})
export class CarouselComponent implements OnInit, AfterViewInit, OnDestroy {
  /** Duration for fade-out animation in milliseconds */
  fadeOutDuration: InputSignal<number> = input(1000);
  /** Duration for fade-in animation in milliseconds */
  fadeInDuration: InputSignal<number> = input(2000);
  /** Interval duration in milliseconds */
  intervalValue: InputSignal<number> = input(5000);

  /** Slides to be displayed in the carousel */
  slides: InputSignal<Slide[]> = input.required();

  private slideSub!: Subscription;
  private scrollEventSubscription!: Subscription;
  private slideTimeoutId!: NodeJS.Timeout;
  private isSlideShowActive = false;
  private mySlides: Slide[] = [];
  private rafId: number | null = null;

  @ViewChild('carousel', { static: false })
  carouselSectionRef!: ElementRef<HTMLElement>;

  currentSlideIndex = 0;
  activeSlides: Slide[] = [];
  fadeState: 'visible' | 'hidden' = 'visible';

  progress = 100; // 100 to 0

  constructor(
    private platformService: PlatformService,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.mySlides = this.slides();
  }

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

    this.scrollEventSubscription = this.eventService.scrollEvent$.subscribe(
      (e: ScrollEvent) => {
        if (
          !this.platformService.isVisible(this.carouselSectionRef.nativeElement)
        ) {
          if (this.isSlideShowActive) {
            this.stopSlideShow();
          }
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
    this.activeSlides = [{ ...this.mySlides[0], visible: true }];
    this.currentSlideIndex = 0;
    this.startProgressBar(this.mySlides[0].duration ?? this.intervalValue());
    this.scheduleNextSlide();
  }

  private scheduleNextSlide(): void {
    const currentSlide = this.mySlides[this.currentSlideIndex];
    const duration = currentSlide.duration ?? this.intervalValue();

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
    const currentSlide = this.mySlides[this.currentSlideIndex];
    const duration = currentSlide.duration ?? this.intervalValue();
    this.startProgressBar(duration);
  }

  private handleSlideAnimation() {
    if (this.slideTimeoutId) clearTimeout(this.slideTimeoutId); // Add this line

    const nextIndex = (this.currentSlideIndex + 1) % this.mySlides.length;

    // Hide current
    this.activeSlides[0].visible = false;

    // Show next
    this.activeSlides.unshift({ ...this.mySlides[nextIndex], visible: true });

    // Remove old slide after fade-out
    setTimeout(() => {
      this.activeSlides.pop();
      this.currentSlideIndex = nextIndex;
    }, this.fadeOutDuration());
  }

  private goToSlide(direction: 1 | -1): void {
    // Cancel any existing animations
    this.stopSlideShow();

    const slidesCount = this.mySlides.length;
    let newIndex =
      (this.currentSlideIndex + direction + slidesCount) % slidesCount;

    // Hide current
    this.activeSlides[0].visible = false;

    const mySlides = this.mySlides;

    // Show next
    this.activeSlides.unshift({ ...mySlides[newIndex], visible: true });

    this.currentSlideIndex = newIndex;

    setTimeout(() => {
      // Restart progress bar and auto-advance
      const duration =
        mySlides[this.currentSlideIndex].duration ?? this.intervalValue();
      this.startProgressBar(duration);
      this.scheduleNextSlide();
    }, this.fadeOutDuration());
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
