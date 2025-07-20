import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { PlatformService } from '../../../../../services/platform.service';

import { EventService } from '../../../../../services/event.service';
import { Card } from '../../../models/card';
import { CardsService } from '../../../services/cards.service';

@Component({
  selector: 'app-gallery',
  imports: [TranslateModule],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss',
})
export class GalleryComponent implements OnInit, OnDestroy {
  private subscription!: Subscription;

  cards: Card[] = [];
  currentCardIndex: number = 0;
  currentCard: Card = {} as Card;
  isGalleryOpen: boolean = false;

  constructor(
    private platformService: PlatformService,
    private eventService: EventService,
    private checngeDetector: ChangeDetectorRef,
    private cardsService: CardsService,
  ) {
    this.cards = this.cardsService.getCards()
    .filter((card) => card.type === 'card');
  }

  ngOnInit(): void {
    if (!this.platformService.isBrowser()) return;
    this.subscription = this.eventService.galleryStatus$.subscribe(
      (status) => {
        if (status.isOpen) {
          this.openGallery(status.currentIndex);
        } else {
          this.closeGallery();
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (!this.platformService.isBrowser()) return;
    this.subscription.unsubscribe();
    this.unlockScroll();
  }

  openGallery(index: number): void {
    if (this.cards.length > 0) {
      this.currentCardIndex = index;
      this.currentCard = this.cards[index];
      this.isGalleryOpen = true;
      this.lockScroll();
      this.checngeDetector.detectChanges(); // Ensure the view is updated
    }
  }

  closeGallery(): void {
    this.isGalleryOpen = false;
    this.unlockScroll();
  }

  prevCard(): void {
    if (this.currentCardIndex > 0) {
      this.currentCardIndex--;
      this.currentCard = this.cards[this.currentCardIndex];
      this.checngeDetector.detectChanges(); // Ensure the view is updated
    }
  }

  nextCard(): void {
    if (this.currentCardIndex < this.cards.length - 1) {
      this.currentCardIndex++;
      this.currentCard = this.cards[this.currentCardIndex];
      this.checngeDetector.detectChanges(); // Ensure the view is updated
    }
  }

  private lockScroll(): void {
    if(!this.platformService.isBrowser()) return;
    document.body.style.overflow = 'hidden';
  }

  private unlockScroll(): void {
    if(!this.platformService.isBrowser()) return;
    document.body.style.overflow = '';
  }
}
