import { Injectable } from '@angular/core';
import {
  EventService,
  HeaderBackgroundEvent,
  ScrollEvent,
} from './event.service';
import { PlatformService } from './platform.service';
import { Subscription, throttleTime } from 'rxjs';
import { MenuService } from './menu.service';

@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  private _isHeaderHidden = false; // Track whether the header is hidden
  private _isEnabled = true; // Track whether the header animation is enabled
  private _isHeaderFilled = false; // Track whether the header background is filled

  private readonly minDistanceToHideHeader = 1; // Minimum distance to hide the header in pixels
  private readonly minDistanceToShowHeader = 5; // Minimum distance to show the header in pixels

  private scrollSub!: Subscription;
  private headerBgSub!: Subscription;

  constructor(
    private platformService: PlatformService,
    private eventService: EventService,
    private menuService: MenuService
  ) {}

  init(): void {
    if (!this.platformService.isBrowser()) return;
    // Subscribe to scroll events to handle header visibility
    this.scrollSub = this.eventService.scrollEvent$
      .pipe(throttleTime(16)) // Throttle scroll events to 60 FPS
      .subscribe((event: ScrollEvent) => {
        this.handleScrollEvent(event);
      });

    this.headerBgSub = this.eventService.headerBackgroundSubject$.subscribe(
      (e: HeaderBackgroundEvent) => {
        this._isHeaderFilled = e.fillBackground; // Update header background state
      }
    );
  }

  destroy(): void {
    this.scrollSub?.unsubscribe();
    this.headerBgSub?.unsubscribe();
  }

  get isHeaderHidden(): boolean {
    return this._isHeaderHidden;
  }

  get isHeaderFilled(): boolean {
    return this._isHeaderFilled;
  }

  enableAnimation(): void {
    this._isEnabled = true; // Enable header animation
    this._isHeaderHidden = false; // Ensure header is visible when enabled
  }

  disableAnimation(): void {
    this._isEnabled = false; // Disable header animation
    this._isHeaderHidden = false; // Ensure header is visible when disabled
  }

  enableHeader(): void {
    this._isHeaderHidden = false; // Ensure header is visible when enabled
  }

  disableHeader(): void {
    this._isHeaderHidden = true; // Ensure header is hidden when disabled
  }

  handleScrollEvent(event: ScrollEvent): void {
    if (this.menuService.isMenuOpened() || this.menuService.isMenuClosing())
      return; // Ignore scroll event if menu is open or closing

    if (!this._isEnabled) return; // If header animation is disabled, do nothing

    if (
      event.scrollDirection() === 'down' &&
      event.scrollYOffset > this.minDistanceToHideHeader
    ) {
      this._isHeaderHidden = true;
    } else if (
      event.scrollDirection() === 'up' &&
      event.scrollYOffset < -this.minDistanceToShowHeader
    ) {
      this._isHeaderHidden = false;
    }
  }
}
