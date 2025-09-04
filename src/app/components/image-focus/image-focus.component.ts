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
  }

  hide() {
    this.isVisible.set(false);
    this.eventService.emitRingScrollEnabled(true);
  }

  onClose() {
    this.hide();
  }
}
