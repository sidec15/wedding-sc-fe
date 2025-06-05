import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  OnDestroy,
} from '@angular/core';
import { Subscription, throttleTime } from 'rxjs';
import { EventService } from '../services/event.service';
import { PlatformService } from '../services/platform.service';
import { constants } from '../constants';

/**
 * Directive that observes the visibility of the host element and emits an event
 * to update the header background fill state accordingly.
 *
 * Usage:
 * <section appHeaderBgFillObserver [fillOnVisible]="true"></section>
 *
 * - If `fillOnVisible` is `true`, the header will be filled when the element is visible.
 * - If `fillOnVisible` is `false` (default), the header will be filled when the element is NOT visible.
 */
@Directive({
  selector: '[appHeaderBgFillObserver]',
})
export class HeaderBgFillObserverDirective implements AfterViewInit, OnDestroy {
  /**
   * Determines whether the header should be filled when the element is visible.
   * If false, the header will be filled when the element is not visible.
   */
  @Input() fillOnVisible: boolean = false;

  /** Initial state of whether the header is currently filled */
  private isHeaderBgFilled = constants.IS_HEADER_FILLED;

  /** Subscription to scroll event stream */
  private scrollSub!: Subscription;

  constructor(
    private hostRef: ElementRef<HTMLElement>,
    private platformService: PlatformService,
    private eventService: EventService
  ) {}

  /** Subscribes to scroll events after the view is initialized */
  ngAfterViewInit(): void {
    if (!this.platformService.isBrowser()) return;

    this.scrollSub = this.eventService.scrollEvent$
      .pipe(throttleTime(16)) // Throttle for performance (~60fps)
      .subscribe(() => {
        this.updateHeaderBackgroundFill();
      });
  }

  /** Cleanup on destroy */
  ngOnDestroy(): void {
    this.eventService.emitHeaderBackgroundFillEvent(true); // Reset to default
    this.scrollSub?.unsubscribe();
  }

  /** Core logic to determine and emit header background fill state */
  private updateHeaderBackgroundFill(): void {
    const el = this.hostRef?.nativeElement;
    if (!el) return;

    const isVisible = this.platformService.isVisible(el);

    // Determine desired fill state based on visibility and config
    const shouldBeFilled = this.fillOnVisible ? isVisible : !isVisible;

    // Emit only if state changed
    if (shouldBeFilled !== this.isHeaderBgFilled) {
      this.isHeaderBgFilled = shouldBeFilled;
      this.eventService.emitHeaderBackgroundFillEvent(shouldBeFilled);
    }
  }
}
