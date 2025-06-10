import { Component } from '@angular/core';
import { GalleryComponent } from '../../../our-story/components/gallery/gallery.component';
import { EventService } from '../../../../services/event.service';

@Component({
  selector: 'app-guests-save-the-date',
  imports: [GalleryComponent],
  templateUrl: './guests-save-the-date.component.html',
  styleUrl: './guests-save-the-date.component.scss',
})
export class GuestsSaveTheDateComponent {
  isGalleryOpen = false;
  readonly imageUrl = '/images/guests/save-the-date.jpg';

  constructor(private eventService: EventService) {}

  private card = {
    type: 'card',
    image: '/images/guests/save-the-date.jpg',
  };

  openGallery(): void {
    this.eventService.emitRingScrollEnabled(false);
    this.eventService.emitGalleryStatus({
      isOpen: true,
      currentIndex: 0,
    });
  }

  closeGallery(): void {
    this.eventService.emitRingScrollEnabled(true);
    this.eventService.emitGalleryStatus({
      isOpen: false,
      currentIndex: 0,
    });
  }

  downloadImage() {
    const link = document.createElement('a');
    link.href = this.imageUrl;
    link.download = 'chiara-e-simonesave-the-date.jpg';
    link.click();
  }
}
