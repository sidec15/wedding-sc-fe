import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { NgClass, NgIf } from '@angular/common';

import { ParallaxCardModel } from './models/parallax-card';
import { RingScrollComponent } from '../../components/ring-scroll/ring-scroll.component';
import { TranslateModule } from '@ngx-translate/core';
import { StoryCardsProviderService } from './services/story-cards-provider.service';
import { ParallaxCardComponent } from './components/parallax-card/parallax-card.component';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-parallax-showcase',
  standalone: true,
  imports: [
    ParallaxCardComponent,
    TranslateModule,
    NgIf,
    NgClass
  ],
  templateUrl: './our-story.component.html',
  styleUrls: ['./our-story.component.scss'],
  providers: [StoryCardsProviderService],
  animations: [
    trigger('slideAnimation', [
      transition(':increment', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('600ms ease-out', style({ transform: 'translateX(0%)', opacity: 1 }))
      ]),
      transition(':decrement', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('600ms ease-out', style({ transform: 'translateX(0%)', opacity: 1 }))
      ])
    ])
  ]
})
export class OurStoryComponent implements OnInit, OnDestroy {
  @ViewChild('galleryContainer', { static: true }) galleryContainer!: ElementRef;

  cards: ParallaxCardModel[] = [];
  currentIndex: number = 0;
  private touchStartX: number = 0;
  private touchEndX: number = 0;
  private readonly SWIPE_THRESHOLD = 50;

  constructor(
    private eventService: EventService,
    private storycardsProvider: StoryCardsProviderService
  ) {
    this.cards = this.storycardsProvider.getCards();
  }

  ngOnInit(): void {
    // Focus the component for keyboard navigation
    if (typeof window !== 'undefined') {
      const element = document.querySelector('.story-gallery');
      if (element) {
        (element as HTMLElement).focus();
      }
    }
  }

  ngOnDestroy(): void {
    // Cleanup if needed
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

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0].clientX;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].clientX;
    this.handleSwipe();
  }

  private handleSwipe(): void {
    const swipeDistance = this.touchEndX - this.touchStartX;

    if (Math.abs(swipeDistance) > this.SWIPE_THRESHOLD) {
      if (swipeDistance > 0) {
        // Swipe right - go to previous
        this.previousCard();
      } else {
        // Swipe left - go to next
        this.nextCard();
      }
    }
  }

  previousCard(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  nextCard(): void {
    if (this.currentIndex < this.cards.length - 1) {
      this.currentIndex++;
    }
  }

  openGallery(index: number): void {
    const currentCard = this.storycardsProvider.getCard(index);
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
