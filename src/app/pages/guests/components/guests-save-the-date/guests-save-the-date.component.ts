import { Component } from '@angular/core';
import { EventService } from '../../../../services/event.service';
import { ImageFocusComponent } from '../../../../components/image-focus/image-focus.component';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-guests-save-the-date',
  imports: [TranslateModule, ImageFocusComponent, CommonModule],
  templateUrl: './guests-save-the-date.component.html',
  styleUrl: './guests-save-the-date.component.scss',
})
export class GuestsSaveTheDateComponent {
  isGalleryOpen = false;
  isCalendarModalOpen = false;
  imageUrl = '/images/guests/save-the-date/save-the-date-01.jpg';
  googleUrl = '';
  microsoftUrl = '';
  appleUrl = '';

  constructor(private eventService: EventService) {
    this.prepareCalendarUrls();
  }

  private prepareCalendarUrls() {
    const eventTitle = 'Matrimonio Chiara & Simone';
    const eventDate = new Date('2025-10-10T15:00:00+02:00'); // Europe/Rome timezone

    // Google Calendar
    this.googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${eventDate.toISOString().replace(/-|:|\.\d+/g, '')}&ctz=Europe/Rome`;

    // Microsoft Calendar
    this.microsoftUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(eventTitle)}&startdt=${eventDate.toISOString()}&timezone=Europe/Rome`;

    // Apple Calendar
    this.appleUrl = `data:text/calendar;charset=utf-8,BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART;TZID=Europe/Rome:${eventDate.toISOString().replace(/-|:|\.\d+/g, '')}
SUMMARY:${eventTitle}
END:VEVENT
END:VCALENDAR`;
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

  openCalendarModal(): void {
    this.isCalendarModalOpen = true;
    this.eventService.emitRingScrollEnabled(false);
  }

  closeCalendarModal(event: Event): void {
    event.stopPropagation();
    this.isCalendarModalOpen = false;
    this.eventService.emitRingScrollEnabled(true);
  }
}
