import { Injectable, OnDestroy } from '@angular/core';
import { ResizeManager } from './resize-manager.service';
import { EventService } from './event.service';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ViewportHeightService {
  private resizeSub!: Subscription;

  constructor(private eventService: EventService) {}

  init(): void {
    this.updateFullHeight();
    this.resizeSub = this.eventService.resizeEvent$.subscribe(() => {
      this.updateFullHeight();
    });
  }

  destroy(): void {
    this.resizeSub?.unsubscribe();
  }

  private updateFullHeight(): void {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
}
