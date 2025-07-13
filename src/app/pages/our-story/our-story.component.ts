import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';

import { CardModel } from './models/card';
import { RingScrollComponent } from '../../components/ring-scroll/ring-scroll.component';
import { TranslateModule } from '@ngx-translate/core';
import { StoryCardsProviderService } from './services/story-cards-provider.service';
import { EventService } from '../../services/event.service';
import { DateTimeService } from '../../services/date-time.service';
import { HeaderService } from '../../services/header.service';

@Component({
  selector: 'app-parallax-showcase',
  standalone: true,
  imports: [
    TranslateModule,
    NgClass
  ],
  templateUrl: './our-story.component.html',
  styleUrls: ['./our-story.component.scss'],
  providers: [StoryCardsProviderService]
})
export class OurStoryComponent implements OnInit, OnDestroy {
  @ViewChild('galleryContainer', { static: true }) galleryContainer!: ElementRef;

  cards: CardModel[] = [];
  currentIndex: number = 0;

  constructor(
    private eventService: EventService,
    private storycardsProvider: StoryCardsProviderService,
    public dateTimeService: DateTimeService,
    private headerService: HeaderService
  ) {
    this.cards = this.storycardsProvider.getCards();
  }

  ngOnInit(): void {
    this.headerService.setMinDistanceToShowHeader(1);
    // Focus the component for keyboard navigation
    if (typeof window !== 'undefined') {
      const element = document.querySelector('.story-gallery');
      if (element) {
        (element as HTMLElement).focus();
      }
    }
  }

  ngOnDestroy(): void {
    this.headerService.resetMinDistanceToShowHeader();
  }

  previousCard(): void {
    if (this.currentIndex > 0) {
      // current card must disappear
      this.cards[this.currentIndex].status = 'hidden';
      this.cards[this.currentIndex].position = 'before';

      // next card must appear
      this.cards[this.currentIndex - 1].status = 'visible';
      this.cards[this.currentIndex - 1].position = 'current';
      this.currentIndex--;
    }
  }

  nextCard(): void {
    if (this.currentIndex < this.cards.length - 1) {
      // current card must disappear
      this.cards[this.currentIndex].status = 'hidden';
      this.cards[this.currentIndex].position = 'after';

      // next card must appear
      this.cards[this.currentIndex + 1].status = 'visible';
      this.cards[this.currentIndex + 1].position = 'current';
      this.currentIndex++;

    }
  }

  @HostListener('keydown', ['$event'])
  handleKeyboardNavigation(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.previousCard();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.nextCard();
        break;
      case 'Home':
        event.preventDefault();
        this.currentIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        this.currentIndex = this.cards.length - 1;
        break;
    }
  }

}
