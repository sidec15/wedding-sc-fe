import { Injectable } from '@angular/core';
import { PlatformService } from './platform.service';
import Lenis from 'lenis';
import { EventService } from './event.service';

@Injectable({
  providedIn: 'root',
})
export class ScrollManagerService {
  private lenis!: Lenis;
  private rafId = 0;

  private touchStartX = 0;
  private touchEndX = 0;

  private previousScrollYValue = 0; // Store the previous scroll Y value

  private readonly lenisDuration = 2.5; // Duration for Lenis smooth scroll
  private readonly swipeCloseThreshold = 50; // Minimum distance to trigger swipe close in pixels

  constructor(
    private platformService: PlatformService,
    private eventService: EventService
  ) {}

  public init() {
    if (this.platformService.isBrowser()) {
      this.initScrollTracker();
      this.initSwipeListeners();
    }
  }

  destroy(): void {
    cancelAnimationFrame(this.rafId);
    window.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchend', this.onTouchEnd);
  }

  // ###################################################
  // EventsEmitter
  // ###################################################
  // Scroll event handler
  private initScrollTracker(): void {
    if (!this.platformService.isBrowser()) return;

    this.lenis = new Lenis({
      duration: this.lenisDuration,
      // smooth: true,
    });

    const raf = (time: number) => {
      this.lenis.raf(time);

      // Get scroll position from Lenis
      const scrollY = this.lenis.scroll;

      // Emit scroll event with scroll position only if the scroll really changed
      if (Math.abs(scrollY - this.previousScrollYValue) > 0.1) {
        this.eventService.emitScrollEvent(
          scrollY,
          scrollY - this.previousScrollYValue
        ); // Emit the scroll event
        this.previousScrollYValue = scrollY; // Update the previous scroll Y value
      }

      this.rafId = requestAnimationFrame(raf);
    };

    this.rafId = requestAnimationFrame(raf);
  }

  // Swipe close event handler
  private onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  private onTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].screenX;
    this.swipeCloseEventEmit();
  }

  private initSwipeListeners(): void {
    window.addEventListener('touchstart', this.onTouchStart);
    window.addEventListener('touchend', this.onTouchEnd);
  }

  private swipeCloseEventEmit(): void {
    // Emit swipe close event swipe from right to left if the swipe distance is greater than the threshold
    const swipeDistance = this.touchEndX - this.touchStartX;
    if (swipeDistance < -this.swipeCloseThreshold) {
      this.eventService.emitSwipeCloseEvent(swipeDistance);
    }
  }
}
