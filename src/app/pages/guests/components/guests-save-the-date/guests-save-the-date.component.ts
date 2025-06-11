import { Component } from '@angular/core';
import { EventService } from '../../../../services/event.service';
import { ImageFocusComponent } from '../../../../components/image-focus/image-focus.component';

@Component({
  selector: 'app-guests-save-the-date',
  imports: [ImageFocusComponent],
  templateUrl: './guests-save-the-date.component.html',
  styleUrl: './guests-save-the-date.component.scss',
})
export class GuestsSaveTheDateComponent {
  isGalleryOpen = false;
  imageUrl = '/images/guests/save-the-date/save-the-date-01.jpg';

  constructor(private eventService: EventService) {}

  openGallery(): void {
    this.isGalleryOpen = true;
    this.eventService.emitRingScrollEnabled(false);
  }

  closeGallery(): void {
    this.isGalleryOpen = false;
    this.eventService.emitRingScrollEnabled(true);
  }

  downloadImage() {
    const link = document.createElement('a');
    link.href = this.imageUrl;
    link.download = 'chiara-e-simonesave-the-date.jpg';
    link.click();
  }
}
