import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  OnDestroy,
} from '@angular/core';
import { EventService } from '../services/event.service';
import { constants } from '../constants';
import { PlatformService } from '../services/platform.service';

/**
 * Directive that observes the visibility of the host element and emits
 * an event to control the header background fill state.
 *
 * Usage example:
 * <section appHeaderBgFillObserver [fillOnVisible]="false"></section>
 *
 * Behavior:
 * - If [fillOnVisible]="true", the header will be filled when the element becomes visible.
 * - If [fillOnVisible]="false" (default), the header will be filled when the element is NOT visible.
 */
@Directive({
  selector: '[appHeaderBgFillObserver]',
})
export class HeaderBgFillObserverDirective implements AfterViewInit, OnDestroy {
  /**
   * Controls whether the header should be filled when the element is visible.
   * - true  → fill header when element is visible
   * - false → fill header when element is NOT visible (default)
   */
  @Input() fillOnVisible: boolean = false;
  /**
   * Optional input to enable or disable the directive.
   */
  @Input() isEnabled: boolean = true;

  /** Tracks current header fill state to avoid emitting duplicate events */
  private isHeaderBgFilled = constants.IS_HEADER_FILLED;

  /** IntersectionObserver instance used to track element visibility */
  private observer!: IntersectionObserver;

  constructor(
    private hostRef: ElementRef<HTMLElement>,
    private eventService: EventService,
    private platformService: PlatformService
  ) {}

  /**
   * Initializes the IntersectionObserver once the view is ready.
   * Subscribes to visibility changes of the host element.
   */
  ngAfterViewInit(): void {
    if(!this.isEnabled || !this.platformService.isPlatformReady()) return;

    const element = this.hostRef.nativeElement;

    this.observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;

        // Determine desired header state based on configuration
        const shouldBeFilled = this.fillOnVisible ? isVisible : !isVisible;

        // Only emit if the state has changed
        if (shouldBeFilled !== this.isHeaderBgFilled) {
          this.isHeaderBgFilled = shouldBeFilled;
          this.eventService.emitHeaderBackgroundFillEvent(shouldBeFilled);
        }
      },
      {
        threshold: 0.01, // Trigger when even 1% of the element is visible
      }
    );

    this.observer.observe(element);
  }

  /**
   * Cleans up the observer and resets header state on component destruction.
   */
  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.eventService.emitHeaderBackgroundFillResetEvent();
  }
}
