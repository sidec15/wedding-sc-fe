import { Component } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { ParallaxCardComponent } from './components/parallax-card/parallax-card.component';
import { GalleryComponent } from './components/gallery/gallery.component';
import { EventService } from '../../../services/event.service';
import { RingScrollComponent } from '../../../components/ring-scroll/ring-scroll.component';
import { CardsService as CardService } from '../services/cards.service';
import { Card } from '../models/card';

@Component({
  selector: 'app-our-story-mobile',
  standalone: true,
  imports: [
    ParallaxCardComponent,
    RingScrollComponent,
    TranslateModule,
    GalleryComponent
],
  templateUrl: './our-story.mobile.component.html',
  styleUrls: ['./our-story.mobile.component.scss'],
  providers: [CardService]
})
export class OurStoryMobileComponent {
  cards: Card[] = [];

  constructor(
    private eventService: EventService,
    private cardService: CardService
  ) {
    this.cards = this.cardService.getCards();
  }

  openGallery(index: number): void {
    const currentCard = this.cardService.getCardByIndex(index);
    if (currentCard?.type === 'card') {
      this.eventService.emitRingScrollEnabled(false);
      this.eventService.emitGalleryStatus({
        isOpen: true,
        currentIndex: index - 1,
      });
    }
  }

  closeGallery(): void {
    this.eventService.emitRingScrollEnabled(true);
    this.eventService.emitGalleryStatus({
      isOpen: false,
      currentIndex: 0,
    });
  }
}
