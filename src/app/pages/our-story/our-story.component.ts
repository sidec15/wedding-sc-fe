import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';

import { ParallaxCardModel } from './models/parallax-card';
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

  cards: ParallaxCardModel[] = [];
  currentIndex: number = 0;
  private touchStartX: number = 0;
  private touchEndX: number = 0;
  private readonly SWIPE_THRESHOLD = 50;
  private isAnimating = false;
  isTransitioning = false;

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
    if (this.currentIndex > 0 && !this.isAnimating) {
      this.isAnimating = true;
      this.isTransitioning = true;

      // Fade out current content
      setTimeout(() => {
        this.currentIndex--;
        this.isTransitioning = false;

        // Reset animation flag after transition
        setTimeout(() => {
          this.isAnimating = false;
        }, 800);
      }, 300); // Fade out duration
    }
  }

  nextCard(): void {
    if (this.currentIndex < this.cards.length - 1 && !this.isAnimating) {
      this.isAnimating = true;
      this.isTransitioning = true;

      // Fade out current content
      setTimeout(() => {
        this.currentIndex++;
        this.isTransitioning = false;

        // Reset animation flag after transition
        setTimeout(() => {
          this.isAnimating = false;
        }, 800);
      }, 300); // Fade out duration
    }
  }

}
