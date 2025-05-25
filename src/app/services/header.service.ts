import { Injectable } from '@angular/core';
import { EventService, ScrollEvent } from './event.service';
import { PlatformService } from './platform.service';
import { Subscription } from 'rxjs';
import { MenuService } from './menu.service';

@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  isHeaderHidden = false; // Track whether the header is hidden
  private readonly minDistanceToHideHeader = 1; // Minimum distance to hide the header in pixels
  private readonly minDistanceToShowHeader = 5; // Minimum distance to show the header in pixels

  private scrollSub!: Subscription;

  constructor(
    private platformService: PlatformService,
    private eventService: EventService,
    private menuService: MenuService
  ) {}

  init(): void {
    if (!this.platformService.isBrowser()) return;
    // Subscribe to scroll events to handle header visibility
    this.scrollSub = this.eventService.scrollEvent$.subscribe(
      (event: ScrollEvent) => {
        this.handleScrollEvent(event);
      }
    );
  }

  destroy(): void {
    this.scrollSub?.unsubscribe();
  }

  handleScrollEvent(event: ScrollEvent): void {
    if (this.menuService.isMenuOpened() || this.menuService.isMenuClosing())
      return; // Ignore scroll event if menu is open or closing
    if (
      event.scrollDirection() === 'down' &&
      event.scrollYOffset > this.minDistanceToHideHeader
    ) {
      this.isHeaderHidden = true;
    } else if (
      event.scrollDirection() === 'up' &&
      event.scrollYOffset < -this.minDistanceToShowHeader
    ) {
      this.isHeaderHidden = false;
    }
  }
}
