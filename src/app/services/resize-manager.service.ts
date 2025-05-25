import { Injectable, OnDestroy } from '@angular/core';
import { EventService } from './event.service';
import { PlatformService } from './platform.service';

@Injectable({
  providedIn: 'root',
})
export class ResizeManager {
  private boundResizeHandler!: () => void;

  constructor(
    private eventService: EventService,
    private platformService: PlatformService
  ) {
    this.boundResizeHandler = this.onResize.bind(this);
  }

  init(): void {
    if (!this.platformService.isBrowser()) return;
    window.addEventListener('resize', this.boundResizeHandler);

    // Optional: emit once immediately
    this.eventService.emitResizeEvent();
  }

  destroy(): void {
    if (this.platformService.isBrowser()) {
      window.removeEventListener('resize', this.boundResizeHandler);
    }
  }

  private onResize(): void {
    this.eventService.emitResizeEvent();
  }
}
