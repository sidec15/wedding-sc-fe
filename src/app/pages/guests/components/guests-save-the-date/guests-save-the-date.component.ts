import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { EventService } from '../../../../services/event.service';
import { ImageFocusComponent } from '../../../../components/image-focus/image-focus.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import 'add-to-calendar-button';

@Component({
  selector: 'app-guests-save-the-date',
  imports: [TranslateModule, ImageFocusComponent, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './guests-save-the-date.component.html',
  styleUrl: './guests-save-the-date.component.scss',
  host: {
    ngSkipHydration: 'true'
  }
})
export class GuestsSaveTheDateComponent {
  isGalleryOpen = false;
  isCalendarModalOpen = false;
  imageUrl = '/images/guests/save-the-date/save-the-date-01.jpg';
  googleUrl = '';
  microsoftUrl = '';
  appleUrl = '';
  currentLang: string;

  constructor(private eventService: EventService, private translate: TranslateService) {
    this.currentLang = this.translate.currentLang;
    this.translate.onLangChange.subscribe(event => {
      this.currentLang = event.lang;
    });
  }

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
    link.download = 'chiara-e-simone-save-the-date.jpg';
    link.click();
  }
}
