import { Component, input, signal } from '@angular/core';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-image-focus',
  imports: [],
  templateUrl: './image-focus.component.html',
  styleUrls: ['./image-focus.component.scss'],
})
export class ImageFocusComponent {
  imageUrl = input.required<string>();
  isVisible = signal(false);

  constructor(private eventService: EventService) {}

  show() {
    this.isVisible.set(true);
    this.eventService.emitRingScrollEnabled(false);
    // Block scroll methods but allow zoom
    document.body.style.overflow = 'hidden';
    document.addEventListener('wheel', this.preventScroll, { passive: false });
    document.addEventListener('touchmove', this.preventScrollButAllowZoom, { passive: false });
    document.addEventListener('keydown', this.preventScrollKeys, { passive: false });
  }

  hide() {
    this.isVisible.set(false);
    this.eventService.emitRingScrollEnabled(true);
    // Restore scroll
    document.body.style.overflow = '';
    document.removeEventListener('wheel', this.preventScroll);
    document.removeEventListener('touchmove', this.preventScrollButAllowZoom);
    document.removeEventListener('keydown', this.preventScrollKeys);
  }

  private preventScroll = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  }

  private preventScrollButAllowZoom = (e: TouchEvent) => {
    // Allow pinch-to-zoom (multi-touch gestures)
    if (e.touches.length > 1) {
      return; // Don't prevent multi-touch events (zoom)
    }
    
    // Prevent single-touch scrolling
    e.preventDefault();
    e.stopPropagation();
  }

  private preventScrollKeys = (e: KeyboardEvent) => {
    // Block arrow keys, page up/down, home, end, space
    const scrollKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End', ' '];
    if (scrollKeys.includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  onClose() {
    this.hide();
  }
}
